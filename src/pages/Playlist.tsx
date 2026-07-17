// Playlist virtuale (Top Italia, Chill Vibes, ...): il contenuto viene cercato
// su iTunes al momento dell'apertura.

import { useParams } from 'react-router-dom'
import { VIRTUAL_PLAYLISTS } from '../api/staticData'
import { AsyncContent } from '../components/common/AsyncContent'
import { ActionsRow, PlayButton, PlaylistHeader } from '../components/common/PlaylistHeader'
import { TrackList } from '../components/tracks/TrackList'
import { useCatalogQuery } from '../hooks/useCatalogQuery'
import { useAppDispatch } from '../store/hooks'
import { playTracks } from '../store/playerThunks'
import { fetchPlaylist, playlistKey } from '../store/slices/catalogSlice'
import type { VirtualPlaylist } from '../types'

function VirtualPlaylistPage({ vp }: { vp: VirtualPlaylist }) {
  const dispatch = useAppDispatch()

  const state = useCatalogQuery({
    key: playlistKey(vp.id),
    run: () => fetchPlaylist(vp.id),
    select: (s) => s.catalog.playlists[vp.id],
  })

  return (
    <AsyncContent state={state}>
      {({ cover, tracks }) => (
        <>
          <PlaylistHeader cover={cover} type="Playlist" title={vp.title}>
            <div className="playlist-meta">{vp.description}</div>
            <div className="playlist-meta mt-2">{tracks.length} brani</div>
          </PlaylistHeader>

          <ActionsRow>
            <PlayButton onClick={() => dispatch(playTracks(tracks))} />
          </ActionsRow>

          <TrackList tracks={tracks} />
        </>
      )}
    </AsyncContent>
  )
}

export function Playlist() {
  const { playlistId = '' } = useParams()
  const vp = VIRTUAL_PLAYLISTS.find((p) => p.id === playlistId)

  if (!vp) return <p className="text-secondary mt-4">Playlist non trovata.</p>
  return <VirtualPlaylistPage vp={vp} />
}
