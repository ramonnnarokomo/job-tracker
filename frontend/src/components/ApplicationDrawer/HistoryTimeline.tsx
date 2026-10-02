import { STATUS_LABELS } from '../../constants'
import type { StatusChange } from '../../types'
import { formatDateTime } from '../../utils/format'

export function HistoryTimeline({ history }: { history: StatusChange[] }) {
  if (history.length === 0) {
    return <p className="drawer__muted">Sin cambios de estado registrados.</p>
  }

  return (
    <ol className="timeline">
      {history.map((change) => (
        <li
          key={`${change.changedAt}-${change.toStatus}`}
          className="timeline__item"
          data-status={change.toStatus}
        >
          <p>
            {change.fromStatus === null ? (
              <>
                Creada en <strong>{STATUS_LABELS[change.toStatus]}</strong>
              </>
            ) : (
              <>
                De <strong>{STATUS_LABELS[change.fromStatus]}</strong> a{' '}
                <strong>{STATUS_LABELS[change.toStatus]}</strong>
              </>
            )}
          </p>
          <time className="timeline__date" dateTime={change.changedAt}>
            {formatDateTime(change.changedAt)}
          </time>
        </li>
      ))}
    </ol>
  )
}
