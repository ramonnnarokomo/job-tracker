import type {
  Application,
  ApplicationDetail,
  ApplicationPayload,
  ApplicationStatus,
  CreateApplicationPayload,
} from '../types'
import { request } from './client'

export interface ApplicationFilters {
  status?: ApplicationStatus
  q?: string
}

/** Ordered by updatedAt, newest first. */
export function listApplications(
  filters: ApplicationFilters = {},
  signal?: AbortSignal,
): Promise<Application[]> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  const q = filters.q?.trim()
  if (q) params.set('q', q)

  const query = params.toString()
  return request<Application[]>(`/applications${query ? `?${query}` : ''}`, { signal })
}

export function getApplication(id: number, signal?: AbortSignal): Promise<ApplicationDetail> {
  return request<ApplicationDetail>(`/applications/${id}`, { signal })
}

export function createApplication(payload: CreateApplicationPayload): Promise<Application> {
  return request<Application>('/applications', { method: 'POST', body: payload })
}

export function updateApplication(id: number, payload: ApplicationPayload): Promise<Application> {
  return request<Application>(`/applications/${id}`, { method: 'PUT', body: payload })
}

/** Fails with a 422 ApiError when the backend does not allow the transition. */
export function changeApplicationStatus(
  id: number,
  status: ApplicationStatus,
): Promise<Application> {
  return request<Application>(`/applications/${id}/status`, { method: 'PATCH', body: { status } })
}

export function deleteApplication(id: number): Promise<void> {
  return request<void>(`/applications/${id}`, { method: 'DELETE' })
}
