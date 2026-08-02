import { RGBFrame, DetectedFace, SignalQuality } from '../types'
import { SIGNAL_CONFIG } from './types'

export function calculateSignalQuality(
  frames: RGBFrame[],
  detectedFace: DetectedFace | null,
  spectralPeakMagnitude: number
): SignalQuality {
  if (!detectedFace) {
    return {
      score: 0,
      illumination: 0,
      motion: 0,
      spectralPeak: 0,
      continuity: 0,
      reason: 'No face detected'
    }
  }

  if (frames.length === 0) {
    return {
      score: 0,
      illumination: 0,
      motion: 0,
      spectralPeak: 0,
      continuity: 0,
      reason: 'No frames captured'
    }
  }

  const illumination = assessIllumination(frames)
  const motion = assessMotion(frames)
  const continuity = assessContinuity(frames)
  const spectralPeak = Math.min(1, spectralPeakMagnitude / 100)

  let score = (illumination * 0.25 + motion * 0.25 + continuity * 0.25 + spectralPeak * 0.25) * detectedFace.confidence

  return {
    score: Math.max(0, Math.min(1, score)),
    illumination,
    motion,
    spectralPeak,
    continuity
  }
}

function assessIllumination(frames: RGBFrame[]): number {
  if (frames.length === 0) return 0

  const avgBrightness = frames.reduce((sum, f) => sum + (f.r + f.g + f.b) / 3, 0) / frames.length

  if (avgBrightness < 30) return 0
  if (avgBrightness > 230) return 0.5
  if (avgBrightness >= 80 && avgBrightness <= 180) return 1
  if (avgBrightness < 80) return (avgBrightness - 30) / 50
  return 1 - (avgBrightness - 180) / 50
}

function assessMotion(frames: RGBFrame[]): number {
  if (frames.length < 2) return 0

  let totalVariance = 0
  for (let i = 1; i < frames.length; i++) {
    const dr = frames[i].r - frames[i - 1].r
    const dg = frames[i].g - frames[i - 1].g
    const db = frames[i].b - frames[i - 1].b
    totalVariance += dr * dr + dg * dg + db * db
  }

  const avgVariance = totalVariance / (frames.length - 1)

  if (avgVariance > 500) return 0
  if (avgVariance > 200) return 0.3
  if (avgVariance > 50) return 0.7
  return 1
}

function assessContinuity(frames: RGBFrame[]): number {
  if (frames.length === 0) return 0

  const expectedCount = (frames[frames.length - 1].timestamp - frames[0].timestamp) / (1000 / SIGNAL_CONFIG.SAMPLING_RATE)

  return Math.min(1, frames.length / Math.max(1, expectedCount))
}

export function shouldDisplayBPM(quality: SignalQuality, timeSinceCalibration: number): boolean {
  return (
    quality.score >= SIGNAL_CONFIG.MIN_CONFIDENCE &&
    timeSinceCalibration >= SIGNAL_CONFIG.CALIBRATION_TIME_MS
  )
}
