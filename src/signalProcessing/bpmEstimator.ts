import { RGBFrame, BPMEstimate } from '../types'
import { posAlgorithm } from './pos'
import { computeFFT, frequencyToBPM } from './fft'
import { SIGNAL_CONFIG } from './types'
import { normalize } from './detrend'

export function estimateBPM(frames: RGBFrame[], previousBPM: number | null = null): BPMEstimate | null {
  if (frames.length < 30) return null

  const windowFrames = getWindowFrames(frames, SIGNAL_CONFIG.WINDOW_SIZE_MS)
  if (windowFrames.length < 30) return null

  const r = windowFrames.map(f => f.r)
  const g = windowFrames.map(f => f.g)
  const b = windowFrames.map(f => f.b)

  const pulse = posAlgorithm(r, g, b)
  if (pulse.length === 0) return null

  const normalized = normalize(pulse)

  const fftResult = computeFFT(normalized)
  if (fftResult.peakFrequency === 0 || isNaN(fftResult.peakFrequency)) {
    return null
  }

  const bpm = frequencyToBPM(
    fftResult.peakFrequency,
    SIGNAL_CONFIG.SAMPLING_RATE,
    windowFrames.length
  )

  if (isNaN(bpm) || bpm < SIGNAL_CONFIG.MIN_HR || bpm > SIGNAL_CONFIG.MAX_HR) {
    return null
  }

  let smoothedBPM = bpm
  if (previousBPM !== null && !isNaN(previousBPM)) {
    smoothedBPM = exponentialMovingAverage(previousBPM, bpm, 0.3)
  }

  const confidence = calculateBPMConfidence(fftResult.peakMagnitude, windowFrames.length)

  return {
    bpm: Math.round(smoothedBPM),
    confidence,
    timestamp: Date.now()
  }
}

function getWindowFrames(frames: RGBFrame[], windowMs: number): RGBFrame[] {
  if (frames.length === 0) return []

  const cutoffTime = frames[frames.length - 1].timestamp - windowMs
  return frames.filter(f => f.timestamp >= cutoffTime)
}

function exponentialMovingAverage(prev: number, current: number, alpha: number): number {
  return alpha * current + (1 - alpha) * prev
}

function calculateBPMConfidence(peakMagnitude: number, windowSize: number): number {
  const baseline = Math.sqrt(windowSize)
  const snratio = peakMagnitude / baseline

  if (snratio < 2) return 0.2
  if (snratio < 5) return 0.5
  if (snratio < 10) return 0.8
  return 1.0
}

export function medianFilter(bpms: number[], windowSize: number = 3): number {
  if (bpms.length < windowSize) return bpms[bpms.length - 1] || 0

  const window = bpms.slice(-windowSize)
  return window.sort((a, b) => a - b)[Math.floor(window.length / 2)]
}
