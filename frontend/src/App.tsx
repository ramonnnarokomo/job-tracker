import { useState } from 'react'
import { BoardView } from './components/Board/BoardView'
import { StatsView } from './components/Stats/StatsView'
import { ToastProvider } from './components/Toast/ToastProvider'
import { readStorage, writeStorage } from './utils/storage'
import './App.css'

type Tab = 'board' | 'stats'

const TABS: { id: Tab; label: string }[] = [
  { id: 'board', label: 'Tablero' },
  { id: 'stats', label: 'Estadísticas' },
]

const TAB_STORAGE_KEY = 'job-tracker:tab'

function readSavedTab(): Tab {
  return readStorage(TAB_STORAGE_KEY) === 'stats' ? 'stats' : 'board'
}

export default function App() {
  // Lazy initial state: localStorage is only read on the first render.
  const [tab, setTab] = useState<Tab>(readSavedTab)

  function selectTab(next: Tab) {
    setTab(next)
    writeStorage(TAB_STORAGE_KEY, next)
  }

  return (
    <ToastProvider>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <h1 className="app-header__title">Job Tracker</h1>
            <p className="app-header__subtitle">Seguimiento de candidaturas</p>
          </div>
          <nav className="tabs" aria-label="Secciones">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className="tabs__tab"
                aria-current={tab === id ? 'page' : undefined}
                onClick={() => selectTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">{tab === 'board' ? <BoardView /> : <StatsView />}</main>
    </ToastProvider>
  )
}
