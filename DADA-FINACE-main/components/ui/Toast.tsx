'use client'
import { useUIStore } from '@/store/uiStore'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const STYLES = {
  success: {
    wrap: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
    iconCls: 'text-green-500',
  },
  error: {
    wrap: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: XCircle,
    iconCls: 'text-red-500',
  },
  warning: {
    wrap: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    icon: AlertTriangle,
    iconCls: 'text-amber-500',
  },
  info: {
    wrap: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconCls: 'text-blue-500',
  },
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
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg pointer-events-auto ${s.wrap}`}
            style={{ animation: 'slideInRight 0.25s ease' }}
          >
            <Icon size={16} className={`${s.iconCls} mt-0.5 shrink-0`} />
            <span className={`text-sm flex-1 ${s.text}`}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className={`${s.text} opacity-50 hover:opacity-100 cursor-pointer shrink-0`}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
