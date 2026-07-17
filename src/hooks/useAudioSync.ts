// ============================================
// PONTE <audio> → REDUX
//
// Monta i listener dell'elemento audio una sola volta e riversa in Redux
// ciò che il browser decide da solo (avanzamento, durata reale, fine brano,
// pausa dai tasti multimediali). Il flusso opposto — Redux → audio — sta nei thunk.
// ============================================

import { useEffect } from 'react'
import { audio } from '../audio/audioElement'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { handleTrackEnded } from '../store/playerThunks'
import { setCurrentTime, setDuration, setPlaying } from '../store/slices/playerSlice'

export function useAudioSync(): void {
  const dispatch = useAppDispatch()
  const volume = useAppSelector((state) => state.player.volume)

  // Il volume vive in Redux (ed è persistito): l'elemento lo insegue
  useEffect(() => {
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const onTimeUpdate = () => dispatch(setCurrentTime(audio.currentTime))
    const onEnded = () => dispatch(handleTrackEnded())
    const onPlay = () => dispatch(setPlaying(true))
    const onPause = () => dispatch(setPlaying(false))

    // La durata reale dell'anteprima (~30s) non coincide con quella del brano
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) dispatch(setDuration(audio.duration))
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [dispatch])
}
