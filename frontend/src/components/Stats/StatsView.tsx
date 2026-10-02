import { useStats } from '../../hooks/useStats'
import { formatPercent } from '../../utils/format'
import { EmptyState, ErrorState, LoadingState } from '../common/StateMessage'
import { KpiTile } from './KpiTile'
import { StatusBreakdown } from './StatusBreakdown'
import { WeeklyChart } from './WeeklyChart'
import './Stats.css'

export function StatsView() {
  const { data: stats, status, error, reload } = useStats()

  if (!stats) {
    return status === 'error' ? (
      <ErrorState message={error ?? ''} onRetry={reload} />
    ) : (
      <LoadingState label="Cargando estadísticas…" />
    )
  }

  if (stats.total === 0) {
    return (
      <EmptyState title="Aún no hay estadísticas">
        <p>Cuando registres candidaturas en el tablero verás aquí cómo avanzan.</p>
      </EmptyState>
    )
  }

  return (
    <div className="stats">
      <dl className="stats__kpis">
        <KpiTile label="Total" value={stats.total} hint="Candidaturas registradas" />
        <KpiTile label="En proceso" value={stats.active} hint="Candidaturas todavía abiertas" />
        <KpiTile
          label="Tasa de entrevistas"
          value={formatPercent(stats.interviewRate)}
          hint={stats.interviewRate === null ? 'Aún sin datos suficientes' : 'Aplicaciones que llegan a entrevista'}
        />
        <KpiTile
          label="Pendientes de seguimiento"
          value={stats.followUpDue}
          hint="Sin novedades desde hace días"
          highlight={stats.followUpDue > 0}
        />
      </dl>

      <div className="stats__panels">
        <section className="panel" aria-labelledby="weekly-heading">
          <header className="panel__header">
            <h2 id="weekly-heading" className="panel__title">
              Candidaturas por semana
            </h2>
            <p className="panel__subtitle">Últimas 8 semanas</p>
          </header>
          <WeeklyChart weeks={stats.weekly} />
        </section>

        <section className="panel" aria-labelledby="breakdown-heading">
          <header className="panel__header">
            <h2 id="breakdown-heading" className="panel__title">
              Por estado
            </h2>
            <p className="panel__subtitle">Reparto de tus {stats.total} candidaturas</p>
          </header>
          <StatusBreakdown byStatus={stats.byStatus} total={stats.total} />
        </section>
      </div>
    </div>
  )
}
