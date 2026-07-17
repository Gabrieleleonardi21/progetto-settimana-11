// Modale "Crea nuova playlist" (sidebar).

import { useState } from 'react'
import { useAppDispatch } from '../../store/hooks'
import { createPlaylist } from '../../store/slices/librarySlice'
import { Modal } from '../common/Modal'

export function CreatePlaylistModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch(createPlaylist(trimmed))
    onClose()
  }

  return (
    <Modal title="Crea nuova playlist" onClose={onClose}>
      <div className="modal-body">
        <input
          type="text"
          className="form-control login-input"
          placeholder="Nome playlist"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </div>
      <div className="modal-footer border-secondary">
        <button type="button" className="btn btn-outline-light" onClick={onClose}>
          Annulla
        </button>
        <button type="button" className="btn btn-spotify" onClick={submit}>
          Crea
        </button>
      </div>
    </Modal>
  )
}
