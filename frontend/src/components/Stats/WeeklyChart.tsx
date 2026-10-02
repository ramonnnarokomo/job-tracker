import { useId } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import type { WeeklyCount } from '../../types'
import { formatWeekLabel } from '../../utils/format'

const HEIGHT = 220
const MARGIN = { top: 24, right: 4, bottom: 28, left: 4 }
const MAX_BAR_WIDTH = 28
const CORNER_RADIUS = 4

/**
 * Column path with rounded top corners and a square base:
 * starts bottom-left, goes up, across the top and back down.
 */
function barPath(x: number, baseline: number, width: number, height: number): string {
  const r = Math.min(CORNER_RADIUS, height, width / 2)
  const top = baseline - height
  return [
    `M${x},${baseline}`,
    `V${top + r}`,
    `Q${x},${top} ${x + r},${top}`,
    `H${x + width - r}`,
    `Q${x + width},${top} ${x + width},${top + r}`,
    `V${baseline}`,
    'Z',
  ].join(' ')
}

function pluralize(count: number): string {
  return count === 1 ? '1 candidatura' : `${count} candidaturas`
}

export function WeeklyChart({ weeks }: { weeks: WeeklyCount[] }) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>(560)
  const titleId = useId()
  const descId = useId()

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const baseline = MARGIN.top + plotHeight
  const bandWidth = weeks.length > 0 ? plotWidth / weeks.length : 0
  const barWidth = Math.min(MAX_BAR_WIDTH, bandWidth * 0.6)
  // At least 1 so an all-zero chart doesn't divide by zero.
  const maxCount = Math.max(1, ...weeks.map((week) => week.count))
  const total = weeks.reduce((sum, week) => sum + week.count, 0)

  const description = weeks
    .map((week) => `Semana del ${formatWeekLabel(week.weekStart)}: ${pluralize(week.count)}`)
    .join('. ')

  return (
    <div className="weekly-chart">
      {total === 0 && (
        <p className="weekly-chart__empty">No has registrado candidaturas en las últimas 8 semanas.</p>
      )}

      <div ref={containerRef} className="weekly-chart__canvas">
        <svg width={width} height={HEIGHT} role="img" aria-labelledby={`${titleId} ${descId}`}>
          <title id={titleId}>Candidaturas por semana</title>
          <desc id={descId}>{description}</desc>

          <line
            className="weekly-chart__baseline"
            x1={MARGIN.left}
            x2={MARGIN.left + plotWidth}
            y1={baseline}
            y2={baseline}
          />

          {weeks.map((week, index) => {
            const centerX = MARGIN.left + bandWidth * index + bandWidth / 2
            const barHeight = (week.count / maxCount) * plotHeight
            const label = formatWeekLabel(week.weekStart)
            return (
              <g key={week.weekStart} className="weekly-chart__bar">
                {/* Native tooltip; the hit area covers the whole band, not just the bar. */}
                <title>{`Semana del ${label}: ${pluralize(week.count)}`}</title>
                <rect
                  className="weekly-chart__hit"
                  x={centerX - bandWidth / 2}
                  y={MARGIN.top}
                  width={bandWidth}
                  height={plotHeight}
                />
                {barHeight > 0 && (
                  <path
                    className="weekly-chart__column"
                    d={barPath(centerX - barWidth / 2, baseline, barWidth, barHeight)}
                  />
                )}
                <text
                  className="weekly-chart__value"
                  x={centerX}
                  y={baseline - barHeight - 6}
                  textAnchor="middle"
                >
                  {week.count}
                </text>
                <text
                  className="weekly-chart__label"
                  x={centerX}
                  y={baseline + 18}
                  textAnchor="middle"
                >
                  {label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Same data as a table, for anyone who can't use the chart. */}
      <details className="weekly-chart__table">
        <summary>Ver datos en tabla</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Semana del</th>
              <th scope="col">Candidaturas</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week.weekStart}>
                <td>{formatWeekLabel(week.weekStart)}</td>
                <td>{week.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
