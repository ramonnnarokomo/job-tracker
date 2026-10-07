import { describe, expect, it } from 'vitest'
import type { Application } from '../types'
import { applicationsToCsv, csvFileName, escapeCsvField } from './csv'

const application: Application = {
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
  followUpDue: true,
}

describe('escapeCsvField', () => {
  it('leaves plain values untouched', () => {
    expect(escapeCsvField('Madrid')).toBe('Madrid')
    expect(escapeCsvField(28)).toBe('28')
  })

  it('writes null as an empty cell', () => {
    expect(escapeCsvField(null)).toBe('')
  })

  it('quotes separators, quotes and line breaks', () => {
    expect(escapeCsvField('Java; Spring')).toBe('"Java; Spring"')
    expect(escapeCsvField('Puesto "senior"')).toBe('"Puesto ""senior"""')
    expect(escapeCsvField('línea 1\nlínea 2')).toBe('"línea 1\nlínea 2"')
  })

  it('neutralises text that a spreadsheet would run as a formula', () => {
    expect(escapeCsvField('=HYPERLINK("http://evil")')).toBe('"\'=HYPERLINK(""http://evil"")"')
    expect(escapeCsvField('+34 600 000 000')).toBe("'+34 600 000 000")
    expect(escapeCsvField('@sum')).toBe("'@sum")
  })
})

describe('applicationsToCsv', () => {
  it('starts with a BOM and a Spanish header row', () => {
    const csv = applicationsToCsv([])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv.slice(1)).toBe(
      'Empresa;Puesto;Estado;Modalidad;Ubicación;Fuente;Salario mín. (k€);Salario máx. (k€);' +
        'Fecha de candidatura;Última actualización;Seguimiento pendiente;Enlace;Notas',
    )
  })

  it('writes one row per application with readable labels', () => {
    const [, row] = applicationsToCsv([application]).split('\r\n')
    expect(row).toBe(
      'Acme Logistics;Desarrollador Full-Stack;Aplicado;Híbrido;Madrid;LinkedIn;28;34;' +
        '2026-09-20;2026-09-20;Sí;https://example.com/jobs/1;',
    )
  })
})

describe('csvFileName', () => {
  it('includes the date', () => {
    expect(csvFileName(new Date('2026-10-07T12:00:00Z'))).toBe('candidaturas-2026-10-07.csv')
  })
})
