import { describe, expect, it } from 'vitest'
import { jsonResponse, mockFetch } from '../test/helpers'
import { ApiError, NETWORK_ERROR_MESSAGE, NetworkError, request } from './client'

describe('request', () => {
  it('sends JSON and parses the response', async () => {
    const fetchMock = mockFetch(() => jsonResponse({ id: 1 }, 201))

    await expect(request('/applications', { method: 'POST', body: { a: 1 } })).resolves.toEqual({
      id: 1,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/applications',
      expect.objectContaining({
        method: 'POST',
        body: '{"a":1}',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    )
  })

  it('returns undefined for 204 No Content', async () => {
    mockFetch(() => new Response(null, { status: 204 }))
    await expect(request('/applications/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('turns a ProblemDetail into an ApiError with its detail and field errors', async () => {
    mockFetch(() =>
      jsonResponse(
        { title: 'Bad Request', status: 400, detail: 'Datos no válidos', errors: { company: 'must not be blank' } },
        400,
      ),
    )

    const error = await request('/applications').catch((err: unknown) => err)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(400)
    expect((error as ApiError).message).toBe('Datos no válidos')
    expect((error as ApiError).fieldErrors).toEqual({ company: 'must not be blank' })
  })

  it('reports a NetworkError when fetch itself fails', async () => {
    mockFetch(() => {
      throw new TypeError('Failed to fetch')
    })
    await expect(request('/stats')).rejects.toThrow(NETWORK_ERROR_MESSAGE)
  })

  it('reports a NetworkError when the dev proxy answers 502 (backend down)', async () => {
    mockFetch(() => new Response('', { status: 502, headers: { 'Content-Type': 'text/plain' } }))
    await expect(request('/stats')).rejects.toBeInstanceOf(NetworkError)
  })
})
