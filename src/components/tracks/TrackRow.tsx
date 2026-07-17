// ============================================
// RIGA DELLA TRACKLIST
//
// Nel vanilla serviva `_trackRegistry` (Map globale id → brano) per ritrovare
// l'oggetto completo a partire dall'id del DOM. Qui il brano arriva come prop:
// il registry non esiste più.
// ============================================

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { playTracks } from '../../store/playerThunks'
import { removeTrackFromPlaylist, toggleLike } from '../../store/slices/librarySlice'
import { openAddToPlaylist, openTrackActions, openTrackDetail } from '../../store/slices/uiSlice'
import { selectIsLiked } from '../../store/selectors'
import type { Track } from '../../types'
import { formatDuration } from '../../utils/format'
import { HeartIcon } from '../common/HeartIcon'

/** Ritardo prima di aprire il dettaglio: se arriva un secondo click, si riproduce. */
const SINGLE_CLICK_DELAY_MS = 220

/**
 * Su mobile il click sulla riga è disattivato: si usa il menu "tre puntini".
 *
 * Stessa identica query del CSS, valutata da matchMedia: `window.innerWidth`
 * conta anche la scrollbar, quindi a 480px esatti divergeva dal breakpoint
 * grafico (il vanilla usava `innerWidth < 480`, disallineato di un pixel).
 */
const MOBILE_QUERY = '(max-width: 480px)'

interface TrackRowProps {
  track: Track
  index: number
  /** L'intera tracklist: diventa la coda di riproduzione. */
  queue: Track[]
  showAlbumCol: boolean
  /** Se presente, la riga mostra "rimuovi da questa playlist". */
  removeFromPlaylistId?: string
}

/** Numero di traccia, o icona equalizzatore se è il brano in riproduzione. */
function TrackNumber({ index, playing }: { index: number; playing: boolean }) {
  if (playing) return <i className="bi bi-volume-up-fill" />
  return <>{index + 1}</>
}

/** Solo i brani con un artistId noto portano alla pagina dell'artista. */
function ArtistLabel({
  artist,
  linkable,
  onOpenArtist,
}: {
  artist: string
  linkable: boolean
  onOpenArtist: (e: React.MouseEvent) => void
}) {
  if (!linkable) return <div className="track-artist-small">{artist}</div>
  return (
    <div className="track-artist-small track-artist-link" onClick={onOpenArtist}>
      {artist}
    </div>
  )
}

export function TrackRow({ track, index, queue, showAlbumCol, removeFromPlaylistId }: TrackRowProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const isLiked = useAppSelector((state) => selectIsLiked(state, track.id))
  const isCurrent = useAppSelector((state) => state.player.currentTrack?.id === track.id)
  const isPlaying = useAppSelector((state) => state.player.isPlaying)

  const clickTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => clearTimeout(clickTimer.current), [])

  const modalContext = { track, queue, removeFromPlaylistId }

  const handleClick = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) return
    clearTimeout(clickTimer.current)
    clickTimer.current = window.setTimeout(
      () => dispatch(openTrackDetail(modalContext)),
      SINGLE_CLICK_DELAY_MS,
    )
  }

  const handleDoubleClick = () => {
    clearTimeout(clickTimer.current) // annulla l'apertura del dettaglio
    dispatch(playTracks(queue, index))
  }

  /** Impedisce che il click sul bottone risalga alla riga (che aprirebbe il dettaglio). */
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    fn()
  }

  let rowClass = 'track-row'
  if (isCurrent) rowClass += ' playing'

  let albumColumn = track.artist
  if (showAlbumCol) albumColumn = track.album

  return (
    <div className={rowClass} onClick={handleClick} onDoubleClick={handleDoubleClick}>
      <div className="track-number">
        <TrackNumber index={index} playing={isCurrent && isPlaying} />
      </div>

      <div className="track-info">
        <img src={track.cover} alt={track.title} />
        <div className="track-info-text">
          <div className="track-name">
            {track.title}
            {!track.previewUrl && (
              <span
                title="Anteprima non disponibile"
                style={{ fontSize: 11, color: '#555', marginLeft: 4 }}
              >
                🔇
              </span>
            )}
          </div>

          <ArtistLabel
            artist={track.artist}
            onOpenArtist={stop(() => navigate(`/artist/${track.artistId}`))}
            linkable={Boolean(track.artistId)}
          />
        </div>
      </div>

      <div className="track-album">{albumColumn}</div>

      <div className="track-actions">
        <button
          className="btn-icon"
          title="Aggiungi a una playlist"
          onClick={stop(() => dispatch(openAddToPlaylist(track)))}
        >
          <i className="bi bi-plus-circle" />
        </button>

        <button className="btn-icon" title="Mi piace" onClick={stop(() => dispatch(toggleLike(track)))}>
          <HeartIcon liked={isLiked} />
        </button>

        {removeFromPlaylistId && (
          <button
            className="btn-icon"
            title="Rimuovi da questa playlist"
            onClick={stop(() =>
              dispatch(removeTrackFromPlaylist({ playlistId: removeFromPlaylistId, trackId: track.id })),
            )}
          >
            <i className="bi bi-x-circle" />
          </button>
        )}

        {/* Su mobile il CSS nasconde i bottoni qui sopra e lascia solo questo */}
        <button
          className="btn-icon track-more-btn"
          title="Altre opzioni"
          onClick={stop(() => dispatch(openTrackActions(modalContext)))}
        >
          <i className="bi bi-three-dots" />
        </button>
      </div>

      <div className="track-duration">{formatDuration(track.duration)}</div>
    </div>
  )
}
