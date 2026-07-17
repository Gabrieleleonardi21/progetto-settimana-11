// ============================================
// PLAYER — stato della riproduzione
//
// Contiene solo dati serializzabili. Le operazioni sull'elemento <audio>
// (play, pause, seek) stanno nei thunk: vedi store/playerThunks.ts.
// ============================================

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Track } from '../../types'
import { KEYS, readJson, readString } from '../../utils/storage'

const DEFAULT_VOLUME = 0.7

interface PlayerState {
  currentTrack: Track | null
  /** Coda di riproduzione: prev/next si muovono qui dentro. */
  queue: Track[]
  currentIndex: number
  isPlaying: boolean
  isShuffle: boolean
  isRepeat: boolean
  /** 0–1. */
  volume: number
  /** Secondi, aggiornati dall'evento `timeupdate`. */
  currentTime: number
  duration: number
}

function initialVolume(): number {
  const saved = readString(KEYS.playerVolume)
  if (saved === null) return DEFAULT_VOLUME
  const parsed = parseFloat(saved)
  if (Number.isNaN(parsed)) return DEFAULT_VOLUME
  return parsed
}

const initialState: PlayerState = {
  // Il brano dell'ultima sessione riempie la UI del player, ma non parte da solo
  currentTrack: readJson<Track | null>(KEYS.currentTrack, null),
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  isShuffle: false,
  isRepeat: false,
  volume: initialVolume(),
  currentTime: 0,
  duration: 0,
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setQueue(state, action: PayloadAction<Track[]>) {
      state.queue = action.payload
    },

    /** Carica un brano nella UI. L'audio vero lo avvia il thunk. */
    setCurrent(state, action: PayloadAction<{ track: Track; index: number }>) {
      state.currentTrack = action.payload.track
      state.currentIndex = action.payload.index
      state.currentTime = 0
      state.duration = action.payload.track.duration
      state.isPlaying = false
    },

    setPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload
    },

    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(1, action.payload))
    },

    toggleShuffle(state) {
      state.isShuffle = !state.isShuffle
    },

    toggleRepeat(state) {
      state.isRepeat = !state.isRepeat
    },

    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload
    },

    /** La durata reale dell'anteprima (30s) può differire da quella del brano. */
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload
    },
  },
})

export const {
  setQueue,
  setCurrent,
  setPlaying,
  setVolume,
  toggleShuffle,
  toggleRepeat,
  setCurrentTime,
  setDuration,
} = playerSlice.actions

export default playerSlice.reducer
