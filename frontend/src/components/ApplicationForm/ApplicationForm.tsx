import { useId, useState, type ChangeEvent, type ReactNode, type SubmitEvent } from 'react'
import { ApiError, getErrorMessage } from '../../api/client'
import { INITIAL_STATUSES, STATUS_LABELS, WORK_MODES, WORK_MODE_LABELS } from '../../constants'
import type { Application, ApplicationPayload, InitialStatus } from '../../types'
import {
  toFormValues,
  toPayload,
  validateApplicationForm,
  type ApplicationFormValues,
  type FormErrors,
  type FormField,
} from '../../utils/applicationForm'
import './ApplicationForm.css'

interface ApplicationFormProps {
  /** Present when editing; the initial status can only be chosen on create. */
  application?: Application
  /** Should throw an ApiError if the server rejects the data. */
  onSubmit: (payload: ApplicationPayload, initialStatus: InitialStatus) => Promise<void>
  onCancel: () => void
}

/** Order used to focus the first field with an error. */
const FIELD_ORDER: FormField[] = [
  'company',
  'position',
  'workMode',
  'location',
  'status',
  'appliedAt',
  'source',
  'jobUrl',
  'salaryMinK',
  'salaryMaxK',
  'notes',
]

export function ApplicationForm({ application, onSubmit, onCancel }: ApplicationFormProps) {
  const isEdit = application !== undefined
  const idPrefix = useId()
  const [values, setValues] = useState<ApplicationFormValues>(() => toFormValues(application))
  // Client errors only show up after the first submit attempt, then update live.
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const clientErrors = submitted ? validateApplicationForm(values) : {}
  const errorFor = (field: FormField) => clientErrors[field] ?? serverErrors[field]
  const idFor = (field: FormField) => `${idPrefix}-${field}`

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const field = event.target.name as FormField
    const { value } = event.target
    setValues((previous) => ({ ...previous, [field]: value }))
    // A server error no longer applies once the user edits that field.
    setServerErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  /** Props shared by every input: value binding plus accessible error wiring. */
  function fieldProps(field: FormField) {
    const error = errorFor(field)
    return {
      id: idFor(field),
      name: field,
      value: values[field],
      onChange: handleChange,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${idFor(field)}-error` : undefined,
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setFormError(null)

    const errors = validateApplicationForm(values)
    const firstInvalid = FIELD_ORDER.find((field) => errors[field])
    if (firstInvalid) {
      document.getElementById(idFor(firstInvalid))?.focus()
      return
    }

    setSaving(true)
    try {
      await onSubmit(toPayload(values), values.status)
    } catch (error) {
      showSubmitError(error)
      setSaving(false)
    }
  }

  function showSubmitError(error: unknown) {
    if (!(error instanceof ApiError) || Object.keys(error.fieldErrors).length === 0) {
      setFormError(getErrorMessage(error))
      return
    }
    // Errors for fields we have go next to them; any other ones go on top.
    const fieldErrors: FormErrors = {}
    const otherMessages: string[] = []
    for (const [field, message] of Object.entries(error.fieldErrors)) {
      if (field in values) fieldErrors[field as FormField] = message
      else otherMessages.push(message)
    }
    setServerErrors(fieldErrors)
    setFormError(['Revisa los campos marcados.', ...otherMessages].join(' '))
  }

  return (
    <form className="modal__form" noValidate onSubmit={handleSubmit}>
      <div className="modal__body">
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <div className="form-grid">
          <Field id={idFor('company')} label="Empresa" required error={errorFor('company')}>
            <input
              {...fieldProps('company')}
              className="input"
              autoComplete="organization"
              required
              data-autofocus
            />
          </Field>

          <Field id={idFor('position')} label="Puesto" required error={errorFor('position')}>
            <input {...fieldProps('position')} className="input" required />
          </Field>

          <Field id={idFor('workMode')} label="Modalidad" required error={errorFor('workMode')}>
            <select {...fieldProps('workMode')} className="input" required>
              {WORK_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {WORK_MODE_LABELS[mode]}
                </option>
              ))}
            </select>
          </Field>

          <Field id={idFor('location')} label="Ubicación" error={errorFor('location')}>
            <input {...fieldProps('location')} className="input" placeholder="Madrid" />
          </Field>

          {!isEdit && (
            <Field id={idFor('status')} label="Estado inicial" error={errorFor('status')}>
              <select {...fieldProps('status')} className="input">
                {INITIAL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field id={idFor('appliedAt')} label="Fecha de aplicación" error={errorFor('appliedAt')}>
            <input {...fieldProps('appliedAt')} className="input" type="date" />
          </Field>

          <Field id={idFor('source')} label="Fuente" error={errorFor('source')}>
            <input
              {...fieldProps('source')}
              className="input"
              placeholder="LinkedIn, InfoJobs, referido…"
            />
          </Field>

          <Field id={idFor('jobUrl')} label="URL de la oferta" error={errorFor('jobUrl')}>
            <input
              {...fieldProps('jobUrl')}
              className="input"
              type="url"
              inputMode="url"
              placeholder="https://"
            />
          </Field>

          <Field id={idFor('salaryMinK')} label="Salario mínimo (k€)" error={errorFor('salaryMinK')}>
            <input {...fieldProps('salaryMinK')} className="input" type="number" min={0} step={1} />
          </Field>

          <Field id={idFor('salaryMaxK')} label="Salario máximo (k€)" error={errorFor('salaryMaxK')}>
            <input {...fieldProps('salaryMaxK')} className="input" type="number" min={0} step={1} />
          </Field>

          <Field id={idFor('notes')} label="Notas" error={errorFor('notes')} wide>
            <textarea {...fieldProps('notes')} className="input" rows={4} />
          </Field>
        </div>
      </div>

      <div className="modal__footer">
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="button button--primary" disabled={saving}>
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear candidatura'}
        </button>
      </div>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  /** Takes the full row of the grid. */
  wide?: boolean
  children: ReactNode
}

function Field({ id, label, error, required, wide, children }: FieldProps) {
  return (
    <div className={wide ? 'field field--wide' : 'field'}>
      <label htmlFor={id} className="field__label">
        {label}
        {required && (
          <span className="field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}
