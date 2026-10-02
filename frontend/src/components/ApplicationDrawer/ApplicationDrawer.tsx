import { useState, type ReactNode } from 'react'
import { deleteApplication } from '../../api/applications'
import { WORK_MODE_LABELS } from '../../constants'
import { useApplicationDetail } from '../../hooks/useApplicationDetail'
import type { Application } from '../../types'
import { formatDate, formatDateTime, formatDaysAgo, formatSalaryRange } from '../../utils/format'
import { ErrorState, LoadingState } from '../common/StateMessage'
import { StatusBadge } from '../common/StatusBadge'
import { ConfirmDialog } from '../Modal/ConfirmDialog'
import { Modal } from '../Modal/Modal'
import { HistoryTimeline } from './HistoryTimeline'
import './ApplicationDrawer.css'

interface ApplicationDrawerProps {
  /** The card that was clicked: shown right away while the detail loads. */
  application: Application
  onClose: () => void
  onEdit: (application: Application) => void
  onDeleted: (id: number) => void
}

export function ApplicationDrawer({ application, onClose, onEdit, onDeleted }: ApplicationDrawerProps) {
  const detail = useApplicationDetail(application.id)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const current = detail.data ?? application
  const salary = formatSalaryRange(current.salaryMinK, current.salaryMaxK)

  async function handleDelete() {
    await deleteApplication(current.id)
    onDeleted(current.id)
  }

  return (
    <>
      <Modal title={current.company} variant="drawer" onClose={onClose}>
        <div className="modal__body drawer">
          <div className="drawer__summary">
            <p className="drawer__position">{current.position}</p>
            <div className="drawer__badges">
              <StatusBadge status={current.status} />
              <span className="badge">{WORK_MODE_LABELS[current.workMode]}</span>
              {current.followUpDue && <span className="badge badge--warning">Hacer seguimiento</span>}
            </div>
          </div>

          <dl className="drawer__details">
            <DetailRow label="Ubicación">{current.location}</DetailRow>
            <DetailRow label="Salario">{salary}</DetailRow>
            <DetailRow label="Fuente">{current.source}</DetailRow>
            <DetailRow label="Oferta">
              {current.jobUrl && (
                <a href={current.jobUrl} target="_blank" rel="noreferrer">
                  Ver oferta<span className="visually-hidden"> (se abre en otra pestaña)</span>
                </a>
              )}
            </DetailRow>
            <DetailRow label="Fecha de aplicación">
              {current.appliedAt && formatDate(current.appliedAt)}
            </DetailRow>
            <DetailRow label="Creada">{formatDateTime(current.createdAt)}</DetailRow>
            <DetailRow label="Actualizada">
              {formatDateTime(current.updatedAt)} ({formatDaysAgo(current.daysSinceUpdate)})
            </DetailRow>
          </dl>

          {current.notes && (
            <section className="drawer__section">
              <h3 className="drawer__heading">Notas</h3>
              <p className="drawer__notes">{current.notes}</p>
            </section>
          )}

          <section className="drawer__section">
            <h3 className="drawer__heading">Historial</h3>
            {detail.data ? (
              <HistoryTimeline history={detail.data.history} />
            ) : detail.status === 'error' ? (
              <ErrorState message={detail.error ?? ''} onRetry={detail.reload} />
            ) : (
              <LoadingState label="Cargando historial…" />
            )}
          </section>
        </div>

        <div className="modal__footer">
          <button
            type="button"
            className="button button--danger-outline"
            onClick={() => setConfirmingDelete(true)}
          >
            Eliminar
          </button>
          <button type="button" className="button button--primary" onClick={() => onEdit(current)}>
            Editar
          </button>
        </div>
      </Modal>

      {/* Rendered next to the drawer, not inside it, so its events don't reach the drawer. */}
      {confirmingDelete && (
        <ConfirmDialog
          title="¿Eliminar candidatura?"
          confirmLabel="Eliminar"
          pendingLabel="Eliminando…"
          onConfirm={handleDelete}
          onClose={() => setConfirmingDelete(false)}
        >
          <p>
            Se eliminará la candidatura a <strong>{current.company}</strong> con todo su
            historial. Esta acción no se puede deshacer.
          </p>
        </ConfirmDialog>
      )}
    </>
  )
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="drawer__row">
      <dt>{label}</dt>
      <dd>{children || <span className="drawer__muted">—</span>}</dd>
    </div>
  )
}
