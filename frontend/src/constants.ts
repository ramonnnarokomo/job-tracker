import type { ApplicationStatus, InitialStatus, WorkMode } from './types'

/** Board columns, in order. */
export const STATUSES: readonly ApplicationStatus[] = [
  'WISHLIST',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: 'Por aplicar',
  APPLIED: 'Aplicado',
  INTERVIEW: 'Entrevista',
  OFFER: 'Oferta',
  REJECTED: 'Descartado',
}

export const INITIAL_STATUSES: readonly InitialStatus[] = ['WISHLIST', 'APPLIED']

export const WORK_MODES: readonly WorkMode[] = ['ONSITE', 'HYBRID', 'REMOTE']

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  ONSITE: 'Presencial',
  HYBRID: 'Híbrido',
  REMOTE: 'Remoto',
}
