import React from 'react'
import { SimpleChart } from './SimpleChart'
import { BPMEstimate } from '../types'

interface GraphCardProps {
  pulseSignal: number[]
  bpmHistory: BPMEstimate[]
  showPulse?: boolean
}

export function GraphCard({ pulseSignal, bpmHistory, showPulse = true }: GraphCardProps) {
  const bpmValues = bpmHistory.map(b => b.bpm)

  return (
    <div className="graphs-container">
      {showPulse && pulseSignal.length > 0 && (
        <SimpleChart data={pulseSignal} title="Live Pulse Waveform" height={200} />
      )}

      {bpmValues.length > 0 && (
        <SimpleChart data={bpmValues} title="Heart Rate Over Time" height={200} />
      )}
    </div>
  )
}
