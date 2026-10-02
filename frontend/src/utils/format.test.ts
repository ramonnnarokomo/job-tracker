import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatDaysAgo,
  formatPercent,
  formatSalaryRange,
  formatWeekLabel,
} from './format'

describe('formatDaysAgo', () => {
  it('uses natural words for today and yesterday', () => {
    expect(formatDaysAgo(0)).toBe('hoy')
    expect(formatDaysAgo(1)).toBe('ayer')
  })

  it('counts the days otherwise', () => {
    expect(formatDaysAgo(12)).toBe('hace 12 días')
  })
})

describe('formatSalaryRange', () => {
  it('formats a full range', () => {
    expect(formatSalaryRange(28, 34)).toBe('28–34 k€')
  })

  it('collapses equal bounds', () => {
    expect(formatSalaryRange(30, 30)).toBe('30 k€')
  })

  it('handles a single bound', () => {
    expect(formatSalaryRange(28, null)).toBe('desde 28 k€')
    expect(formatSalaryRange(null, 34)).toBe('hasta 34 k€')
  })

  it('returns null without salary', () => {
    expect(formatSalaryRange(null, null)).toBeNull()
  })
})

describe('dates', () => {
  it('formats the week label as dd/MM', () => {
    expect(formatWeekLabel('2026-08-10')).toBe('10/08')
  })

  it('formats dates without shifting the day', () => {
    expect(formatDate('2026-09-20')).toBe('20/09/2026')
    expect(formatDate('2026-01-01')).toBe('01/01/2026')
  })

  it('formats date-times', () => {
    expect(formatDateTime('2026-09-18T10:00:00')).toBe('18/09/2026 10:00')
  })
})

describe('formatPercent', () => {
  it('rounds to a whole percentage', () => {
    expect(formatPercent(0.3)).toBe('30 %')
    expect(formatPercent(0.666)).toBe('67 %')
  })

  it('shows a dash when there is no value', () => {
    expect(formatPercent(null)).toBe('—')
  })
})
