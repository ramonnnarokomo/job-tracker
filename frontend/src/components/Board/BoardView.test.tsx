import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { NETWORK_ERROR_MESSAGE } from '../../api/client'
import { jsonResponse, makeApplication, mockFetch } from '../../test/helpers'
import { ToastProvider } from '../Toast/ToastProvider'
import { BoardView } from './BoardView'

const applications = [
  makeApplication({ id: 1, company: 'Acme Logistics', status: 'APPLIED', followUpDue: true }),
  makeApplication({ id: 2, company: 'Globex', status: 'WISHLIST', salaryMinK: null, salaryMaxK: null }),
  makeApplication({ id: 3, company: 'Initech', status: 'INTERVIEW', daysSinceUpdate: 1 }),
]

function renderBoard() {
  return render(
    <ToastProvider>
      <BoardView />
    </ToastProvider>,
  )
}

function getColumn(name: string) {
  return screen.getByRole('region', { name })
}

async function openMoveMenu(company: string) {
  const user = userEvent.setup()
  const card = (await screen.findByRole('button', { name: company })).closest('article')!
  await user.click(within(card).getByText('Mover a…'))
  return { user, card, menu: within(card).getByRole('list') }
}

describe('BoardView', () => {
  it('renders the five columns with their cards and counts', async () => {
    mockFetch(() => jsonResponse(applications))
    renderBoard()

    await screen.findByRole('button', { name: 'Acme Logistics' })
    expect(screen.getAllByRole('region')).toHaveLength(5)

    const applied = getColumn('Aplicado')
    expect(within(applied).getByText('1 candidatura')).toBeInTheDocument()
    expect(within(applied).getByText('Desarrollador Full-Stack')).toBeInTheDocument()
    expect(within(applied).getByText('28–34 k€')).toBeInTheDocument()
    expect(within(applied).getByText('hace 12 días')).toBeInTheDocument()
    expect(within(applied).getByText('Hacer seguimiento')).toBeInTheDocument()

    expect(within(getColumn('Por aplicar')).getByText('Globex')).toBeInTheDocument()
    expect(within(getColumn('Entrevista')).getByText('ayer')).toBeInTheDocument()
    expect(within(getColumn('Oferta')).getByText('Sin candidaturas')).toBeInTheDocument()
  })

  it('only offers the allowed moves in the "Mover a…" menu', async () => {
    mockFetch(() => jsonResponse(applications))
    renderBoard()

    const { menu } = await openMoveMenu('Acme Logistics')
    const options = within(menu).getAllByRole('button').map((button) => button.textContent)
    expect(options).toEqual(['Entrevista', 'Descartado'])
  })

  it('moves a card with the menu and confirms it with a toast', async () => {
    const fetchMock = mockFetch((_url, init) => {
      if (init.method === 'PATCH') {
        return jsonResponse(
          makeApplication({ id: 1, status: 'INTERVIEW', updatedAt: '2026-10-02T09:00:00' }),
        )
      }
      return jsonResponse(applications)
    })
    renderBoard()

    const { user, menu } = await openMoveMenu('Acme Logistics')
    await user.click(within(menu).getByRole('button', { name: 'Entrevista' }))

    expect(await screen.findByText('«Acme Logistics» movida a Entrevista.')).toBeInTheDocument()
    expect(within(getColumn('Entrevista')).getByText('Acme Logistics')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/applications/1/status',
      expect.objectContaining({ method: 'PATCH', body: '{"status":"INTERVIEW"}' }),
    )
  })

  it('puts the card back and shows the API detail when the move is rejected', async () => {
    const detail = 'No se puede pasar de «Aplicado» a «Entrevista».'
    mockFetch((_url, init) =>
      init.method === 'PATCH'
        ? jsonResponse({ title: 'Unprocessable Entity', status: 422, detail }, 422)
        : jsonResponse(applications),
    )
    renderBoard()

    const { user, menu } = await openMoveMenu('Acme Logistics')
    await user.click(within(menu).getByRole('button', { name: 'Entrevista' }))

    expect(await screen.findByText(detail)).toBeInTheDocument()
    expect(within(getColumn('Aplicado')).getByText('Acme Logistics')).toBeInTheDocument()
    expect(within(getColumn('Entrevista')).queryByText('Acme Logistics')).not.toBeInTheDocument()
  })

  it('searches through the API after the user stops typing', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch(() => jsonResponse(applications))
    renderBoard()
    await screen.findByRole('button', { name: 'Acme Logistics' })

    await user.type(screen.getByRole('searchbox', { name: 'Buscar candidaturas' }), 'acme')

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith('/api/applications?q=acme', expect.anything()),
    )
    // Debounced: no request for the intermediate values "a", "ac", "acm".
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('explains how to fix it when the backend is not reachable', async () => {
    mockFetch(() => {
      throw new TypeError('Failed to fetch')
    })
    renderBoard()

    expect(await screen.findByText(NETWORK_ERROR_MESSAGE)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})
