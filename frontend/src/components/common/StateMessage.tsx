import type { ReactNode } from 'react'
import './StateMessage.css'

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="state-message" role="status">
      <span className="state-message__spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-message state-message--error" role="alert">
      <p className="state-message__title">Algo ha fallado</p>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button button--secondary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  children?: ReactNode
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="state-message">
      <p className="state-message__title">{title}</p>
      {children}
    </div>
  )
}
