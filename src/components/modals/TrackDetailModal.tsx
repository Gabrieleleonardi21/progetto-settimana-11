// Dettaglio del brano: si apre col click singolo su una riga (solo ≥480px).

import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { playTracks } from '../../store/playerThunks'
import { selectIsLiked } from '../../store/selectors'
import { toggleLike } from '../../store/slices/librarySlice'
import {
  closeTrackDetail,
  openAddToPlaylist,
  openShare,
  type TrackModalContext,
} from '../../store/slices/uiSlice'
import { formatDuration } from '../../utils/format'
import { HeartIcon } from '../common/HeartIcon'
import { Modal } from '../common/Modal'

export function TrackDetailModal({ context }: { context: TrackModalContext }) {
  const { track, queue } = context
  const dispatch = useAppDispatch()
  const isLiked = useAppSelector((state) => selectIsLiked(state, track.id))

  const close = () => dispatch(closeTrackDetail())

  const play = () => {
    dispatch(playTracks(queue, queue.findIndex((t) => t.id === track.id)))
    close()
  }

  return (
    <Modal onClose={close} dialogClassName="track-detail-dialog" contentClassName="track-detail-content">
      <button type="button" className="btn-close btn-close-white track-detail-close" aria-label="Chiudi" onClick={close} />

      <img className="track-detail-cover" src={track.cover} alt={track.title} />

      <div className="track-detail-info">
        <p className="track-detail-badge">Brano</p>
        <h2 className="track-detail-title">{track.title}</h2>
        <p className="track-detail-artist">{track.artist}</p>
        <p className="track-detail-album">{track.album}</p>
        <p className="track-detail-duration">{formatDuration(track.duration)}</p>

        <div className="track-detail-actions">
          <button className="btn-play-large" title="Riproduci" onClick={play}>
            <i className="bi bi-play-fill" />
          </button>

          <button
            className="btn-icon track-detail-like-btn"
            title="Mi piace"
            onClick={() => dispatch(toggleLike(track))}
          >
            <HeartIcon liked={isLiked} />
          </button>

          <button
            className="btn-icon track-detail-add-btn"
            title="Aggiungi a playlist"
            onClick={() => {
              close()
              dispatch(openAddToPlaylist(track))
            }}
          >
            <i className="bi bi-plus-circle" />
          </button>

          <button
            className="btn-icon track-detail-share-btn"
            title="Condividi"
            onClick={() => {
              close()
              dispatch(openShare(track))
            }}
          >
            <i className="bi bi-share" />
          </button>
        </div>
      </div>
    </Modal>
  )
}
