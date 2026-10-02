import { WORK_MODE_LABELS } from '../../constants'
import type { Application, ApplicationStatus } from '../../types'
import { formatDateTime, formatDaysAgo, formatSalaryRange } from '../../utils/format'
import { MoveMenu } from './MoveMenu'

interface ApplicationCardProps {
  application: Application
  isDragging: boolean
  onOpen: (application: Application) => void
  onMove: (application: Application, target: ApplicationStatus) => void
  onDragStart: (application: Application) => void
  onDragEnd: () => void
}

export function ApplicationCard({
  application,
  isDragging,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
}: ApplicationCardProps) {
  const salary = formatSalaryRange(application.salaryMinK, application.salaryMaxK)

  return (
    // The whole card opens the detail panel on click. The company button gives
    // keyboard users the same action: its click bubbles up to this handler.
    <article
      className={`card${isDragging ? ' card--dragging' : ''}`}
      data-status={application.status}
      data-card-id={application.id}
      draggable
      onClick={() => onOpen(application)}
      onDragStart={(event) => {
        // Firefox only starts a drag if some data is set.
        event.dataTransfer.setData('text/plain', String(application.id))
        event.dataTransfer.effectAllowed = 'move'
        onDragStart(application)
      }}
      onDragEnd={onDragEnd}
    >
      <h3 className="card__company">
        <button type="button" className="card__open">
          {application.company}
        </button>
      </h3>
      <p className="card__position">{application.position}</p>

      <div className="card__meta">
        <span className="badge">{WORK_MODE_LABELS[application.workMode]}</span>
        {application.location && <span>{application.location}</span>}
        {salary && <span className="card__salary">{salary}</span>}
      </div>

      <div className="card__footer">
        <span title={`Actualizada el ${formatDateTime(application.updatedAt)}`}>
          <span className="visually-hidden">Última actualización: </span>
          {formatDaysAgo(application.daysSinceUpdate)}
        </span>
        {application.followUpDue && <span className="badge badge--warning">Hacer seguimiento</span>}
      </div>

      <MoveMenu application={application} onMove={(target) => onMove(application, target)} />
    </article>
  )
}
