import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client'
import { makeApplication } from '../../test/helpers'
import { ApplicationForm } from './ApplicationForm'

describe('ApplicationForm', () => {
  it('shows the errors next to the fields and does not submit an invalid form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/^URL de la oferta/), 'empresa.com')
    await user.type(screen.getByLabelText(/^Salario mínimo/), '40')
    await user.type(screen.getByLabelText(/^Salario máximo/), '30')
    await user.click(screen.getByRole('button', { name: 'Crear candidatura' }))

    const company = screen.getByLabelText(/^Empresa/)
    expect(company).toHaveAttribute('aria-invalid', 'true')
    expect(company).toHaveAccessibleDescription('La empresa es obligatoria.')
    expect(company).toHaveFocus()
    expect(screen.getByText('El puesto es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText(/Introduce una URL válida/)).toBeInTheDocument()
    expect(screen.getByText('El máximo no puede ser menor que el mínimo.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the payload and the chosen initial status', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/^Empresa/), 'Acme')
    await user.type(screen.getByLabelText(/^Puesto/), 'Frontend')
    await user.selectOptions(screen.getByLabelText(/^Modalidad/), 'Remoto')
    await user.selectOptions(screen.getByLabelText(/^Estado inicial/), 'Por aplicar')
    await user.type(screen.getByLabelText(/^Salario mínimo/), '28')
    await user.type(screen.getByLabelText(/^Salario máximo/), '34')
    await user.click(screen.getByRole('button', { name: 'Crear candidatura' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        company: 'Acme',
        position: 'Frontend',
        workMode: 'REMOTE',
        salaryMinK: 28,
        salaryMaxK: 34,
        jobUrl: null,
      }),
      'WISHLIST',
    )
  })

  it('shows the field errors returned by the server', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError(400, {
        title: 'Bad Request',
        status: 400,
        errors: { company: 'Ya tienes una candidatura en esta empresa', salaryRange: 'Rango no válido' },
      }),
    )
    render(<ApplicationForm application={makeApplication()} onSubmit={onSubmit} onCancel={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Revisa los campos marcados. Rango no válido',
    )
    expect(screen.getByLabelText(/^Empresa/)).toHaveAccessibleDescription(
      'Ya tienes una candidatura en esta empresa',
    )
  })

  it('prefills the fields when editing and hides the initial status', () => {
    render(<ApplicationForm application={makeApplication()} onSubmit={vi.fn()} onCancel={() => {}} />)

    expect(screen.getByLabelText(/^Empresa/)).toHaveValue('Acme Logistics')
    expect(screen.getByLabelText(/^Salario mínimo/)).toHaveValue(28)
    expect(screen.queryByLabelText(/^Estado inicial/)).not.toBeInTheDocument()
  })
})
