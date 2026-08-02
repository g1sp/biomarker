import React, { useEffect, useRef, forwardRef } from 'react'
import { DetectedFace, SignalQuality } from '../types'

interface CameraCardProps {
  videoStream: MediaStream | null
  detectedFace: DetectedFace | null
  signalQuality: SignalQuality | null
  error?: string
}

export const CameraCard = forwardRef<HTMLVideoElement, CameraCardProps>(
  function CameraCard({ videoStream, detectedFace, signalQuality, error }, ref) {

    useEffect(() => {
      if (ref && 'current' in ref && ref.current && videoStream) {
        ref.current.srcObject = videoStream
        ref.current.play().catch(e => console.error('Video play error:', e))
      }
    }, [videoStream, ref])

    if (error) {
      return (
        <div className="card camera-card">
          <div className="error-message">{error}</div>
        </div>
      )
    }

    const qualityLabel = signalQuality ? (
      signalQuality.score >= 0.7 ? 'Good' : signalQuality.score >= 0.4 ? 'Fair' : 'Poor'
    ) : 'Detecting...'

    const qualityClass = signalQuality ? (
      signalQuality.score >= 0.7 ? 'quality-good' : signalQuality.score >= 0.4 ? 'quality-fair' : 'quality-poor'
    ) : 'quality-fair'

    return (
      <div className="card camera-card">
        <div className="video-container">
          <video ref={ref} playsInline muted />
        <svg className="face-overlay" viewBox="0 0 640 480">
          {detectedFace && (
            <g>
              <ellipse
                cx={detectedFace.x + detectedFace.width / 2}
                cy={detectedFace.y + detectedFace.height / 2}
                rx={detectedFace.width / 2}
                ry={detectedFace.height / 2}
                fill="none"
                stroke="rgba(52, 211, 153, 0.7)"
                strokeWidth="3"
              />
            </g>
          )}
          {!detectedFace && (
            <g>
              <ellipse
                cx="320"
                cy="240"
                rx="150"
                ry="180"
                fill="none"
                stroke="rgba(149, 165, 166, 0.4)"
                strokeWidth="3"
                strokeDasharray="5,5"
              />
              <text x="320" y="280" textAnchor="middle" fill="rgba(255, 255, 255, 0.6)" fontSize="14">
                Position your face here
              </text>
            </g>
          )}
        </svg>
      </div>

      <ul className="positioning-hints">
        <li>Keep your face centered</li>
        <li>Remain still and calm</li>
        <li>Use even lighting</li>
        <li>Avoid talking</li>
      </ul>

      <div className="signal-quality">
        <span className={`quality-indicator ${qualityClass}`}></span>
        <span style={{ fontSize: '13px' }}>Signal: {qualityLabel}</span>
        {signalQuality && (
          <span style={{ fontSize: '11px', color: '#999', marginLeft: 'auto' }}>
            Illumination: {(signalQuality.illumination * 100).toFixed(0)}% Motion: {(signalQuality.motion * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
    )
  }
)
