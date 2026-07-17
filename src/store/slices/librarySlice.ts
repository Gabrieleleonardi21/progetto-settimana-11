// ============================================
// LIBRERIA — preferiti, artisti seguiti, playlist utente, brani recenti
//
// Le Map del progetto vanilla diventano Record<id, valore>: Redux richiede
// stato serializzabile. Su localStorage però continuiamo a scrivere il formato
// originale (array di coppie [id, valore]) così le due versioni dell'app
// possono leggere gli stessi dati.
// ============================================

import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { FavoriteArtist, Track, UserPlaylist } from '../../types'
import { KEYS, readJson } from '../../utils/storage'

const MAX_RECENT_TRACKS = 10

interface LibraryState {
  likedTracks: Record<string, Track>
  favoriteArtists: Record<string, FavoriteArtist>
  userPlaylists: UserPlaylist[]
  recentTracks: Track[]
}

/**
 * Legge una collezione indicizzata accettando sia il formato nuovo
 * (oggetto) sia quello storico del progetto vanilla (array di coppie).
 */
function readRecord<T>(key: string): Record<string, T> {
  const raw = readJson<unknown>(key, {})
  if (Array.isArray(raw)) return Object.fromEntries(raw as [string, T][])
  return raw as Record<string, T>
}

const initialState: LibraryState = {
  likedTracks: readRecord<Track>(KEYS.likedTracks),
  favoriteArtists: readRecord<FavoriteArtist>(KEYS.favoriteArtists),
  userPlaylists: readJson<UserPlaylist[]>(KEYS.userPlaylists, []),
  recentTracks: readJson<Track[]>(KEYS.recentTracks, []),
}

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    /** Richiede il brano completo: se non è ancora tra i preferiti va salvato per intero. */
    toggleLike(state, action: PayloadAction<Track>) {
      const track = action.payload
      if (state.likedTracks[track.id]) delete state.likedTracks[track.id]
      else state.likedTracks[track.id] = track
    },

    toggleFollowArtist(state, action: PayloadAction<FavoriteArtist>) {
      const artist = action.payload
      if (!artist.artistId) return
      if (state.favoriteArtists[artist.artistId]) delete state.favoriteArtists[artist.artistId]
      else state.favoriteArtists[artist.artistId] = artist
    },

    createPlaylist: {
      reducer(state, action: PayloadAction<UserPlaylist>) {
        state.userPlaylists.push(action.payload)
      },
      // L'id si genera qui, non nel reducer: i reducer devono restare puri
      prepare(name: string) {
        return { payload: { id: `up${nanoid(8)}`, name, tracks: [] } as UserPlaylist }
      },
    },

    renamePlaylist(state, action: PayloadAction<{ playlistId: string; name: string }>) {
      const playlist = state.userPlaylists.find((p) => p.id === action.payload.playlistId)
      if (playlist) playlist.name = action.payload.name
    },

    deletePlaylist(state, action: PayloadAction<string>) {
      state.userPlaylists = state.userPlaylists.filter((p) => p.id !== action.payload)
    },

    addTrackToPlaylist(state, action: PayloadAction<{ playlistId: string; track: Track }>) {
      const { playlistId, track } = action.payload
      const playlist = state.userPlaylists.find((p) => p.id === playlistId)
      if (!playlist) return
      if (playlist.tracks.some((t) => t.id === track.id)) return // già presente
      playlist.tracks.push(track)
    },

    removeTrackFromPlaylist(state, action: PayloadAction<{ playlistId: string; trackId: string }>) {
      const playlist = state.userPlaylists.find((p) => p.id === action.payload.playlistId)
      if (!playlist) return
      playlist.tracks = playlist.tracks.filter((t) => t.id !== action.payload.trackId)
    },

    /** Tiene gli ultimi 10 brani, senza duplicati, dal più recente. */
    addRecentTrack(state, action: PayloadAction<Track>) {
      const track = action.payload
      state.recentTracks = [
        track,
        ...state.recentTracks.filter((t) => t.id !== track.id),
      ].slice(0, MAX_RECENT_TRACKS)
    },
  },
})

export const {
  toggleLike,
  toggleFollowArtist,
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  addRecentTrack,
} = librarySlice.actions

export default librarySlice.reducer
