import { describe, it, expect } from 'vitest'
import { estimateBPM, medianFilter } from '../src/signalProcessing/bpmEstimator'
import { RGBFrame } from '../src/types'
import { SIGNAL_CONFIG } from '../src/signalProcessing/types'

describe('Signal Processing', () => {
  function generateSyntheticPulse(bpmTarget: number, durationMs: number, sampleRateHz: number = 30): RGBFrame[] {
    const frames: RGBFrame[] = []
    const freqHz = bpmTarget / 60
    const samples = Math.ceil((durationMs / 1000) * sampleRateHz)

    const baseR = 100
    const baseG = 80
    const baseB = 60
    const amplitude = 10

    for (let i = 0; i < samples; i++) {
      const time = i / sampleRateHz
      const pulse = amplitude * Math.sin(2 * Math.PI * freqHz * time)

      frames.push({
        timestamp: i * (1000 / sampleRateHz),
        r: baseR + pulse,
        g: baseG + pulse * 0.8,
        b: baseB + pulse * 0.6
      })
    }

    return frames
  }

  it('detects 60 BPM from synthetic pulse', () => {
    const frames = generateSyntheticPulse(60, 15000)
    const result = estimateBPM(frames)

    expect(result).not.toBeNull()
    expect(result?.bpm).toBeGreaterThanOrEqual(55)
    expect(result?.bpm).toBeLessThanOrEqual(65)
  })

  it('detects 72 BPM from synthetic pulse', () => {
    const frames = generateSyntheticPulse(72, 15000)
    const result = estimateBPM(frames)

    expect(result).not.toBeNull()
    expect(result?.bpm).toBeGreaterThanOrEqual(67)
    expect(result?.bpm).toBeLessThanOrEqual(77)
  })

  it('detects 90 BPM from synthetic pulse', () => {
    const frames = generateSyntheticPulse(90, 15000)
    const result = estimateBPM(frames)

    expect(result).not.toBeNull()
    expect(result?.bpm).toBeGreaterThanOrEqual(85)
    expect(result?.bpm).toBeLessThanOrEqual(95)
  })

  it('detects 120 BPM from synthetic pulse', () => {
    const frames = generateSyntheticPulse(120, 15000)
    const result = estimateBPM(frames)

    expect(result).not.toBeNull()
    expect(result?.bpm).toBeGreaterThanOrEqual(115)
    expect(result?.bpm).toBeLessThanOrEqual(125)
  })

  it('returns null for insufficient frames', () => {
    const frames = generateSyntheticPulse(72, 500)
    const result = estimateBPM(frames)

    expect(result).toBeNull()
  })

  it('applies median filter correctly', () => {
    const bpms = [60, 70, 80, 75, 72]
    const filtered = medianFilter(bpms, 3)

    expect(filtered).toBeGreaterThanOrEqual(70)
    expect(filtered).toBeLessThanOrEqual(80)
  })

  it('returns valid BPM within 42-180 range', () => {
    const frames = generateSyntheticPulse(100, 15000)
    const result = estimateBPM(frames)

    expect(result?.bpm).toBeGreaterThanOrEqual(SIGNAL_CONFIG.MIN_HR)
    expect(result?.bpm).toBeLessThanOrEqual(SIGNAL_CONFIG.MAX_HR)
  })
})
