import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Intro } from './components/Intro'
import { CameraCard } from './components/CameraCard'
import { HeartRateCard } from './components/HeartRateCard'
import { GraphCard } from './components/GraphCard'
import { SessionResult } from './components/SessionResult'
import { RGBFrame, BPMEstimate, DetectedFace, SignalQuality, SessionSummary } from './types'
import { captureFrameRGB } from './camera/frameCapture'
import { detectFace, getSkinRegions, initFaceLandmarker } from './faceDetection/faceLandmarker'
import { estimateBPM } from './signalProcessing/bpmEstimator'
import { calculateSignalQuality, shouldDisplayBPM } from './signalProcessing/confidence'
import { SIGNAL_CONFIG } from './signalProcessing/types'
import './styles/index.css'

type Screen = 'intro' | 'measurement' | 'result'

export function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const [frames, setFrames] = useState<RGBFrame[]>([])
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const [signalQuality, setSignalQuality] = useState<SignalQuality | null>(null)
  const [currentBPM, setCurrentBPM] = useState<BPMEstimate | null>(null)
  const [bpmHistory, setBpmHistory] = useState<BPMEstimate[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [pulseSignal, setPulseSignal] = useState<number[]>([])

  const startTimeRef = useRef<number | null>(null)
  const lastBPMUpdateRef = useRef<number>(0)

  const handleStartMeasurement = useCallback(async () => {
    try {
      setCameraError(null)

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      })

      setCameraStream(stream)
      await initFaceLandmarker()

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      setScreen('measurement')
      startTimeRef.current = Date.now()
      setFrames([])
      setBpmHistory([])
      setCurrentBPM(null)
      setElapsedSeconds(0)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera error'
      setCameraError(msg)
    }
  }, [])

  useEffect(() => {
    if (screen !== 'measurement' || !videoRef.current) return

    const processFrame = () => {
      if (!videoRef.current || !videoRef.current.srcObject) {
        animationRef.current = requestAnimationFrame(processFrame)
        return
      }

      const face = detectFace(videoRef.current)
      setDetectedFace(face)

      if (face) {
        const regions = getSkinRegions(face)
        const frame = captureFrameRGB(videoRef.current, regions)

        if (frame) {
          setFrames(prev => {
            const updated = [...prev, frame]
            const recent = updated.slice(-300)

            const quality = calculateSignalQuality(recent, face, 0)
            setSignalQuality(quality)

            if (recent.length > 30 && Date.now() - lastBPMUpdateRef.current > 500) {
              const bpm = estimateBPM(recent, currentBPM?.bpm || null)
              if (bpm) {
                setCurrentBPM(bpm)
                setBpmHistory(prev => [...prev, bpm])
                lastBPMUpdateRef.current = Date.now()

                if (recent.length > 60) {
                  const rValues = recent.map(f => f.r)
                  const normalized = (rValues.map((v, i) => v - (rValues[i - 1] ?? v))).slice(1)
                  setPulseSignal(normalized.slice(-100))
                }
              }
            }

            return updated
          })
        }
      }

      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsedSeconds(elapsed)

        if (elapsed >= 60) {
          handleStopMeasurement()
          return
        }
      }

      animationRef.current = requestAnimationFrame(processFrame)
    }

    animationRef.current = requestAnimationFrame(processFrame)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [screen, currentBPM])

  const handleStopMeasurement = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }

    if (frames.length > 0 && bpmHistory.length > 0) {
      const summary: SessionSummary = {
        averageBPM: bpmHistory.reduce((sum, b) => sum + b.bpm, 0) / bpmHistory.length,
        minBPM: Math.min(...bpmHistory.map(b => b.bpm)),
        maxBPM: Math.max(...bpmHistory.map(b => b.bpm)),
        goodSignalPercent: (bpmHistory.filter(b => b.confidence >= 0.6).length / bpmHistory.length) * 100,
        duration: elapsedSeconds * 1000
      }

      localStorage.setItem('lastSession', JSON.stringify({ summary, bpmHistory }))
      setScreen('result')
    }
  }, [cameraStream, frames, bpmHistory, elapsedSeconds])

  const calibrationProgress = Math.min(100, (elapsedSeconds / 10) * 100)
  const isCalibrating = elapsedSeconds < 10

  return (
    <div className="app-container">
      {screen === 'intro' && <Intro onStart={handleStartMeasurement} />}

      {screen === 'measurement' && (
        <div>
          <div className="measurement-screen">
            <CameraCard
              ref={videoRef}
              videoStream={cameraStream}
              detectedFace={detectedFace}
              signalQuality={signalQuality}
              error={cameraError}
            />
            <HeartRateCard
              currentBPM={currentBPM}
              signalQuality={signalQuality}
              isCalibrating={isCalibrating}
              calibrationProgress={calibrationProgress}
              elapsedSeconds={elapsedSeconds}
            />
            {!isCalibrating && <GraphCard pulseSignal={pulseSignal} bpmHistory={bpmHistory} />}
          </div>

          <div className="controls">
            <button className="btn btn-secondary" onClick={handleStopMeasurement}>
              Stop Measurement
            </button>
          </div>
        </div>
      )}

      {screen === 'result' && (
        <SessionResult
          summary={{
            averageBPM: bpmHistory.reduce((sum, b) => sum + b.bpm, 0) / bpmHistory.length,
            minBPM: Math.min(...bpmHistory.map(b => b.bpm)),
            maxBPM: Math.max(...bpmHistory.map(b => b.bpm)),
            goodSignalPercent: (bpmHistory.filter(b => b.confidence >= 0.6).length / bpmHistory.length) * 100,
            duration: elapsedSeconds * 1000
          }}
          bpmHistory={bpmHistory}
          onMeasureAgain={() => {
            setScreen('intro')
            setFrames([])
            setBpmHistory([])
            setCurrentBPM(null)
            setElapsedSeconds(0)
            setPulseSignal([])
          }}
        />
      )}

    </div>
  )
}

export default App
