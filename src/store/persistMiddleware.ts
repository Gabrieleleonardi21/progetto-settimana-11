// ============================================
// PERSISTENZA SU localStorage
//
// Nel progetto vanilla ogni mutazione doveva ricordarsi di chiamare la sua
// `save*()`. Qui c'è un solo punto: il middleware osserva le action e riscrive
// le chiavi interessate. Aggiungere un reducer non richiede di toccare nulla.
// ============================================

import { createListenerMiddleware, isAnyOf, type UnknownAction } from '@reduxjs/toolkit'
import { KEYS, writeJson, writeString } from '../utils/storage'
import { login, logout } from './slices/authSlice'
import { setCurrent, setVolume } from './slices/playerSlice'
import { updateProfile } from './slices/profileSlice'
import { registerListen } from './slices/statsSlice'
import { resolveTheme, setTheme } from './slices/themeSlice'
import { showToast } from './slices/uiSlice'
import type { AppDispatch, RootState } from './index'

export const persistMiddleware = createListenerMiddleware()

const startListening = persistMiddleware.startListening.withTypes<RootState, AppDispatch>()

/** Vero per qualsiasi action prodotta dallo slice indicato. */
function fromSlice(name: string) {
  return (action: UnknownAction) => action.type.startsWith(`${name}/`)
}

// --- LIBRERIA ---------------------------------------------------------------
// Le collezioni indicizzate vengono salvate come array di coppie [id, valore]:
// è il formato che il progetto vanilla si aspetta (`new Map(array)`).
startListening({
  predicate: fromSlice('library'),
  effect: (_action, api) => {
    const { likedTracks, favoriteArtists, userPlaylists, recentTracks } = api.getState().library
    writeJson(KEYS.likedTracks, Object.entries(likedTracks))
    writeJson(KEYS.favoriteArtists, Object.entries(favoriteArtists))
    writeJson(KEYS.userPlaylists, userPlaylists)
    writeJson(KEYS.recentTracks, recentTracks)
  },
})

// --- PROFILO ----------------------------------------------------------------
startListening({
  matcher: isAnyOf(updateProfile, login),
  effect: (_action, api) => {
    const { displayName, bio, location, profilePhoto, joinDate } = api.getState().profile
    writeString(KEYS.displayName, displayName)
    writeString(KEYS.profileBio, bio)
    writeString(KEYS.profileLocation, location)
    writeString(KEYS.profileJoinDate, joinDate)

    // La foto è un data URL: da sola può saturare la quota di localStorage.
    // Meglio avvisare che fallire in silenzio, il resto del profilo è già salvo.
    try {
      writeString(KEYS.profilePhoto, profilePhoto)
    } catch {
      api.dispatch(showToast('Spazio insufficiente: la foto non è stata salvata.'))
    }
  },
})

// --- SESSIONE ---------------------------------------------------------------
startListening({
  actionCreator: login,
  effect: () => writeString(KEYS.sessionActive, '1'),
})

startListening({
  actionCreator: logout,
  effect: () => {
    // Il profilo resta: si chiude solo la sessione
    writeString(KEYS.sessionActive, null)
    writeString(KEYS.currentTrack, null)
  },
})

// --- PLAYER -----------------------------------------------------------------
startListening({
  actionCreator: setVolume,
  effect: (_action, api) => writeString(KEYS.playerVolume, String(api.getState().player.volume)),
})

// Ripristina la UI del player al ricaricamento della pagina
startListening({
  actionCreator: setCurrent,
  effect: (action) => writeJson(KEYS.currentTrack, action.payload.track),
})

// --- STATISTICHE ------------------------------------------------------------
startListening({
  actionCreator: registerListen,
  effect: (_action, api) => writeJson(KEYS.wrappedStats, api.getState().stats.artistPlays),
})

// --- TEMA -------------------------------------------------------------------
startListening({
  actionCreator: setTheme,
  effect: (_action, api) => {
    const theme = resolveTheme(api.getState().theme.themeId)
    writeString(KEYS.colorTheme, theme.id)
    // Copia già risolta letta dallo script inline in index.html per evitare il FOUC
    writeJson(KEYS.colorThemeVars, theme.vars)
  },
})
