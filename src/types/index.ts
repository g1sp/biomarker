export interface RGBFrame {
  timestamp: number
  r: number
  g: number
  b: number
}

export interface DetectedFace {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  landmarks: Array<{ x: number; y: number }>
}

export interface SignalQuality {
  score: number
  illumination: number
  motion: number
  spectralPeak: number
  continuity: number
  reason?: string
}

export interface BPMEstimate {
  bpm: number
  confidence: number
  timestamp: number
}

export interface MeasurementSession {
  startTime: number
  frames: RGBFrame[]
  bpmHistory: BPMEstimate[]
  qualityHistory: SignalQuality[]
}

export interface SessionSummary {
  averageBPM: number
  minBPM: number
  maxBPM: number
  goodSignalPercent: number
  duration: number
}
