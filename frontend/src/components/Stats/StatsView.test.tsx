import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { jsonResponse, mockFetch } from '../../test/helpers'
import type { Stats } from '../../types'
import { StatsView } from './StatsView'

const stats: Stats = {
  total: 12,
  byStatus: { WISHLIST: 2, APPLIED: 5, INTERVIEW: 2, OFFER: 1, REJECTED: 2 },
  active: 8,
  interviewRate: 0.3,
  followUpDue: 3,
  weekly: [
    { weekStart: '2026-08-10', count: 2 },
    { weekStart: '2026-08-17', count: 0 },
    { weekStart: '2026-08-24', count: 1 },
    { weekStart: '2026-08-31', count: 3 },
    { weekStart: '2026-09-07', count: 0 },
    { weekStart: '2026-09-14', count: 4 },
    { weekStart: '2026-09-21', count: 1 },
    { weekStart: '2026-09-28', count: 1 },
  ],
}

describe('StatsView', () => {
  it('shows the KPIs, the weekly chart and the breakdown by status', async () => {
    mockFetch(() => jsonResponse(stats))
    render(<StatsView />)

    expect(await screen.findByText('30 %')).toBeInTheDocument()
    expect(screen.getByText('Tasa de entrevistas')).toBeInTheDocument()

    const chart = screen.getByRole('img', { name: /Candidaturas por semana/ })
    expect(chart).toHaveAccessibleName(/Semana del 10\/08: 2 candidaturas/)
    expect(chart.querySelectorAll('.weekly-chart__column')).toHaveLength(6) // weeks with count > 0
    expect(within(chart).getByText('28/09')).toBeInTheDocument()

    const breakdown = screen.getByRole('list')
    expect(within(breakdown).getByText('Aplicado').closest('li')).toHaveTextContent('5 (42 %)')
  })

  it('shows an empty state when there are no applications', async () => {
    mockFetch(() =>
      jsonResponse({
        ...stats,
        total: 0,
        active: 0,
        followUpDue: 0,
        interviewRate: null,
        byStatus: { WISHLIST: 0, APPLIED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 },
        weekly: stats.weekly.map((week) => ({ ...week, count: 0 })),
      }),
    )
    render(<StatsView />)

    expect(await screen.findByText('Aún no hay estadísticas')).toBeInTheDocument()
  })
})
