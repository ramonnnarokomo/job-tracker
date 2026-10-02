import { useState } from 'react'
import { getErrorMessage } from '../../api/client'
import { STATUS_LABELS } from '../../constants'
import { useApplications } from '../../hooks/useApplications'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useToast } from '../../hooks/useToast'
import type { Application, ApplicationStatus } from '../../types'
import { ApplicationDrawer } from '../ApplicationDrawer/ApplicationDrawer'
import { ApplicationFormModal } from '../ApplicationForm/ApplicationFormModal'
import { EmptyState, ErrorState, LoadingState } from '../common/StateMessage'
import { Board } from './Board'
import { BoardToolbar } from './BoardToolbar'
import './BoardView.css'

/** null = closed; `application` undefined = create, defined = edit. */
type FormState = { application?: Application } | null

export function BoardView() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim(), 300)
  const {
    applications,
    status,
    error,
    hasLoaded,
    reload,
    upsertApplication,
    removeApplication,
    moveApplication,
  } = useApplications(query)

  const [selected, setSelected] = useState<Application | null>(null)
  const [form, setForm] = useState<FormState>(null)

  async function handleMove(application: Application, target: ApplicationStatus) {
    try {
      await moveApplication(application, target)
      showToast(`«${application.company}» movida a ${STATUS_LABELS[target]}.`)
    } catch (err) {
      // The hook has already put the card back where it was.
      showToast(getErrorMessage(err), 'error')
    }
  }

  function handleSaved(application: Application, created: boolean) {
    upsertApplication(application)
    setForm(null)
    showToast(created ? 'Candidatura creada.' : 'Cambios guardados.')
  }

  function handleDeleted(id: number) {
    removeApplication(id)
    setSelected(null)
    showToast('Candidatura eliminada.')
  }

  function handleEdit(application: Application) {
    setSelected(null)
    setForm({ application })
  }

  function renderContent() {
    if (!hasLoaded) {
      return status === 'error' ? (
        <ErrorState message={error ?? ''} onRetry={reload} />
      ) : (
        <LoadingState label="Cargando candidaturas…" />
      )
    }
    if (applications.length === 0) {
      return query ? (
        <EmptyState title={`Ninguna candidatura coincide con «${query}».`}>
          <p>Prueba con otro nombre de empresa o puesto.</p>
        </EmptyState>
      ) : (
        <EmptyState title="Todavía no hay candidaturas">
          <p>Apunta las ofertas que te interesan y sigue su evolución aquí.</p>
          <button type="button" className="button button--primary" onClick={() => setForm({})}>
            Añadir la primera
          </button>
        </EmptyState>
      )
    }
    return <Board applications={applications} onOpen={setSelected} onMove={handleMove} />
  }

  const isRefreshing = hasLoaded && status === 'loading'

  return (
    <div className="board-view">
      <BoardToolbar
        search={search}
        onSearchChange={setSearch}
        isSearching={isRefreshing}
        onCreate={() => setForm({})}
      />

      {/* Data already on screen but the last refresh failed. */}
      {hasLoaded && status === 'error' && <ErrorState message={error ?? ''} onRetry={reload} />}

      <div className={isRefreshing ? 'board-view__content is-refreshing' : 'board-view__content'}>
        {renderContent()}
      </div>

      {selected && (
        <ApplicationDrawer
          application={selected}
          onClose={() => setSelected(null)}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
        />
      )}

      {form && (
        <ApplicationFormModal
          application={form.application}
          onClose={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
