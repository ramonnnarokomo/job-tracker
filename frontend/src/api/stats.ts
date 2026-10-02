import type { Stats } from '../types'
import { request } from './client'

export function getStats(signal?: AbortSignal): Promise<Stats> {
  return request<Stats>('/stats', { signal })
}
