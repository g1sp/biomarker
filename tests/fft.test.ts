import { describe, it, expect } from 'vitest'
import { computeFFT } from '../src/signalProcessing/fft'
import { normalize } from '../src/signalProcessing/detrend'

describe('FFT', () => {
  it('detects frequency from sine wave', () => {
    const sampleRate = 30
    const durationSeconds = 5
    const targetFreqHz = 1.2

    const samples = sampleRate * durationSeconds
    const signal: number[] = []

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      signal.push(Math.sin(2 * Math.PI * targetFreqHz * t))
    }

    const normalized = normalize(signal)
    const fft = computeFFT(normalized)

    expect(fft.peakFrequency).toBeGreaterThan(0)
    expect(fft.peakMagnitude).toBeGreaterThan(0)

    const detectedFreqHz = (fft.peakFrequency * sampleRate) / samples
    const detectedBPM = Math.round(detectedFreqHz * 60)

    expect(detectedBPM).toBeGreaterThanOrEqual(60)
    expect(detectedBPM).toBeLessThanOrEqual(85)
  })
})
