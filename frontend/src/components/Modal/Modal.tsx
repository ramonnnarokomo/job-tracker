import { useEffect, useId, useRef, type ReactNode } from 'react'
import './Modal.css'

interface ModalProps {
  title: string
  onClose: () => void
  /** "dialog" for forms, "drawer" for the side panel, "alert" for short confirmations. */
  variant?: 'dialog' | 'drawer' | 'alert'
  /** Use .modal__body / .modal__footer inside to get the standard layout. */
  children: ReactNode
}

/**
 * Thin wrapper around the native <dialog>. `showModal()` gives us for free:
 * focus moved inside, the rest of the page made inert and Escape handling.
 * Render it conditionally: mounted = open.
 */
export function Modal({ title, onClose, variant = 'dialog', children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pointerDownOnBackdrop = useRef(false)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previouslyFocused = document.activeElement
    dialog.showModal()
    // showModal() focuses the first focusable element (the close button);
    // a child can ask for a better starting point with data-autofocus.
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()

    return () => {
      dialog.close()
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${variant}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape: let React decide when to unmount instead of closing natively.
        event.preventDefault()
        onClose()
      }}
      onPointerDown={(event) => {
        pointerDownOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        // Clicks on the backdrop target the <dialog> itself. Checking where the
        // pointer went down avoids closing when a text selection ends outside.
        if (pointerDownOnBackdrop.current && event.target === event.currentTarget) onClose()
      }}
    >
      <header className="modal__header">
        <h2 id={titleId} className="modal__title">
          {title}
        </h2>
        <button type="button" className="modal__close" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>
      </header>
      {children}
    </dialog>
  )
}
