import React from 'react'

interface IntroProps {
  onStart: () => void
}

export function Intro({ onStart }: IntroProps) {
  return (
    <div className="intro-screen">
      <h1>Measure Your Heart Rate</h1>
      <p>Using your webcam, we'll estimate your heart rate through remote photoplethysmography (rPPG).</p>

      <div className="privacy-notice">
        <strong>Privacy First:</strong> Video is processed locally in your browser and is never recorded, uploaded, or transmitted.
      </div>

      <div className="disclaimer">
        <strong>Educational Use Only:</strong> This is an experimental tool for learning about camera-based physiological sensing. It is not a medical device and should not be used for medical decisions or diagnostics.
      </div>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#7f8c8d' }}>
        For best results:
      </p>
      <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '14px', marginTop: '10px' }}>
        <li>Use good, even lighting (avoid harsh shadows)</li>
        <li>Position your face centrally in the frame</li>
        <li>Remain still for 30–60 seconds</li>
        <li>Avoid talking or making expressions</li>
      </ul>

      <div className="controls">
        <button className="btn btn-primary" onClick={onStart}>
          Start Measurement
        </button>
      </div>
    </div>
  )
}
