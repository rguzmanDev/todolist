'use client'

import { cn } from '@/lib/utils'
import { THEME } from '@/lib/theme'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium" style={{ color: THEME.ui.text.primary }}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full rounded-md border bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400',
          className
        )}
        style={{
          borderColor: error ? THEME.ui.button.danger.text : THEME.ui.border.light,
          color: THEME.ui.text.primary,
        }}
        {...props}
      />
      {error && <span className="text-xs" style={{ color: THEME.ui.input.error }}>{error}</span>}
    </div>
  )
}
