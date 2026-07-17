// Conferma per le azioni distruttive. Sostituisce il confirm() nativo.
// La callback resta una prop: non passa da Redux, che accetta solo dati serializzabili.

import { Modal } from '../common/Modal'

interface ConfirmModalProps {
  message: string
  okLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({ message, okLabel = 'Conferma', onConfirm, onClose }: ConfirmModalProps) {
  return (
    <Modal title="Conferma" onClose={onClose}>
      <div className="modal-body">{message}</div>
      <div className="modal-footer border-secondary">
        <button type="button" className="btn btn-outline-light" onClick={onClose}>
          Annulla
        </button>
        <button
          type="button"
          className="btn btn-spotify"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {okLabel}
        </button>
      </div>
    </Modal>
  )
}
