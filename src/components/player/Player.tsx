// ============================================
// PLAYER — barra fissa in fondo alla pagina
//
// Montato una volta sola nel Layout: cambiando rotta non viene smontato,
// quindi la musica non si interrompe più durante la navigazione.
// ============================================

import { useAppSelector } from '../../store/hooks'
import { CurrentTrackLikeButton, PlayerControls } from './PlayerControls'
import { ProgressBar } from './ProgressBar'
import { VolumeControl } from './VolumeControl'

export function Player() {
  const currentTrack = useAppSelector((state) => state.player.currentTrack)

  return (
    <footer className="player">
      <div className="player-left">
        {currentTrack && <img className="player-cover" src={currentTrack.cover} alt={currentTrack.title} />}

        <div className="player-track-info">
          <div className="track-title">{currentTrack?.title ?? 'Nessun brano in riproduzione'}</div>
          <div className="track-artist">{currentTrack?.artist ?? '--'}</div>
        </div>

        <CurrentTrackLikeButton className="btn-icon ms-3" />
      </div>

      <div className="player-center">
        <PlayerControls />
        <ProgressBar />
      </div>

      <div className="player-right">
        {/* Decorativi: presenti anche nell'originale, senza funzione */}
        <button className="btn-icon" title="Coda di riproduzione">
          <i className="bi bi-music-note-list" />
        </button>
        <button className="btn-icon" title="Dispositivi">
          <i className="bi bi-pc-display" />
        </button>
        <VolumeControl />
      </div>
    </footer>
  )
}
