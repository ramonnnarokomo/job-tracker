import { useCallback } from 'react'
import { getApplication } from '../api/applications'
import { useApiResource } from './useApiResource'

/** Full application, including its status history. */
export function useApplicationDetail(id: number) {
  const load = useCallback((signal: AbortSignal) => getApplication(id, signal), [id])
  return useApiResource(load)
}
