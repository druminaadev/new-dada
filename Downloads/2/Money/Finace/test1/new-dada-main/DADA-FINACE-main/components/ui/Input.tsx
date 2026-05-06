'use client'
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; required?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className = '', style, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}{required && <span style={{ color: 'var(--error)' }} className="ml-0.5">*</span>}
        </label>
      )}
      <input ref={ref} {...props}
        className={`h-10 px-3 text-sm rounded-lg outline-none transition-all ${className}`}
        style={{
          background: 'var(--form-field)',
          color: 'var(--text-primary)',
          border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
          ...style,
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-tint)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = error ? 'var(--error)' : 'var(--border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
      {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
