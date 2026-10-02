import { useRef, useState, type DragEvent } from 'react'
import { STATUSES } from '../../constants'
import type { Application, ApplicationStatus } from '../../types'
import { canTransition } from '../../utils/transitions'
import { ApplicationCard } from './ApplicationCard'
import { BoardColumn, type DropState } from './BoardColumn'
import './Board.css'

interface BoardProps {
  applications: Application[]
  onOpen: (application: Application) => void
  onMove: (application: Application, target: ApplicationStatus) => void
}

export function Board({ applications, onOpen, onMove }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  // The card being dragged is kept twice: the ref is read by the drag event
  // handlers (it is up to date immediately, drag events don't wait for React
  // to re-render) and the state drives the column highlighting.
  const draggedRef = useRef<Application | null>(null)
  const [dragged, setDragged] = useState<Application | null>(null)
  const [overStatus, setOverStatus] = useState<ApplicationStatus | null>(null)

  function getDropState(status: ApplicationStatus): DropState {
    if (!dragged) return 'idle'
    if (dragged.status === status) return 'source'
    return canTransition(dragged.status, status) ? 'valid' : 'invalid'
  }

  function handleDragStart(application: Application) {
    draggedRef.current = application
    // Re-rendering inside dragstart would end up in the browser's drag image
    // (the faded card), so the visual update waits for the next tick.
    window.setTimeout(() => setDragged(draggedRef.current))
  }

  function handleDragOver(event: DragEvent<HTMLElement>, status: ApplicationStatus) {
    const source = draggedRef.current
    if (!source || !canTransition(source.status, status)) return
    // Calling preventDefault() is what tells the browser the drop is allowed.
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setOverStatus(status)
  }

  function handleDrop(target: ApplicationStatus) {
    const source = draggedRef.current
    if (source && canTransition(source.status, target)) {
      onMove(source, target)
    }
    endDrag()
  }

  function endDrag() {
    draggedRef.current = null
    setDragged(null)
    setOverStatus(null)
  }

  function handleMenuMove(application: Application, target: ApplicationStatus) {
    onMove(application, target)
    // The card is rendered again inside another column, so keyboard focus
    // would be lost. Put it back on the card once React has updated the DOM.
    requestAnimationFrame(() => {
      boardRef.current
        ?.querySelector<HTMLElement>(`[data-card-id="${application.id}"] .card__open`)
        ?.focus()
    })
  }

  return (
    <div ref={boardRef} className="board">
      {STATUSES.map((status) => {
        const columnApplications = applications.filter((item) => item.status === status)
        return (
          <BoardColumn
            key={status}
            status={status}
            count={columnApplications.length}
            dropState={getDropState(status)}
            isOver={overStatus === status}
            onDragOver={(event) => handleDragOver(event, status)}
            onDragLeave={() => setOverStatus((current) => (current === status ? null : current))}
            onDrop={() => handleDrop(status)}
          >
            {columnApplications.map((application) => (
              <li key={application.id}>
                <ApplicationCard
                  application={application}
                  isDragging={dragged?.id === application.id}
                  onOpen={onOpen}
                  onMove={handleMenuMove}
                  onDragStart={handleDragStart}
                  onDragEnd={endDrag}
                />
              </li>
            ))}
          </BoardColumn>
        )
      })}
    </div>
  )
}
