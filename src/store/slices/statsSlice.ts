// ============================================
// STATISTICHE DI ASCOLTO — alimentano la pagina "Il tuo Wrapped"
// ============================================

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { KEYS, readJson } from '../../utils/storage'

interface StatsState {
  /** Numero di ascolti per nome artista. */
  artistPlays: Record<string, number>
}

const initialState: StatsState = {
  artistPlays: readJson<Record<string, number>>(KEYS.wrappedStats, {}),
}

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    /** Chiamata a ogni riproduzione. Il payload è il nome dell'artista. */
    registerListen(state, action: PayloadAction<string>) {
      const artist = action.payload
      if (!artist) return
      state.artistPlays[artist] = (state.artistPlays[artist] ?? 0) + 1
    },
  },
})

export const { registerListen } = statsSlice.actions
export default statsSlice.reducer
