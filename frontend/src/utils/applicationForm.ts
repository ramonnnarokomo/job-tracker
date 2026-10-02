import { INITIAL_STATUSES, WORK_MODES } from '../constants'
import type { Application, ApplicationPayload, InitialStatus, WorkMode } from '../types'

/** What the form inputs hold: always strings, empty when not filled in. */
export interface ApplicationFormValues {
  company: string
  position: string
  location: string
  workMode: WorkMode
  source: string
  jobUrl: string
  salaryMinK: string
  salaryMaxK: string
  status: InitialStatus
  appliedAt: string
  notes: string
}

export type FormField = keyof ApplicationFormValues
export type FormErrors = Partial<Record<FormField, string>>

export function toFormValues(application?: Application): ApplicationFormValues {
  return {
    company: application?.company ?? '',
    position: application?.position ?? '',
    location: application?.location ?? '',
    workMode: application?.workMode ?? 'HYBRID',
    source: application?.source ?? '',
    jobUrl: application?.jobUrl ?? '',
    salaryMinK: application?.salaryMinK?.toString() ?? '',
    salaryMaxK: application?.salaryMaxK?.toString() ?? '',
    status: 'APPLIED',
    appliedAt: application?.appliedAt ?? '',
    notes: application?.notes ?? '',
  }
}

/** Mirrors the backend rules so most mistakes are caught before sending. */
export function validateApplicationForm(values: ApplicationFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.company.trim()) errors.company = 'La empresa es obligatoria.'
  if (!values.position.trim()) errors.position = 'El puesto es obligatorio.'
  if (!WORK_MODES.includes(values.workMode)) errors.workMode = 'Elige una modalidad.'
  if (!INITIAL_STATUSES.includes(values.status)) errors.status = 'Elige un estado inicial.'

  if (values.jobUrl.trim() && !isHttpUrl(values.jobUrl.trim())) {
    errors.jobUrl = 'Introduce una URL válida que empiece por http:// o https://.'
  }

  const salaryMin = parseSalary(values.salaryMinK)
  const salaryMax = parseSalary(values.salaryMaxK)
  if (salaryMin === undefined) errors.salaryMinK = 'Introduce un número entero (0 o más).'
  if (salaryMax === undefined) errors.salaryMaxK = 'Introduce un número entero (0 o más).'
  if (typeof salaryMin === 'number' && typeof salaryMax === 'number' && salaryMin > salaryMax) {
    errors.salaryMaxK = 'El máximo no puede ser menor que el mínimo.'
  }

  return errors
}

/** Converts the form strings into the JSON the API expects (empty → null). */
export function toPayload(values: ApplicationFormValues): ApplicationPayload {
  return {
    company: values.company.trim(),
    position: values.position.trim(),
    location: emptyToNull(values.location),
    workMode: values.workMode,
    source: emptyToNull(values.source),
    jobUrl: emptyToNull(values.jobUrl),
    salaryMinK: parseSalary(values.salaryMinK) ?? null,
    salaryMaxK: parseSalary(values.salaryMaxK) ?? null,
    appliedAt: emptyToNull(values.appliedAt),
    notes: emptyToNull(values.notes),
  }
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/** "" → null (not provided), "30" → 30, anything else → undefined (invalid). */
function parseSalary(value: string): number | null | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return null
  return /^\d+$/.test(trimmed) ? Number(trimmed) : undefined
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
