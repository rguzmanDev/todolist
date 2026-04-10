'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { THEME } from '@/lib/theme'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl',
          'ring-1 animate-in zoom-in-95 fade-in duration-200',
          className
        )}
        style={{ borderColor: THEME.ui.border.light }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottomColor: THEME.ui.border.light, borderBottomWidth: '1px' }}>
          <h2 id="modal-title" className="text-sm font-semibold" style={{ color: THEME.ui.text.primary }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 transition-all duration-200 hover:scale-110"
            style={{ color: THEME.ui.text.secondary, backgroundColor: THEME.ui.state.hover }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}
