import React from 'react'
import { SessionSummary, BPMEstimate } from '../types'
import { SimpleChart } from './SimpleChart'

interface SessionResultProps {
  summary: SessionSummary
  bpmHistory: BPMEstimate[]
  onMeasureAgain: () => void
}

export function SessionResult({ summary, bpmHistory, onMeasureAgain }: SessionResultProps) {
  const bpmValues = bpmHistory.map(b => b.bpm)
  const avgBpmFormatted = Math.round(summary.averageBPM)

  return (
    <div className="session-result">
      <h2>Measurement Complete</h2>

      <div className="result-grid">
        <div className="result-item">
          <div className="result-label">Average Heart Rate</div>
          <div className="result-value">{avgBpmFormatted}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>BPM</div>
        </div>

        <div className="result-item">
          <div className="result-label">Range</div>
          <div className="result-value">
            {Math.round(summary.minBPM)}–{Math.round(summary.maxBPM)}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>BPM</div>
        </div>

        <div className="result-item">
          <div className="result-label">Signal Quality</div>
          <div className="result-value">{Math.round(summary.goodSignalPercent)}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>% Good</div>
        </div>

        <div className="result-item">
          <div className="result-label">Duration</div>
          <div className="result-value">{Math.round(summary.duration / 1000)}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Seconds</div>
        </div>
      </div>

      {bpmValues.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <SimpleChart data={bpmValues} title="Heart Rate Over Time" height={250} />
        </div>
      )}

      <div className="medical-disclaimer">
        <strong>Experimental Measurement:</strong> This measurement may be inaccurate. It is not intended to diagnose,
        prevent, or treat any medical condition. Do not rely on this result for medical decisions. If you have health
        concerns, please consult a healthcare professional.
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={onMeasureAgain}>
          Measure Again
        </button>
      </div>
    </div>
  )
}
