import React, { useEffect, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { BPMEstimate, RGBFrame } from '../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface GraphCardProps {
  pulseSignal: number[]
  bpmHistory: BPMEstimate[]
  showPulse?: boolean
}

export function GraphCard({ pulseSignal, bpmHistory, showPulse = true }: GraphCardProps) {
  const pulseChartRef = useRef<ChartJS | null>(null)
  const bpmChartRef = useRef<ChartJS | null>(null)

  const pulseLabels = Array.from({ length: pulseSignal.length }, (_, i) => i)
  const bpmLabels = bpmHistory.map((_, i) => (i + 1).toString())
  const bpmValues = bpmHistory.map(b => b.bpm)

  const pulseChartData = {
    labels: pulseLabels,
    datasets: [
      {
        label: 'Pulse Signal',
        data: pulseSignal,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        fill: true
      }
    ]
  }

  const bpmChartData = {
    labels: bpmLabels,
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: bpmValues,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#3498db',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return (
    <div className="graphs-container">
      {showPulse && (
        <div className="graph-card">
          <div className="graph-title">Live Pulse Waveform</div>
          <div style={{ position: 'relative', height: '200px' }}>
            <Line ref={pulseChartRef} data={pulseChartData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="graph-card">
        <div className="graph-title">Heart Rate Over Time</div>
        <div style={{ position: 'relative', height: '200px' }}>
          <Line ref={bpmChartRef} data={bpmChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
