'use client'

import { cn } from '@/lib/utils'
import { THEME } from '@/lib/theme'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:
    'transition-all duration-200 hover:scale-105 active:scale-95',
  secondary:
    'border transition-all duration-200 hover:scale-105 active:scale-95',
  ghost:
    'transition-all duration-200 hover:scale-105 active:scale-95',
  danger:
    'transition-all duration-200 hover:scale-105 active:scale-95',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const getButtonStyle = () => {
    if (disabled) {
      return {
        backgroundColor: THEME.ui.state.disabled,
        color: THEME.ui.text.secondary,
        opacity: 0.5,
      }
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: THEME.ui.button.primary.bg,
          color: THEME.ui.button.primary.text,
        }
      case 'secondary':
        return {
          backgroundColor: THEME.ui.button.secondary.bg,
          color: THEME.ui.button.secondary.text,
          borderColor: THEME.ui.button.secondary.border,
          ...style,
        }
      case 'ghost':
        return {
          color: THEME.ui.button.ghost.text,
        }
      case 'danger':
        return {
          backgroundColor: THEME.ui.button.danger.bg,
          color: THEME.ui.button.danger.text,
        }
    }
  }

  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={getButtonStyle()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
