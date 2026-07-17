// Playlist creata dall'utente: riproduci, rinomina, elimina, rimuovi brani.

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { USER_PLAYLIST_COVER } from '../api/staticData'
import { Modal } from '../components/common/Modal'
import { ActionsRow, PlayButton, PlaylistHeader } from '../components/common/PlaylistHeader'
import { ConfirmModal } from '../components/modals/ConfirmModal'
import { TrackList } from '../components/tracks/TrackList'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playTracks } from '../store/playerThunks'
import { selectPlaylistById } from '../store/selectors'
import { deletePlaylist, renamePlaylist } from '../store/slices/librarySlice'

function RenameModal({ playlistId, currentName, onClose }: { playlistId: string; currentName: string; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const [name, setName] = useState(currentName)

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch(renamePlaylist({ playlistId, name: trimmed }))
    onClose()
  }

  return (
    <Modal title="Rinomina playlist" onClose={onClose}>
      <div className="modal-body">
        <input
          type="text"
          className="form-control login-input"
          placeholder="Nuovo nome"
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
          Rinomina
        </button>
      </div>
    </Modal>
  )
}

export function UserPlaylist() {
  const { playlistId = '' } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const playlist = useAppSelector((state) => selectPlaylistById(state, playlistId))
  const displayName = useAppSelector((state) => state.profile.displayName)

  const [renaming, setRenaming] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!playlist) return <p className="text-secondary mt-4">Playlist non trovata.</p>

  const remove = () => {
    dispatch(deletePlaylist(playlist.id))
    navigate('/profile') // questa pagina non esiste più
  }

  return (
    <>
      <PlaylistHeader cover={USER_PLAYLIST_COVER} type="Playlist" title={playlist.name}>
        <div className="playlist-meta">
          <strong>{displayName}</strong>
          {` • ${playlist.tracks.length} brani`}
        </div>
      </PlaylistHeader>

      <ActionsRow>
        <PlayButton onClick={() => dispatch(playTracks(playlist.tracks))} />

        <button className="btn-icon" style={{ fontSize: 32 }} title="Rinomina playlist" onClick={() => setRenaming(true)}>
          <i className="bi bi-pencil" />
        </button>

        <button
          className="btn-icon"
          style={{ fontSize: 32 }}
          title="Elimina playlist"
          onClick={() => setConfirmingDelete(true)}
        >
          <i className="bi bi-trash" />
        </button>
      </ActionsRow>

      {playlist.tracks.length === 0 && <p className="text-secondary mt-4">Questa playlist è vuota.</p>}
      {playlist.tracks.length > 0 && (
        <TrackList tracks={playlist.tracks} removeFromPlaylistId={playlist.id} />
      )}

      {renaming && (
        <RenameModal playlistId={playlist.id} currentName={playlist.name} onClose={() => setRenaming(false)} />
      )}

      {confirmingDelete && (
        <ConfirmModal
          message={`Eliminare la playlist "${playlist.name}"?`}
          okLabel="Elimina"
          onConfirm={remove}
          onClose={() => setConfirmingDelete(false)}
        />
      )}
    </>
  )
}
