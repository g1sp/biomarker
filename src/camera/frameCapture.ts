import { RGBFrame } from '../types'

export function captureFrame(video: HTMLVideoElement): ImageData | null {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(video, 0, 0)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

export function extractRGBFromRegion(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number
): { r: number; g: number; b: number } {
  const data = imageData.data
  const canvasWidth = imageData.width

  let rSum = 0
  let gSum = 0
  let bSum = 0
  let pixelCount = 0

  const startX = Math.max(0, Math.floor(x))
  const startY = Math.max(0, Math.floor(y))
  const endX = Math.min(canvasWidth, Math.ceil(x + width))
  const endY = Math.min(imageData.height, Math.ceil(y + height))

  for (let py = startY; py < endY; py++) {
    for (let px = startX; px < endX; px++) {
      const idx = (py * canvasWidth + px) * 4
      rSum += data[idx]
      gSum += data[idx + 1]
      bSum += data[idx + 2]
      pixelCount++
    }
  }

  return {
    r: pixelCount > 0 ? rSum / pixelCount : 0,
    g: pixelCount > 0 ? gSum / pixelCount : 0,
    b: pixelCount > 0 ? bSum / pixelCount : 0
  }
}

export function captureFrameRGB(
  video: HTMLVideoElement,
  regions: Array<{ x: number; y: number; width: number; height: number }>
): RGBFrame | null {
  const imageData = captureFrame(video)
  if (!imageData) return null

  let rSum = 0
  let gSum = 0
  let bSum = 0

  for (const region of regions) {
    const rgb = extractRGBFromRegion(imageData, region.x, region.y, region.width, region.height)
    rSum += rgb.r
    gSum += rgb.g
    bSum += rgb.b
  }

  const count = regions.length || 1
  return {
    timestamp: Date.now(),
    r: rSum / count,
    g: gSum / count,
    b: bSum / count
  }
}
