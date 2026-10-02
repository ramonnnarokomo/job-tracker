import { useState } from 'react'
import { STATUS_LABELS } from '../../constants'
import type { Application, ApplicationStatus } from '../../types'
import { getAllowedTargets } from '../../utils/transitions'

interface MoveMenuProps {
  application: Application
  onMove: (target: ApplicationStatus) => void
}

/**
 * Keyboard and screen-reader alternative to drag & drop. A native
 * <details>/<summary> disclosure is focusable and toggles with Enter/Space,
 * and it only lists the moves the backend allows.
 */
export function MoveMenu({ application, onMove }: MoveMenuProps) {
  const [open, setOpen] = useState(false)
  const targets = getAllowedTargets(application.status)

  return (
    <details
      className="move-menu"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      // Don't let clicks here reach the card, which would open the detail panel.
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          setOpen(false)
          event.currentTarget.querySelector('summary')?.focus()
        }
      }}
    >
      <summary className="move-menu__toggle" aria-label={`Mover ${application.company} a…`}>
        Mover a…
      </summary>
      <ul className="move-menu__options">
        {targets.map((target) => (
          <li key={target}>
            <button
              type="button"
              className="move-menu__option"
              data-status={target}
              onClick={() => {
                setOpen(false)
                onMove(target)
              }}
            >
              {STATUS_LABELS[target]}
            </button>
          </li>
        ))}
      </ul>
    </details>
  )
}
