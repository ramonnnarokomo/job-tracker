import { STATUSES, STATUS_LABELS } from '../../constants'
import type { ApplicationStatus } from '../../types'
import { formatPercent } from '../../utils/format'

interface StatusBreakdownProps {
  byStatus: Record<ApplicationStatus, number>
  total: number
}

/** One horizontal bar per status, proportional to its share of the total. */
export function StatusBreakdown({ byStatus, total }: StatusBreakdownProps) {
  return (
    <ul className="breakdown">
      {STATUSES.map((status) => {
        const count = byStatus[status] ?? 0
        const share = total > 0 ? count / total : 0
        return (
          <li key={status} className="breakdown__row" data-status={status}>
            <span className="breakdown__label">{STATUS_LABELS[status]}</span>
            {/* The bar is decorative: the numbers next to it carry the information. */}
            <span className="breakdown__track" aria-hidden="true">
              {count > 0 && <span className="breakdown__fill" style={{ width: `${share * 100}%` }} />}
            </span>
            <span className="breakdown__value">
              {count} <span className="breakdown__share">({formatPercent(share)})</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
