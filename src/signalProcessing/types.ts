export interface Signal {
  values: number[]
  timestamps: number[]
}

export interface FFTResult {
  frequencies: number[]
  magnitudes: number[]
  peakFrequency: number
  peakMagnitude: number
}

export const SIGNAL_CONFIG = {
  MIN_HR: 42,
  MAX_HR: 180,
  MIN_HZ: 0.7,
  MAX_HZ: 3.0,
  WINDOW_SIZE_MS: 12000,
  CALIBRATION_TIME_MS: 10000,
  MIN_CONFIDENCE: 0.6,
  SAMPLING_RATE: 30
}
