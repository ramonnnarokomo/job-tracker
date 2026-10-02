import { useCallback } from 'react'
import { changeApplicationStatus, listApplications } from '../api/applications'
import type { Application, ApplicationStatus } from '../types'
import { useApiResource } from './useApiResource'

/** Same order as the API: most recently updated first. */
function sortByMostRecent(applications: Application[]): Application[] {
  return [...applications].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function useApplications(query: string) {
  const load = useCallback(
    (signal: AbortSignal) => listApplications({ q: query }, signal),
    [query],
  )
  const { status, data, error, reload, setData } = useApiResource(load)

  const upsertApplication = useCallback(
    (application: Application) => {
      setData((list) =>
        sortByMostRecent([application, ...list.filter((item) => item.id !== application.id)]),
      )
    },
    [setData],
  )

  const removeApplication = useCallback(
    (id: number) => setData((list) => list.filter((item) => item.id !== id)),
    [setData],
  )

  /** Optimistic update: move the card right away and undo it if the API refuses. */
  const moveApplication = useCallback(
    async (application: Application, target: ApplicationStatus) => {
      upsertApplication({ ...application, status: target })
      try {
        const updated = await changeApplicationStatus(application.id, target)
        upsertApplication(updated)
        return updated
      } catch (error) {
        upsertApplication(application)
        throw error
      }
    },
    [upsertApplication],
  )

  return {
    applications: data ?? [],
    status,
    error,
    hasLoaded: data !== null,
    reload,
    upsertApplication,
    removeApplication,
    moveApplication,
  }
}
