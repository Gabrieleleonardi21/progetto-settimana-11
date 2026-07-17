// ============================================
// MINI-PLAYER NELLA FINESTRA PICTURE-IN-PICTURE
//
// Nel vanilla la PiP era un secondo DOM costruito a mano (`buildPipDocument`)
// e tenuto allineato da `refreshPipUI()`. Qui è un portal React: legge lo
// stesso store del player principale, quindi resta sincronizzato da solo.
// ============================================

import { createPortal } from 'react-dom'
import { useAppSelector } from '../../store/hooks'
import { CurrentTrackLikeButton, PlayerControls } from './PlayerControls'
import { ProgressBar } from './ProgressBar'
import { VolumeBar } from './VolumeControl'

export function PipPlayer({ pipWindow }: { pipWindow: Window }) {
  const currentTrack = useAppSelector((state) => state.player.currentTrack)
  if (!currentTrack) return null

  return createPortal(
    <div className="pip-player">
      <img className="pip-cover" src={currentTrack.cover} alt={currentTrack.title} />

      <div className="pip-track-info">
        <div className="track-title">{currentTrack.title}</div>
        <div className="track-artist">{currentTrack.artist}</div>
      </div>

      <PlayerControls compact />
      <ProgressBar compact />

      <div className="pip-bottom-row">
        <CurrentTrackLikeButton />
        {/* VolumeBar e non VolumeControl: vedi il commento in VolumeControl.tsx */}
        <VolumeBar />
      </div>
    </div>,
    pipWindow.document.body,
  )
}
