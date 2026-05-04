'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export function Footer() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <footer className="h-9 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shrink-0">
      <span className="text-xs text-slate-500 dark:text-slate-400">Copyright © 2025 Dada Finance Corporation. All rights reserved.</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {now ? `Date: ${format(now, 'dd-M-yyyy')} | Time: ${format(now, 'h:mm:ss aa')}` : ''}
      </span>
    </footer>
  )
}
