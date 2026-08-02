import React, { useEffect, useRef, useState } from 'react'

interface SimpleChartProps {
  data: number[]
  title: string
  height?: number
}

export function SimpleChart({ data, title, height = 200 }: SimpleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.offsetWidth || 500
    const h = height
    const dpr = window.devicePixelRatio || 1

    canvas.width = width * dpr
    canvas.height = h * dpr
    canvas.style.width = width + 'px'
    canvas.style.height = h + 'px'
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, width, h)

    // Border
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, width, h)

    if (!data || data.length === 0) {
      ctx.fillStyle = '#999'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No data', width / 2, h / 2)
      return
    }

    const padding = 40
    const plotWidth = width - padding * 2
    const plotHeight = h - padding * 2

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max === min ? 1 : max - min

    // Draw filled area
    ctx.fillStyle = 'rgba(52, 152, 219, 0.2)'
    ctx.beginPath()
    ctx.moveTo(padding, h - padding)

    for (let i = 0; i < data.length; i++) {
      const x = padding + (i / Math.max(1, data.length - 1)) * plotWidth
      const y = h - padding - ((data[i] - min) / range) * plotHeight
      ctx.lineTo(x, y)
    }

    ctx.lineTo(width - padding, h - padding)
    ctx.closePath()
    ctx.fill()

    // Draw line
    ctx.strokeStyle = '#3498db'
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()

    for (let i = 0; i < data.length; i++) {
      const x = padding + (i / Math.max(1, data.length - 1)) * plotWidth
      const y = h - padding - ((data[i] - min) / range) * plotHeight
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Labels
    ctx.fillStyle = '#666'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${Math.round(min)}`, padding, h - 10)

    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(max)}`, width - padding, h - 10)

    setIsReady(true)
  }, [data, height])

  return (
    <div className="graph-card">
      <div className="graph-title">{title}</div>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: height + 'px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px'
        }}
      />
    </div>
  )
}
