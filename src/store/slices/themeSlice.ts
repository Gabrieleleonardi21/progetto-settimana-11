// ============================================
// TEMI COLORE — ogni tema ridefinisce le variabili CSS di :root
//
// "--spotify-green/-hover" = colore d'accento (bottoni, like, barra avanzamento).
// "--spotify-dark/-dark-gray/-gray/--sidebar-bg/--player-bg" = tonalità di sfondo.
// L'applicazione al DOM avviene in hooks/useApplyTheme.ts.
// ============================================

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Theme } from '../../types'
import { KEYS, readString } from '../../utils/storage'

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Spotify Green',
    vars: {
      '--spotify-green': '#1db954',
      '--spotify-green-hover': '#1ed760',
      '--spotify-dark': '#121212',
      '--spotify-dark-gray': '#181818',
      '--spotify-gray': '#282828',
      '--sidebar-bg': '#000000',
      '--player-bg': '#181818',
      '--topbar-bg': 'rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    vars: {
      '--spotify-green': '#1db4e0',
      '--spotify-green-hover': '#33c4ee',
      '--spotify-dark': '#0d1620',
      '--spotify-dark-gray': '#13202c',
      '--spotify-gray': '#1c3142',
      '--sidebar-bg': '#081019',
      '--player-bg': '#13202c',
      '--topbar-bg': 'rgba(8, 16, 25, 0.5)',
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    vars: {
      '--spotify-green': '#a259ff',
      '--spotify-green-hover': '#b87bff',
      '--spotify-dark': '#150f1f',
      '--spotify-dark-gray': '#1d1428',
      '--spotify-gray': '#2b1f3b',
      '--sidebar-bg': '#0d0815',
      '--player-bg': '#1d1428',
      '--topbar-bg': 'rgba(13, 8, 21, 0.5)',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    vars: {
      '--spotify-green': '#ff7a3d',
      '--spotify-green-hover': '#ff9460',
      '--spotify-dark': '#1f1410',
      '--spotify-dark-gray': '#271a14',
      '--spotify-gray': '#3a2a1f',
      '--sidebar-bg': '#140d0a',
      '--player-bg': '#271a14',
      '--topbar-bg': 'rgba(20, 13, 10, 0.5)',
    },
  },
  {
    id: 'ruby',
    name: 'Ruby Red',
    vars: {
      '--spotify-green': '#e0314f',
      '--spotify-green-hover': '#ec5670',
      '--spotify-dark': '#1a0e10',
      '--spotify-dark-gray': '#251418',
      '--spotify-gray': '#371d22',
      '--sidebar-bg': '#11080a',
      '--player-bg': '#251418',
      '--topbar-bg': 'rgba(17, 8, 10, 0.5)',
    },
  },
  {
    id: 'mono',
    name: 'Dario Mode',
    vars: {
      '--spotify-green': '#e5e5e5',
      '--spotify-green-hover': '#ffffff',
      '--spotify-dark': '#101010',
      '--spotify-dark-gray': '#181818',
      '--spotify-gray': '#2a2a2a',
      '--sidebar-bg': '#000000',
      '--player-bg': '#181818',
      '--topbar-bg': 'rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'nicky',
    name: 'Nicole',
    vars: {
      '--spotify-green': '#ff00b7',
      '--spotify-green-hover': '#ff85f7',
      '--spotify-dark': '#a47d99',
      '--spotify-dark-gray': '#8e48c0',
      '--spotify-gray': '#2a2a2a',
      '--sidebar-bg': '#93508c',
      '--player-bg': '#8e48c0',
      '--topbar-bg': 'rgba(147, 80, 140, 0.5)',
    },
  },
]

const DEFAULT_THEME_ID = 'default'

/** Il tema salvato, o quello di default se l'id non esiste più. */
export function resolveTheme(themeId: string): Theme {
  return THEMES.find((t) => t.id === themeId) ?? THEMES[0]
}

interface ThemeState {
  themeId: string
}

const initialState: ThemeState = {
  themeId: resolveTheme(readString(KEYS.colorTheme) ?? DEFAULT_THEME_ID).id,
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<string>) {
      state.themeId = resolveTheme(action.payload).id
    },
  },
})

export const { setTheme } = themeSlice.actions
export default themeSlice.reducer
