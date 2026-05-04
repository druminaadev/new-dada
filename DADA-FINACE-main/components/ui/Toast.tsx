'use client'
import { useUIStore } from '@/store/uiStore'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const STYLES = {
  success: { icon: CheckCircle, color: 'var(--success)', tint: 'var(--success-tint)' },
  error:   { icon: XCircle,     color: 'var(--error)',   tint: 'var(--error-tint)' },
  warning: { icon: AlertTriangle,color: 'var(--warning)', tint: 'var(--warning-tint)' },
  info:    { icon: Info,         color: 'var(--accent)',  tint: 'var(--accent-tint)' },
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()
  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map(t => {
        const s = STYLES[t.type]
        const Icon = s.icon
        return (
          <div key={t.id}
            className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl pointer-events-auto"
            style={{ background: s.tint, border: `1px solid ${s.color}40`, animation: 'slideInRight 0.25s ease' }}>
            <Icon size={16} style={{ color: s.color, flexShrink: 0, marginTop: 2 }} />
            <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="cursor-pointer opacity-60 hover:opacity-100 shrink-0"
              style={{ color: 'var(--text-primary)' }}>
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
