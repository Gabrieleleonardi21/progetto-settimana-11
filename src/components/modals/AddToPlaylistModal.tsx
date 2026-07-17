// ============================================
// AGGIUNGI A UNA PLAYLIST
// Le playlist che già contengono il brano sono disabilitate e mostrano una spunta.
// ============================================

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addTrackToPlaylist, createPlaylist } from '../../store/slices/librarySlice'
import { closeAddToPlaylist, showToast } from '../../store/slices/uiSlice'
import type { Track } from '../../types'
import { Modal } from '../common/Modal'

export function AddToPlaylistModal({ track }: { track: Track }) {
  const dispatch = useAppDispatch()
  const userPlaylists = useAppSelector((state) => state.library.userPlaylists)
  const [newName, setNewName] = useState('')

  const close = () => dispatch(closeAddToPlaylist())

  const addTo = (playlistId: string, playlistName: string) => {
    dispatch(addTrackToPlaylist({ playlistId, track }))
    dispatch(showToast(`Aggiunto a ${playlistName}`))
    close()
  }

  const createAndAdd = () => {
    const name = newName.trim()
    if (!name) return

    // `createPlaylist` genera l'id nel suo `prepare`: lo recuperiamo dall'action
    const action = dispatch(createPlaylist(name))
    dispatch(addTrackToPlaylist({ playlistId: action.payload.id, track }))
    dispatch(showToast(`Creata e aggiunta a ${name}`))
    close()
  }

  return (
    <Modal title="Aggiungi a una playlist" onClose={close}>
      <div className="modal-body">
        <div className="add-playlist-list">
          {userPlaylists.length === 0 && (
            <p className="text-secondary m-0">Non hai ancora playlist: creane una qui sotto.</p>
          )}

          {userPlaylists.map((playlist) => {
            const alreadyIn = playlist.tracks.some((t) => t.id === track.id)
            return (
              <button
                key={playlist.id}
                className="add-playlist-item"
                disabled={alreadyIn}
                onClick={() => addTo(playlist.id, playlist.name)}
              >
                <span>{playlist.name}</span>
                {alreadyIn && <i className="bi bi-check-lg" />}
              </button>
            )
          })}
        </div>

        <hr className="border-secondary" />

        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control login-input"
            placeholder="Nuova playlist"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createAndAdd()}
          />
          <button type="button" className="btn btn-spotify text-nowrap" onClick={createAndAdd}>
            Crea e aggiungi
          </button>
        </div>
      </div>
    </Modal>
  )
}
