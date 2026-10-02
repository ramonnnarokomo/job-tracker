import { createApplication, updateApplication } from '../../api/applications'
import type { Application, ApplicationPayload, InitialStatus } from '../../types'
import { Modal } from '../Modal/Modal'
import { ApplicationForm } from './ApplicationForm'

interface ApplicationFormModalProps {
  /** Present when editing an existing application. */
  application?: Application
  onClose: () => void
  onSaved: (application: Application, created: boolean) => void
}

export function ApplicationFormModal({ application, onClose, onSaved }: ApplicationFormModalProps) {
  async function handleSubmit(payload: ApplicationPayload, initialStatus: InitialStatus) {
    // Errors propagate to the form, which shows them next to the fields.
    if (application) {
      onSaved(await updateApplication(application.id, payload), false)
    } else {
      onSaved(await createApplication({ ...payload, status: initialStatus }), true)
    }
  }

  return (
    <Modal title={application ? 'Editar candidatura' : 'Nueva candidatura'} onClose={onClose}>
      <ApplicationForm application={application} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  )
}
