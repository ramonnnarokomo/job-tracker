import { useId } from 'react'

interface BoardToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  isSearching: boolean
  onCreate: () => void
  /** Exports the applications currently on the board; disabled when there are none. */
  onExport: () => void
  canExport: boolean
}

export function BoardToolbar({
  search,
  onSearchChange,
  isSearching,
  onCreate,
  onExport,
  canExport,
}: BoardToolbarProps) {
  const searchId = useId()

  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <label htmlFor={searchId} className="visually-hidden">
          Buscar candidaturas
        </label>
        <input
          id={searchId}
          type="search"
          className="input"
          placeholder="Buscar por empresa, puesto…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {isSearching && (
          <span className="toolbar__searching" role="status">
            Buscando…
          </span>
        )}
      </div>
      <div className="toolbar__actions">
        <button type="button" className="button button--secondary" onClick={onExport} disabled={!canExport}>
          Exportar CSV
        </button>
        <button type="button" className="button button--primary" onClick={onCreate}>
          <span aria-hidden="true">+</span> Nueva candidatura
        </button>
      </div>
    </div>
  )
}
