import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastKind } from './ToastContext'
import './Toast.css'

interface Toast {
  id: number
  message: string
  kind: ToastKind
}

const DURATION_MS: Record<ToastKind, number> = { success: 4000, error: 8000 }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    nextId.current += 1
    const id = nextId.current
    setToasts((list) => [...list, { id, message, kind }])
  }, [])

  const api = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext value={api}>
      {children}
      {/* The live region is always in the DOM so screen readers announce new toasts. */}
      <div className="toast-region" aria-live="polite">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext>
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: number) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(toast.id), DURATION_MS[toast.kind])
    return () => window.clearTimeout(timeout)
  }, [toast, onDismiss])

  return (
    <div className={`toast toast--${toast.kind}`}>
      <p className="toast__message">{toast.message}</p>
      <button
        type="button"
        className="toast__close"
        aria-label="Cerrar aviso"
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
    </div>
  )
}
