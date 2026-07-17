// Comandi di riproduzione, condivisi tra il player principale e la finestra PiP.
// `compact` = solo prev/play/next (la PiP non ha shuffle e repeat).

import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { nextTrack, prevTrack, togglePlay } from '../../store/playerThunks'
import { toggleRepeat, toggleShuffle } from '../../store/slices/playerSlice'
import { selectIsLiked } from '../../store/selectors'
import { toggleLike } from '../../store/slices/librarySlice'
import { HeartIcon } from '../common/HeartIcon'

/** `btn-icon` più `active` quando la modalità è inserita. */
function toggleClass(active: boolean): string {
  if (active) return 'btn-icon active'
  return 'btn-icon'
}

export function PlayerControls({ compact = false }: { compact?: boolean }) {
  const dispatch = useAppDispatch()
  const { isPlaying, isShuffle, isRepeat } = useAppSelector((state) => state.player)

  let playTitle = 'Riproduci'
  let playIcon = 'bi bi-play-fill'
  if (isPlaying) {
    playTitle = 'Pausa'
    playIcon = 'bi bi-pause-fill'
  }

  let wrapperClass = 'player-controls'
  if (compact) wrapperClass = 'pip-controls'

  return (
    <div className={wrapperClass}>
      {!compact && (
        <button
          className={toggleClass(isShuffle)}
          title="Riproduzione casuale"
          onClick={() => dispatch(toggleShuffle())}
        >
          <i className="bi bi-shuffle" />
        </button>
      )}

      <button className="btn-icon" title="Precedente" onClick={() => dispatch(prevTrack())}>
        <i className="bi bi-skip-start-fill" />
      </button>

      <button className="btn-play" title={playTitle} onClick={() => dispatch(togglePlay())}>
        <i className={playIcon} />
      </button>

      <button className="btn-icon" title="Successivo" onClick={() => dispatch(nextTrack())}>
        <i className="bi bi-skip-end-fill" />
      </button>

      {!compact && (
        <button className={toggleClass(isRepeat)} title="Ripeti" onClick={() => dispatch(toggleRepeat())}>
          <i className="bi bi-repeat" />
        </button>
      )}
    </div>
  )
}

/** Cuore del brano attualmente caricato nel player. */
export function CurrentTrackLikeButton({ className = 'btn-icon' }: { className?: string }) {
  const dispatch = useAppDispatch()
  const currentTrack = useAppSelector((state) => state.player.currentTrack)
  const isLiked = useAppSelector((state) => {
    if (!currentTrack) return false
    return selectIsLiked(state, currentTrack.id)
  })

  return (
    <button
      className={className}
      title="Mi piace"
      disabled={currentTrack === null}
      onClick={() => currentTrack && dispatch(toggleLike(currentTrack))}
    >
      <HeartIcon liked={isLiked} />
    </button>
  )
}
