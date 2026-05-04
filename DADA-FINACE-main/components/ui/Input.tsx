'use client'
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; required?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input ref={ref} {...props}
        className={`h-10 px-3 text-sm border rounded-md outline-none transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${error ? 'border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900' : 'border-slate-300 dark:border-slate-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50'} disabled:bg-slate-50 dark:disabled:bg-slate-700 disabled:text-slate-400 ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
