import { describe, expect, it } from 'vitest'
import { makeApplication } from '../test/helpers'
import {
  toFormValues,
  toPayload,
  validateApplicationForm,
  type ApplicationFormValues,
} from './applicationForm'

function values(overrides: Partial<ApplicationFormValues> = {}): ApplicationFormValues {
  return { ...toFormValues(), company: 'Acme', position: 'Frontend', ...overrides }
}

describe('validateApplicationForm', () => {
  it('accepts a minimal valid form', () => {
    expect(validateApplicationForm(values())).toEqual({})
  })

  it('requires company and position (blank counts as empty)', () => {
    const errors = validateApplicationForm(values({ company: '   ', position: '' }))
    expect(errors.company).toBe('La empresa es obligatoria.')
    expect(errors.position).toBe('El puesto es obligatorio.')
  })

  it('checks the URL format', () => {
    expect(validateApplicationForm(values({ jobUrl: 'empresa.com/oferta' })).jobUrl).toBeDefined()
    expect(validateApplicationForm(values({ jobUrl: 'ftp://example.com' })).jobUrl).toBeDefined()
    expect(validateApplicationForm(values({ jobUrl: 'https://example.com/jobs/1' })).jobUrl).toBeUndefined()
  })

  it('requires whole, non-negative salaries', () => {
    const errors = validateApplicationForm(values({ salaryMinK: '-5', salaryMaxK: '30.5' }))
    expect(errors.salaryMinK).toBeDefined()
    expect(errors.salaryMaxK).toBeDefined()
  })

  it('requires the minimum salary to be lower than or equal to the maximum', () => {
    expect(validateApplicationForm(values({ salaryMinK: '40', salaryMaxK: '30' })).salaryMaxK).toBe(
      'El máximo no puede ser menor que el mínimo.',
    )
    expect(validateApplicationForm(values({ salaryMinK: '30', salaryMaxK: '30' }))).toEqual({})
  })
})

describe('toPayload', () => {
  it('trims text, turns empty fields into null and salaries into numbers', () => {
    const payload = toPayload(
      values({ company: '  Acme ', location: ' ', salaryMinK: '28', salaryMaxK: '', notes: '' }),
    )
    expect(payload).toEqual({
      company: 'Acme',
      position: 'Frontend',
      location: null,
      workMode: 'HYBRID',
      source: null,
      jobUrl: null,
      salaryMinK: 28,
      salaryMaxK: null,
      appliedAt: null,
      notes: null,
    })
  })
})

describe('toFormValues', () => {
  it('fills the form from an existing application', () => {
    const formValues = toFormValues(makeApplication({ salaryMinK: 28, location: null }))
    expect(formValues.company).toBe('Acme Logistics')
    expect(formValues.salaryMinK).toBe('28')
    expect(formValues.location).toBe('')
  })
})
