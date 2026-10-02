import { useId, type DragEvent, type ReactNode } from 'react'
import { STATUS_LABELS } from '../../constants'
import type { ApplicationStatus } from '../../types'

/** How the column reacts to the card being dragged (if any). */
export type DropState = 'idle' | 'source' | 'valid' | 'invalid'

interface BoardColumnProps {
  status: ApplicationStatus
  count: number
  dropState: DropState
  isOver: boolean
  /** Must call event.preventDefault() to accept the drop. */
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDragLeave: () => void
  onDrop: () => void
  /** One <li> per card. */
  children: ReactNode
}

export function BoardColumn({
  status,
  count,
  dropState,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: BoardColumnProps) {
  const headingId = useId()
  const className = ['column', `column--${dropState}`, isOver && 'column--over']
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={className}
      data-status={status}
      aria-labelledby={headingId}
      onDragOver={onDragOver}
      onDragLeave={(event) => {
        // dragleave also fires when moving between children: ignore those.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onDragLeave()
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDrop()
      }}
    >
      <header className="column__header">
        <h2 id={headingId} className="column__title">
          {STATUS_LABELS[status]}
        </h2>
        <span className="column__count">
          <span aria-hidden="true">{count}</span>
          <span className="visually-hidden">
            {count === 1 ? '1 candidatura' : `${count} candidaturas`}
          </span>
        </span>
      </header>

      {count === 0 ? (
        <p className="column__empty">{dropState === 'valid' ? 'Suelta aquí' : 'Sin candidaturas'}</p>
      ) : (
        <ul className="column__list">{children}</ul>
      )}
    </section>
  )
}
