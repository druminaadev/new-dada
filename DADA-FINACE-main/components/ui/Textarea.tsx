'use client'
import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string; required?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, className = '', style, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}{required && <span style={{ color: 'var(--error)' }} className="ml-0.5">*</span>}
        </label>
      )}
      <textarea ref={ref} {...props} rows={props.rows ?? 3}
        className={`px-3 py-2 text-sm rounded-lg outline-none transition-all resize-none ${className}`}
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
Textarea.displayName = 'Textarea'
