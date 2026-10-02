import { getStats } from '../api/stats'
import { useApiResource } from './useApiResource'

export function useStats() {
  // getStats is a module-level function, so it is already stable between renders.
  return useApiResource(getStats)
}
