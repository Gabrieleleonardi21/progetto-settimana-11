// ============================================
// AZIONI DEL PLAYER CON EFFETTI SULL'<audio>
//
// I reducer restano puri: ogni chiamata a play/pause/seek passa da qui.
// ============================================

import { audio } from '../audio/audioElement'
import type { Track } from '../types'
import type { AppThunk } from './index'
import { addRecentTrack } from './slices/librarySlice'
import {
  setCurrent,
  setCurrentTime,
  setPlaying,
  setQueue,
  setVolume,
} from './slices/playerSlice'
import { registerListen } from './slices/statsSlice'

const UNMUTED_VOLUME = 0.7
/** Sotto questa soglia "precedente" torna all'inizio invece di cambiare brano. */
const RESTART_THRESHOLD_SECONDS = 3

/** Avvia l'anteprima e allinea `isPlaying` all'esito reale della Promise. */
function startPlayback(dispatch: (action: ReturnType<typeof setPlaying>) => void): void {
  audio
    .play()
    .then(() => dispatch(setPlaying(true)))
    .catch(() => dispatch(setPlaying(false))) // autoplay bloccato o sorgente non valida
}

/** Riproduce il brano in posizione `index` della coda già impostata. */
export const playFromQueue =
  (index: number): AppThunk =>
  (dispatch, getState) => {
    const track = getState().player.queue[index]
    if (!track) return

    dispatch(registerListen(track.artist))
    dispatch(addRecentTrack(track))
    dispatch(setCurrent({ track, index }))

    if (!track.previewUrl) {
      // Brano senza anteprima: mostra le info ma non riproduce nulla.
      // removeAttribute invece di src='' — quest'ultimo farebbe ricaricare la pagina come sorgente.
      audio.removeAttribute('src')
      audio.load()
      return
    }

    audio.src = track.previewUrl
    startPlayback(dispatch)
  }

/** Imposta la coda e parte da `startIndex`. È l'unico modo di avviare la musica. */
export const playTracks =
  (tracks: Track[], startIndex = 0): AppThunk =>
  (dispatch) => {
    const queue = tracks.filter(Boolean)
    if (queue.length === 0) return
    dispatch(setQueue(queue))
    dispatch(playFromQueue(Math.min(Math.max(startIndex, 0), queue.length - 1)))
  }

export const togglePlay = (): AppThunk => (dispatch, getState) => {
  const { currentTrack, isPlaying } = getState().player
  if (!currentTrack) return

  if (isPlaying) {
    audio.pause()
    dispatch(setPlaying(false))
    return
  }

  if (!currentTrack.previewUrl) return
  // Dopo un ricaricamento la UI mostra l'ultimo brano ma l'<audio> è vuoto
  if (!audio.src) audio.src = currentTrack.previewUrl
  startPlayback(dispatch)
}

export const nextTrack = (): AppThunk => (dispatch, getState) => {
  const { queue, currentIndex, isShuffle } = getState().player
  if (queue.length === 0) return

  let next = (currentIndex + 1) % queue.length
  if (isShuffle) next = Math.floor(Math.random() * queue.length)
  dispatch(playFromQueue(next))
}

export const prevTrack = (): AppThunk => (dispatch, getState) => {
  const { queue, currentIndex } = getState().player
  if (queue.length === 0) return

  // Come su Spotify: se il brano è già iniziato da un po', "precedente" lo riavvia
  if (audio.currentTime > RESTART_THRESHOLD_SECONDS) {
    audio.currentTime = 0
    dispatch(setCurrentTime(0))
    return
  }

  dispatch(playFromQueue((currentIndex - 1 + queue.length) % queue.length))
}

/** Chiamato dall'evento `ended`. */
export const handleTrackEnded = (): AppThunk => (dispatch, getState) => {
  if (getState().player.isRepeat) {
    audio.currentTime = 0
    startPlayback(dispatch)
    return
  }
  dispatch(nextTrack())
}

export const seek =
  (seconds: number): AppThunk =>
  (dispatch) => {
    if (!Number.isFinite(audio.duration) || audio.duration === 0) return
    audio.currentTime = seconds
    dispatch(setCurrentTime(seconds))
  }

export const changeVolume =
  (volume: number): AppThunk =>
  (dispatch) => {
    dispatch(setVolume(volume))
    audio.volume = Math.max(0, Math.min(1, volume))
  }

export const toggleMute = (): AppThunk => (dispatch, getState) => {
  const { volume } = getState().player

  // Da muto si torna al volume di default, non a quello precedente (come nel vanilla)
  let next = UNMUTED_VOLUME
  if (volume > 0) next = 0

  dispatch(changeVolume(next))
}
