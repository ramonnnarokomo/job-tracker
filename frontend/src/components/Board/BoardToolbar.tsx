import { useId } from 'react'

interface BoardToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  isSearching: boolean
  onCreate: () => void
}

export function BoardToolbar({ search, onSearchChange, isSearching, onCreate }: BoardToolbarProps) {
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
      <button type="button" className="button button--primary" onClick={onCreate}>
        <span aria-hidden="true">+</span> Nueva candidatura
      </button>
    </div>
  )
}
