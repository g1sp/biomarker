import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'
import { DetectedFace } from '../types'

let faceLandmarkerInstance: FaceLandmarker | null = null

export async function initFaceLandmarker(): Promise<void> {
  if (faceLandmarkerInstance) return

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  )

  faceLandmarkerInstance = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
    },
    runningMode: 'VIDEO',
    numFaces: 1
  })
}

export function detectFace(video: HTMLVideoElement): DetectedFace | null {
  if (!faceLandmarkerInstance) return null

  const results = faceLandmarkerInstance.detectForVideo(video, Date.now())

  if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
    return null
  }

  const landmarks = results.faceLandmarks[0]
  if (!landmarks || landmarks.length === 0) return null

  const faceConfidence = results.faceBlendshapes?.[0]?.[0]?.score || 0.9

  const xCoords = landmarks.map(p => p.x * video.videoWidth)
  const yCoords = landmarks.map(p => p.y * video.videoHeight)

  const minX = Math.min(...xCoords)
  const maxX = Math.max(...xCoords)
  const minY = Math.min(...yCoords)
  const maxY = Math.max(...yCoords)

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    confidence: faceConfidence,
    landmarks: landmarks.map(p => ({
      x: p.x * video.videoWidth,
      y: p.y * video.videoHeight
    }))
  }
}

export function getSkinRegions(face: DetectedFace): Array<{ x: number; y: number; width: number; height: number }> {
  const { x, y, width, height } = face

  const foreheadWidth = width * 0.3
  const foreheadHeight = height * 0.15
  const forehead = {
    x: x + width / 2 - foreheadWidth / 2,
    y: y + height * 0.1,
    width: foreheadWidth,
    height: foreheadHeight
  }

  const cheekWidth = width * 0.15
  const cheekHeight = height * 0.15
  const leftCheek = {
    x: x + width * 0.15,
    y: y + height * 0.4,
    width: cheekWidth,
    height: cheekHeight
  }

  const rightCheek = {
    x: x + width * 0.7,
    y: y + height * 0.4,
    width: cheekWidth,
    height: cheekHeight
  }

  return [forehead, leftCheek, rightCheek]
}
