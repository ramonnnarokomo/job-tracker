import type { ApplicationStatus } from '../types'

/**
 * Status changes the backend accepts. Mirrored here so the UI can guide the
 * user (highlight drop targets, filter the "Mover a…" options) before asking
 * the API, which remains the source of truth.
 */
const ALLOWED_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  WISHLIST: ['APPLIED', 'REJECTED'],
  APPLIED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFER', 'REJECTED'],
  OFFER: ['REJECTED'],
  REJECTED: ['APPLIED'],
}

export function getAllowedTargets(from: ApplicationStatus): readonly ApplicationStatus[] {
  return ALLOWED_TRANSITIONS[from]
}

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}
