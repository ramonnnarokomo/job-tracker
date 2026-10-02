import { createContext } from 'react'

export type ToastKind = 'success' | 'error'

export interface ToastApi {
  showToast: (message: string, kind?: ToastKind) => void
}

export const ToastContext = createContext<ToastApi | null>(null)
