import { useState, type ReactNode } from 'react'
import { getErrorMessage } from '../../api/client'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  title: string
  confirmLabel: string
  pendingLabel: string
  /** If it throws, the error is shown inside the dialog. */
  onConfirm: () => Promise<void>
  onClose: () => void
  children: ReactNode
}

export function ConfirmDialog({
  title,
  confirmLabel,
  pendingLabel,
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setPending(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(getErrorMessage(err))
      setPending(false)
    }
  }

  return (
    <Modal title={title} variant="alert" onClose={onClose}>
      <div className="modal__body">
        {children}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="modal__footer">
        {/* The safe option gets the initial focus. */}
        <button
          type="button"
          className="button button--secondary"
          onClick={onClose}
          disabled={pending}
          data-autofocus
        >
          Cancelar
        </button>
        <button
          type="button"
          className="button button--danger"
          onClick={handleConfirm}
          disabled={pending}
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
