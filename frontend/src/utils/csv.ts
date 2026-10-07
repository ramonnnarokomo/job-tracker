import { STATUS_LABELS, WORK_MODE_LABELS } from '../constants'
import type { Application } from '../types'

/** Excel in Spanish uses ";" as the list separator, so the file opens in columns with a double click. */
const SEPARATOR = ';'

type CellValue = string | number | null

const COLUMNS: { header: string; value: (application: Application) => CellValue }[] = [
  { header: 'Empresa', value: (a) => a.company },
  { header: 'Puesto', value: (a) => a.position },
  { header: 'Estado', value: (a) => STATUS_LABELS[a.status] },
  { header: 'Modalidad', value: (a) => WORK_MODE_LABELS[a.workMode] },
  { header: 'Ubicación', value: (a) => a.location },
  { header: 'Fuente', value: (a) => a.source },
  { header: 'Salario mín. (k€)', value: (a) => a.salaryMinK },
  { header: 'Salario máx. (k€)', value: (a) => a.salaryMaxK },
  { header: 'Fecha de candidatura', value: (a) => a.appliedAt },
  { header: 'Última actualización', value: (a) => a.updatedAt.slice(0, 10) },
  { header: 'Seguimiento pendiente', value: (a) => (a.followUpDue ? 'Sí' : 'No') },
  { header: 'Enlace', value: (a) => a.jobUrl },
  { header: 'Notas', value: (a) => a.notes },
]

/**
 * Quotes a field when needed and neutralises spreadsheet formulas: text starting with
 * = + - @ is prefixed with an apostrophe so Excel shows it instead of running it (CSV injection).
 */
export function escapeCsvField(value: CellValue): string {
  if (value === null) return ''
  let text = String(value)
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`
  }
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** The applications as CSV, with a UTF-8 BOM so Excel reads accents and "€" correctly. */
export function applicationsToCsv(applications: Application[]): string {
  const header = COLUMNS.map((column) => escapeCsvField(column.header)).join(SEPARATOR)
  const rows = applications.map((application) =>
    COLUMNS.map((column) => escapeCsvField(column.value(application))).join(SEPARATOR),
  )
  return '﻿' + [header, ...rows].join('\r\n')
}

export function csvFileName(today: Date = new Date()): string {
  return `candidaturas-${today.toISOString().slice(0, 10)}.csv`
}
