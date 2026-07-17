// ============================================
// RIPRODUZIONE DAL BOTTONE PLAY SULLE CARD
//
// Album e playlist virtuali non hanno i brani già in memoria: vanno chiesti
// all'API (o allo store, se una pagina li ha già caricati) prima di metterli
// in coda.
//
// L'id arriva al click, non al render: `useAppSelector` non si può usare dentro
// un handler, quindi si legge lo store con `useAppStore().getState()`.
// ============================================

import { useCallback } from 'react'
import { useAppDispatch, useAppStore } from '../store/hooks'
import { playTracks } from '../store/playerThunks'
import { fetchAlbum, fetchPlaylist } from '../store/slices/catalogSlice'
import { showToast } from '../store/slices/uiSlice'

export function useQuickPlay() {
  const dispatch = useAppDispatch()
  const store = useAppStore()

  const playAlbum = useCallback(
    async (albumId: string) => {
      // Il thunk non riparte se il dato è già nello store (vedi `condition`)
      await dispatch(fetchAlbum(albumId))

      const detail = store.getState().catalog.albums[albumId]
      if (!detail) {
        dispatch(showToast('Impossibile caricare l’album'))
        return
      }
      dispatch(playTracks(detail.tracks))
    },
    [dispatch, store],
  )

  const playVirtualPlaylist = useCallback(
    async (playlistId: string) => {
      await dispatch(fetchPlaylist(playlistId))

      const detail = store.getState().catalog.playlists[playlistId]
      if (!detail) {
        dispatch(showToast('Impossibile caricare la playlist'))
        return
      }
      dispatch(playTracks(detail.tracks))
    },
    [dispatch, store],
  )

  return { playAlbum, playVirtualPlaylist }
}
