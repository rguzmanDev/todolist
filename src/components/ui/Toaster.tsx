'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast as toastBus, type ToastEvent } from '@/lib/toast'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle size={16} />,
  error:   <XCircle size={16} />,
  info:    <Info size={16} />,
  confirm: <AlertTriangle size={16} />,
}

const COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  success: { bg: 'var(--color-bg)', border: '#22c55e',                     icon: '#22c55e' },
  error:   { bg: 'var(--color-bg)', border: '#ef4444',                     icon: '#ef4444' },
  info:    { bg: 'var(--color-bg)', border: 'var(--color-sidebar-accent)', icon: 'var(--color-sidebar-accent)' },
  confirm: { bg: 'var(--color-bg)', border: '#f59e0b',                     icon: '#f59e0b' },
}

interface ActiveToast extends ToastEvent {
  exiting: boolean
}

export default function Toaster() {
  const [toasts, setToasts] = useState<ActiveToast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300)
  }, [])

  useEffect(() => {
    return toastBus._subscribe((event) => {
      setToasts((prev) => [...prev, { ...event, exiting: false }])
      // confirm toasts don't auto-dismiss
      if (event.type !== 'confirm') {
        setTimeout(() => dismiss(event.id), 3000)
      }
    })
  }, [dismiss])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const colors = COLORS[t.type]
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex flex-col gap-2 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium transition-all duration-300"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
              color: 'var(--color-text-primary)',
              opacity: t.exiting ? 0 : 1,
              transform: t.exiting ? 'translateY(8px)' : 'translateY(0)',
              minWidth: '240px',
              maxWidth: '320px',
            }}
          >
            <div className="flex items-center gap-3">
              <span style={{ color: colors.icon, flexShrink: 0 }}>{ICONS[t.type as keyof typeof ICONS]}</span>
              <span className="flex-1 leading-snug">{t.message}</span>
              {t.type !== 'confirm' && (
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 opacity-40 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {t.type === 'confirm' && (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { t.onCancel?.(); dismiss(t.id) }}
                  className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                  style={{ backgroundColor: 'var(--color-sidebar-hover)', color: 'var(--color-text-secondary)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { t.onConfirm?.(); dismiss(t.id) }}
                  className="rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
                  style={{ backgroundColor: '#ef4444', color: '#fff' }}
                >
                  {t.confirmLabel ?? 'Confirmar'}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
