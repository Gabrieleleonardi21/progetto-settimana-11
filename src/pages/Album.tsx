// Pagina di un album iTunes.

import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { cached } from '../api/cache'
import { itunesGetAlbum } from '../api/itunes'
import { normalizeAlbum, normalizeList, normalizeTrack } from '../api/normalize'
import { AsyncContent } from '../components/common/AsyncContent'
import { ActionsRow, PlayButton, PlaylistHeader } from '../components/common/PlaylistHeader'
import { TrackList } from '../components/tracks/TrackList'
import { useAsync } from '../hooks/useAsync'
import { useAppDispatch } from '../store/hooks'
import { playTracks } from '../store/playerThunks'

export function Album() {
  const { albumId = '' } = useParams()
  const dispatch = useAppDispatch()

  const state = useAsync(
    useCallback(() => cached(`album_${albumId}`, () => itunesGetAlbum(albumId)), [albumId]),
    [albumId],
  )

  return (
    <AsyncContent state={state}>
      {({ album, tracks: rawTracks }) => {
        const normalized = normalizeAlbum(album)
        if (!normalized) return <p className="text-secondary mt-4">Album non trovato.</p>

        const tracks = normalizeList(rawTracks, normalizeTrack)

        return (
          <>
            <PlaylistHeader cover={normalized.cover} type="Album" title={normalized.title}>
              <div className="playlist-meta">
                <strong>{normalized.artist}</strong>
                {` • ${tracks.length} brani`}
              </div>
            </PlaylistHeader>

            <ActionsRow>
              <PlayButton onClick={() => dispatch(playTracks(tracks))} />
            </ActionsRow>

            <TrackList tracks={tracks} />
          </>
        )
      }}
    </AsyncContent>
  )
}
