'use client'
import { useRef, useState } from 'react'
import { Camera, RotateCcw, Check } from 'lucide-react'
import { Button } from './Button'

interface WebcamCaptureProps { onCapture: (dataUrl: string) => void; current?: string }

export function WebcamCapture({ onCapture, current }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [captured, setCaptured] = useState<string | null>(current ?? null)
  const [error, setError] = useState('')

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) { videoRef.current.srcObject = stream; setStreaming(true) }
    } catch { setError('Camera access denied or not available') }
  }

  const capture = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = 200; canvas.height = 200
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0, 200, 200)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCaptured(dataUrl); onCapture(dataUrl)
    const stream = videoRef.current.srcObject as MediaStream
    stream?.getTracks().forEach(t => t.stop())
    setStreaming(false)
  }

  const retake = () => {
    setCaptured(null)
    const stream = videoRef.current?.srcObject as MediaStream
    stream?.getTracks().forEach(t => t.stop())
    setStreaming(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-slate-300 bg-slate-100 flex items-center justify-center">
        {captured ? <img src={captured} className="w-full h-full object-cover" alt="Captured" />
          : streaming ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          : <Camera size={32} className="text-slate-400" />}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        {!streaming && !captured && <Button variant="outline" size="sm" onClick={startCamera}><Camera size={12} /> Start Camera</Button>}
        {streaming && <Button variant="success" size="sm" onClick={capture}><Check size={12} /> Capture</Button>}
        {captured && <Button variant="outline" size="sm" onClick={retake}><RotateCcw size={12} /> Retake</Button>}
      </div>
    </div>
  )
}
