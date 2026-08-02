import { FFTResult } from './types'

export function computeFFT(signal: number[]): FFTResult {
  if (signal.length === 0) {
    return {
      frequencies: [],
      magnitudes: [],
      peakFrequency: 0,
      peakMagnitude: 0
    }
  }

  const n = signal.length
  const fft = discreteFourierTransform(signal)

  const magnitudes: number[] = []
  const frequencies: number[] = []

  const nyquist = Math.floor(n / 2)
  for (let i = 1; i < nyquist; i++) {
    magnitudes.push(Math.hypot(fft[i].real, fft[i].imag))
    frequencies.push(i)
  }

  if (magnitudes.length === 0) {
    return {
      frequencies: [],
      magnitudes: [],
      peakFrequency: 0,
      peakMagnitude: 0
    }
  }

  const peakMagnitude = Math.max(...magnitudes)
  const peakIndex = magnitudes.indexOf(peakMagnitude)
  const peakFrequency = frequencies[peakIndex]

  return {
    frequencies,
    magnitudes,
    peakFrequency,
    peakMagnitude
  }
}

export function frequencyToBPM(frequency: number, sampleRate: number, windowLengthSamples: number): number {
  if (frequency === 0 || windowLengthSamples === 0) return 0
  const freqHz = (frequency * sampleRate) / windowLengthSamples
  return Math.max(0, Math.round(freqHz * 60))
}

export function bpmToFrequency(bpm: number): number {
  return bpm / 60
}

function discreteFourierTransform(signal: number[]): Complex[] {
  const n = signal.length
  if (n === 0) return []

  const result: Complex[] = new Array(n)

  for (let k = 0; k < n; k++) {
    let real = 0
    let imag = 0
    for (let t = 0; t < n; t++) {
      const angle = (-2 * Math.PI * k * t) / n
      real += signal[t] * Math.cos(angle)
      imag += signal[t] * Math.sin(angle)
    }
    result[k] = { real, imag }
  }

  return result
}

interface Complex {
  real: number
  imag: number
}
