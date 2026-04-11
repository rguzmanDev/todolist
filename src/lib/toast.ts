export type ToastType = 'success' | 'error' | 'info' | 'confirm'

export interface ToastEvent {
  id: string
  type: ToastType
  message: string
  confirmLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
}

type Listener = (event: ToastEvent) => void

let _listener: Listener | null = null
let _counter = 0

function emit(type: ToastType, message: string, extra?: Partial<ToastEvent>) {
  const event: ToastEvent = { id: `toast-${++_counter}`, type, message, ...extra }
  _listener?.(event)
}

export const toast = {
  success: (message: string) => emit('success', message),
  error:   (message: string) => emit('error', message),
  info:    (message: string) => emit('info', message),
  confirm: (message: string, onConfirm: () => void, confirmLabel = 'Eliminar', onCancel?: () => void) =>
    emit('confirm', message, { onConfirm, onCancel, confirmLabel }),
  _subscribe: (fn: Listener) => {
    _listener = fn
    return () => { _listener = null }
  },
}
