// Pagina di un album iTunes.

import { useParams } from 'react-router-dom'
import { AsyncContent } from '../components/common/AsyncContent'
import { ActionsRow, PlayButton, PlaylistHeader } from '../components/common/PlaylistHeader'
import { TrackList } from '../components/tracks/TrackList'
import { useCatalogQuery } from '../hooks/useCatalogQuery'
import { useAppDispatch } from '../store/hooks'
import { playTracks } from '../store/playerThunks'
import { albumKey, fetchAlbum } from '../store/slices/catalogSlice'

export function Album() {
  const { albumId = '' } = useParams()
  const dispatch = useAppDispatch()

  const state = useCatalogQuery({
    key: albumKey(albumId),
    run: () => fetchAlbum(albumId),
    select: (s) => s.catalog.albums[albumId],
  })

  return (
    <AsyncContent state={state}>
      {({ album, tracks }) => {
        if (!album) return <p className="text-secondary mt-4">Album non trovato.</p>

        return (
          <>
            <PlaylistHeader cover={album.cover} type="Album" title={album.title}>
              <div className="playlist-meta">
                <strong>{album.artist}</strong>
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
