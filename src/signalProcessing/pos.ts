import { detrend, normalize } from './detrend'

function std(arr: number[]): number {
  if (arr.length < 2) return 0
  const mean = arr.reduce((a, b) => a + b) / arr.length
  const variance = arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length
  return Math.sqrt(variance)
}

export function posAlgorithm(r: number[], g: number[], b: number[]): number[] {
  if (r.length < 2) return []

  const l1 = r.map((val, i) => val - g[i])
  const l2 = g.map((val, i) => val - b[i])

  const s1 = normalize(l1)
  const s2 = normalize(l2)

  const stdL1 = std(l1)
  const stdL2 = std(l2)
  const ratio = stdL2 !== 0 ? stdL1 / stdL2 : 0

  const p = s1.map((val, i) => val - s2[i] * ratio)

  return detrend(normalize(p))
}

export function chrom(r: number[], g: number[], b: number[]): number[] {
  if (r.length < 2) return []

  const xcomp = r.map((val, i) => val - g[i])
  const ycomp = g.map((val, i) => 2 * val - r[i] - b[i])

  const xnorm = normalize(xcomp)
  const ynorm = normalize(ycomp)

  return xnorm.map((val, i) => val - ynorm[i] * 0.2)
}
