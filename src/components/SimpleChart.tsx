import React, { useEffect, useRef } from 'react'
import { BPMEstimate } from '../types'

interface SimpleChartProps {
  data: number[]
  title: string
  height?: number
}

export function SimpleChart({ data, title, height = 200 }: SimpleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, width, h)
    ctx.fillStyle = '#f9f9f9'
    ctx.fillRect(0, 0, width, h)

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max === min ? 1 : max - min

    ctx.strokeStyle = '#3498db'
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1 || 1)) * width
      const y = h - ((data[i] - min) / range) * (h - 20) - 10
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    ctx.fillStyle = '#999'
    ctx.font = '11px sans-serif'
    ctx.fillText(`Min: ${min.toFixed(0)}`, 10, h - 5)
    ctx.fillText(`Max: ${max.toFixed(0)}`, width - 80, h - 5)
  }, [data])

  return (
    <div className="graph-card">
      <div className="graph-title">{title}</div>
      <canvas ref={canvasRef} width={400} height={height} style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: '4px' }} />
    </div>
  )
}
