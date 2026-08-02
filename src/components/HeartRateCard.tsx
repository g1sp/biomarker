import React from 'react'
import { BPMEstimate, SignalQuality } from '../types'

interface HeartRateCardProps {
  currentBPM: BPMEstimate | null
  signalQuality: SignalQuality | null
  isCalibrating: boolean
  calibrationProgress: number
  elapsedSeconds: number
}

export function HeartRateCard({
  currentBPM,
  signalQuality,
  isCalibrating,
  calibrationProgress,
  elapsedSeconds
}: HeartRateCardProps) {
  const showBPM = currentBPM && signalQuality && signalQuality.score >= 0.6 && !isCalibrating

  const confidenceLevel =
    !currentBPM || !showBPM
      ? null
      : currentBPM.confidence >= 0.8
        ? 'high'
        : currentBPM.confidence >= 0.5
          ? 'medium'
          : 'low'

  return (
    <div className="card hr-card">
      {isCalibrating ? (
        <>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#7f8c8d', marginBottom: '20px' }}>
            Calibrating…
          </div>

          <div className="calibration-status">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${calibrationProgress}%` }}></div>
            </div>
            <div className="calibration-text">Finding your pulse… {Math.round(calibrationProgress)}%</div>
          </div>

          <div style={{ marginTop: '20px', fontSize: '13px', color: '#999' }}>
            Collecting baseline data…
          </div>
        </>
      ) : showBPM ? (
        <>
          <div className="heart-icon">♥</div>
          <div className="bpm-display">
            {currentBPM.bpm}
            <span className="bpm-unit"> BPM</span>
          </div>

          {confidenceLevel && (
            <div className={`confidence-badge confidence-${confidenceLevel}`}>
              {confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)} Confidence
            </div>
          )}

          <div className="timer">{elapsedSeconds}s</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '20px', fontStyle: 'italic' }}>
            Waiting for stable signal…
          </div>

          {signalQuality && (
            <div style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
              {signalQuality.reason || (signalQuality.score < 0.3 ? 'Poor signal quality' : 'Stabilizing measurement')}
            </div>
          )}

          <div className="timer">{elapsedSeconds}s</div>
        </>
      )}
    </div>
  )
}
