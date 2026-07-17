// ============================================
// UI GLOBALE — toast, sleep timer e i modali richiamabili da qualsiasi punto
//
// Solo i modali legati a un brano stanno qui: possono essere aperti da una riga
// di tracklist ovunque nell'albero. Gli altri (crea playlist, tema, profilo,
// rinomina, conferma) sono stato locale del componente che li apre.
// ============================================

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Track } from '../../types'

/**
 * Contesto di un modale aperto da una tracklist: oltre al brano serve la coda
 * (per "Riproduci", che deve mantenere la lista corrente) e l'eventuale
 * playlist da cui rimuoverlo.
 */
export interface TrackModalContext {
  track: Track
  queue: Track[]
  removeFromPlaylistId?: string
}

interface UiState {
  toast: string | null
  /** Timestamp Unix (ms) in cui la musica si fermerà. null = timer spento. */
  sleepTimerEndTime: number | null
  addToPlaylistTrack: Track | null
  trackDetail: TrackModalContext | null
  trackActions: TrackModalContext | null
  shareTrack: Track | null
}

const initialState: UiState = {
  toast: null,
  sleepTimerEndTime: null,
  addToPlaylistTrack: null,
  trackDetail: null,
  trackActions: null,
  shareTrack: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast(state, action: PayloadAction<string>) {
      state.toast = action.payload
    },
    hideToast(state) {
      state.toast = null
    },

    setSleepTimer(state, action: PayloadAction<number | null>) {
      state.sleepTimerEndTime = action.payload
    },

    openAddToPlaylist(state, action: PayloadAction<Track>) {
      state.addToPlaylistTrack = action.payload
    },
    closeAddToPlaylist(state) {
      state.addToPlaylistTrack = null
    },

    openTrackDetail(state, action: PayloadAction<TrackModalContext>) {
      state.trackDetail = action.payload
    },
    closeTrackDetail(state) {
      state.trackDetail = null
    },

    openTrackActions(state, action: PayloadAction<TrackModalContext>) {
      state.trackActions = action.payload
    },
    closeTrackActions(state) {
      state.trackActions = null
    },

    openShare(state, action: PayloadAction<Track>) {
      state.shareTrack = action.payload
    },
    closeShare(state) {
      state.shareTrack = null
    },
  },
})

export const {
  showToast,
  hideToast,
  setSleepTimer,
  openAddToPlaylist,
  closeAddToPlaylist,
  openTrackDetail,
  closeTrackDetail,
  openTrackActions,
  closeTrackActions,
  openShare,
  closeShare,
} = uiSlice.actions

export default uiSlice.reducer
