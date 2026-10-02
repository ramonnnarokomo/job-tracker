// Display helpers. Dates arrive as ISO strings without time zone ("2026-09-20",
// "2026-09-18T10:00:00"), so we format them by slicing the string instead of
// going through Date, which would shift them to UTC.

/** 0 → "hoy", 1 → "ayer", 12 → "hace 12 días". */
export function formatDaysAgo(days: number): string {
  if (days <= 0) return 'hoy'
  if (days === 1) return 'ayer'
  return `hace ${days} días`
}

/** (28, 34) → "28–34 k€". Returns null when there is no salary information. */
export function formatSalaryRange(minK: number | null, maxK: number | null): string | null {
  if (minK !== null && maxK !== null) {
    return minK === maxK ? `${minK} k€` : `${minK}–${maxK} k€`
  }
  if (minK !== null) return `desde ${minK} k€`
  if (maxK !== null) return `hasta ${maxK} k€`
  return null
}

/** "2026-08-10" → "10/08". */
export function formatWeekLabel(isoDate: string): string {
  const [, month, day] = isoDate.split('-')
  return `${day}/${month}`
}

/** "2026-09-20" → "20/09/2026". */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

/** "2026-09-18T10:00:00" → "18/09/2026 10:00". */
export function formatDateTime(isoDateTime: string): string {
  const time = isoDateTime.slice(11, 16)
  return time ? `${formatDate(isoDateTime)} ${time}` : formatDate(isoDateTime)
}

/** 0.3 → "30 %", null → "—". */
export function formatPercent(ratio: number | null): string {
  if (ratio === null) return '—'
  return `${Math.round(ratio * 100)} %`
}
