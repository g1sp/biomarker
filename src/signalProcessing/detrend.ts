export function detrend(signal: number[]): number[] {
  if (signal.length < 2) return signal

  const n = signal.length
  const mean = signal.reduce((a, b) => a + b) / n
  const x = Array.from({ length: n }, (_, i) => i)
  const xMean = (n - 1) / 2

  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (signal[i] - mean)
    denominator += (x[i] - xMean) ** 2
  }

  const slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = mean - slope * xMean

  return signal.map((val, i) => val - (slope * i + intercept))
}

export function normalize(signal: number[]): number[] {
  const mean = signal.reduce((a, b) => a + b) / signal.length
  const variance = signal.reduce((sum, val) => sum + (val - mean) ** 2, 0) / signal.length
  const std = Math.sqrt(variance)

  if (std === 0) return signal.map(() => 0)
  return signal.map(val => (val - mean) / std)
}

export function bandpass(signal: number[], minHz: number, maxHz: number, sampleRate: number): number[] {
  const n = signal.length
  const nyquist = sampleRate / 2

  const minBin = Math.max(1, Math.round((minHz / nyquist) * (n / 2)))
  const maxBin = Math.min(n / 2 - 1, Math.round((maxHz / nyquist) * (n / 2)))

  const fft = naiveFft(signal)
  const filtered = new Array(n).fill(0)

  for (let i = 0; i < n; i++) {
    if (i >= minBin && i <= maxBin) {
      filtered[i] = fft[i]
    } else if (i > n / 2 && i >= n - maxBin && i <= n - minBin) {
      filtered[i] = fft[i]
    }
  }

  return naiveIfft(filtered)
}

function naiveFft(signal: number[]): Complex[] {
  const n = signal.length
  if (n === 1) return [{ real: signal[0], imag: 0 }]

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

function naiveIfft(freq: Complex[]): number[] {
  const n = freq.length
  const result: number[] = new Array(n)
  for (let t = 0; t < n; t++) {
    let real = 0
    let imag = 0
    for (let k = 0; k < n; k++) {
      const angle = (2 * Math.PI * k * t) / n
      real += freq[k].real * Math.cos(angle) - freq[k].imag * Math.sin(angle)
      imag += freq[k].real * Math.sin(angle) + freq[k].imag * Math.cos(angle)
    }
    result[t] = real / n
  }
  return result
}

interface Complex {
  real: number
  imag: number
}
