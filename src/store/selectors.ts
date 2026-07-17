// ============================================
// SELETTORI DERIVATI
// createSelector memoizza: le liste ricavate da Record/array non vengono
// ricostruite a ogni render, evitando re-render inutili.
// ============================================

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'

export const selectLikedTracks = createSelector(
  (state: RootState) => state.library.likedTracks,
  (likedTracks) => Object.values(likedTracks),
)

export const selectFavoriteArtists = createSelector(
  (state: RootState) => state.library.favoriteArtists,
  (favoriteArtists) => Object.values(favoriteArtists),
)

/** true se il brano è tra i preferiti. */
export const selectIsLiked = (state: RootState, trackId: string): boolean =>
  Boolean(state.library.likedTracks[trackId])

/** true se l'artista è seguito. */
export const selectIsFollowed = (state: RootState, artistId: string): boolean =>
  Boolean(state.library.favoriteArtists[artistId])

export const selectPlaylistById = (state: RootState, playlistId: string) =>
  state.library.userPlaylists.find((p) => p.id === playlistId)

/** Artisti ordinati per numero di ascolti, dal più ascoltato. */
export const selectTopArtists = createSelector(
  (state: RootState) => state.stats.artistPlays,
  (artistPlays) => Object.entries(artistPlays).sort((a, b) => b[1] - a[1]),
)

/**
 * Copertina da mostrare accanto a un artista nel Wrapped: quella del suo
 * brano più recente. Le statistiche salvano solo il nome, non l'immagine.
 */
export const selectArtistCover = (state: RootState, artistName: string): string | undefined => {
  const fromRecent = state.library.recentTracks.find((t) => t.artist === artistName)
  if (fromRecent) return fromRecent.cover
  return Object.values(state.library.likedTracks).find((t) => t.artist === artistName)?.cover
}
