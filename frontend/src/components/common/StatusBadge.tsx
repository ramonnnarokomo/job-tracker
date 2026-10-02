import { STATUS_LABELS } from '../../constants'
import type { ApplicationStatus } from '../../types'

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className="badge badge--status" data-status={status}>
      {STATUS_LABELS[status]}
    </span>
  )
}
