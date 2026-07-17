// ============================================
// RIPRODUZIONE DAL BOTTONE PLAY SULLE CARD
//
// Album e playlist virtuali non hanno i brani già in memoria: vanno chiesti
// all'API (o alla cache) prima di poterli mettere in coda.
// ============================================

import { useCallback } from 'react'
import { cached } from '../api/cache'
import { itunesGetAlbum, itunesGetPlaylistTracks } from '../api/itunes'
import { normalizeList, normalizeTrack } from '../api/normalize'
import { useAppDispatch } from '../store/hooks'
import { playTracks } from '../store/playerThunks'
import { showToast } from '../store/slices/uiSlice'

export function useQuickPlay() {
  const dispatch = useAppDispatch()

  const playAlbum = useCallback(
    async (albumId: string) => {
      try {
        const { tracks } = await cached(`album_${albumId}`, () => itunesGetAlbum(albumId))
        dispatch(playTracks(normalizeList(tracks, normalizeTrack)))
      } catch {
        dispatch(showToast('Impossibile caricare l’album'))
      }
    },
    [dispatch],
  )

  const playVirtualPlaylist = useCallback(
    async (playlistId: string) => {
      try {
        const raw = await cached(`vptracks_${playlistId}`, () => itunesGetPlaylistTracks(playlistId))
        dispatch(playTracks(normalizeList(raw, normalizeTrack)))
      } catch {
        dispatch(showToast('Impossibile caricare la playlist'))
      }
    },
    [dispatch],
  )

  return { playAlbum, playVirtualPlaylist }
}
