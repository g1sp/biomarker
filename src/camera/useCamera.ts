import { useEffect, useRef, useState, useCallback } from 'react'

export interface CameraState {
  stream: MediaStream | null
  error: string | null
  isReady: boolean
}

export function useCamera(): [CameraState, () => void] {
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<CameraState>({
    stream: null,
    error: null,
    isReady: false
  })

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this browser')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      })

      streamRef.current = stream

      setState({
        stream,
        error: null,
        isReady: true
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown camera error'
      setState({
        stream: null,
        error: message,
        isReady: false
      })
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setState({
      stream: null,
      error: null,
      isReady: false
    })
  }, [])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return [state, startCamera]
}
