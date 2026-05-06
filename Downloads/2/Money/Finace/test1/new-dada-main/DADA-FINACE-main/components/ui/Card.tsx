'use client'
import React from 'react'
interface CardProps { title?: string; children: React.ReactNode; className?: string }
export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />{title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
