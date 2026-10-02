import { vi } from 'vitest'
import type { Application } from '../types'

export function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 1,
    company: 'Acme Logistics',
    position: 'Desarrollador Full-Stack',
    location: 'Madrid',
    workMode: 'HYBRID',
    source: 'LinkedIn',
    jobUrl: 'https://example.com/jobs/1',
    salaryMinK: 28,
    salaryMaxK: 34,
    status: 'APPLIED',
    appliedAt: '2026-09-20',
    createdAt: '2026-09-18T10:00:00',
    updatedAt: '2026-09-20T09:12:00',
    notes: null,
    daysSinceUpdate: 12,
    followUpDue: false,
    ...overrides,
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

type Handler = (url: string, init: RequestInit) => Response | Promise<Response>

/** Replaces the global fetch with `handler`; returns the mock to inspect calls. */
export function mockFetch(handler: Handler) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) =>
    handler(String(input), init),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
