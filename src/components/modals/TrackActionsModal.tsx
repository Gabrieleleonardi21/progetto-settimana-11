// Menu azioni del brano: su mobile (≤480px) sostituisce il click sulla riga,
// che lì è disattivato. Si apre dal bottone "tre puntini".

import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { playTracks } from '../../store/playerThunks'
import { selectIsLiked } from '../../store/selectors'
import { removeTrackFromPlaylist, toggleLike } from '../../store/slices/librarySlice'
import {
  closeTrackActions,
  openAddToPlaylist,
  openShare,
  type TrackModalContext,
} from '../../store/slices/uiSlice'
import { HeartIcon } from '../common/HeartIcon'
import { Modal } from '../common/Modal'

export function TrackActionsModal({ context }: { context: TrackModalContext }) {
  const { track, queue, removeFromPlaylistId } = context
  const dispatch = useAppDispatch()
  const isLiked = useAppSelector((state) => selectIsLiked(state, track.id))

  const close = () => dispatch(closeTrackActions())

  /** Ogni voce chiude il modale dopo aver eseguito la sua azione. */
  const run = (action: () => void) => () => {
    close()
    action()
  }

  let likeLabel = 'Aggiungi ai preferiti'
  if (isLiked) likeLabel = 'Togli dai preferiti'

  return (
    <Modal title={track.title} onClose={close}>
      <div className="modal-body">
        <div className="add-playlist-list">
          <button
            className="add-playlist-item"
            onClick={run(() => dispatch(playTracks(queue, queue.findIndex((t) => t.id === track.id))))}
          >
            <span>Riproduci</span>
            <i className="bi bi-play-fill" />
          </button>

          <button className="add-playlist-item" onClick={run(() => dispatch(openAddToPlaylist(track)))}>
            <span>Aggiungi a una playlist</span>
            <i className="bi bi-plus-circle" />
          </button>

          <button className="add-playlist-item" onClick={run(() => dispatch(toggleLike(track)))}>
            <span>{likeLabel}</span>
            <HeartIcon liked={isLiked} />
          </button>

          {removeFromPlaylistId && (
            <button
              className="add-playlist-item"
              onClick={run(() =>
                dispatch(removeTrackFromPlaylist({ playlistId: removeFromPlaylistId, trackId: track.id })),
              )}
            >
              <span>Rimuovi da questa playlist</span>
              <i className="bi bi-x-circle" />
            </button>
          )}

          <button className="add-playlist-item" onClick={run(() => dispatch(openShare(track)))}>
            <span>Condividi</span>
            <i className="bi bi-share" />
          </button>
        </div>
      </div>
    </Modal>
  )
}
