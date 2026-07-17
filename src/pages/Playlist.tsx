// Playlist virtuale (Top Italia, Chill Vibes, ...): il contenuto viene cercato
// su iTunes al momento dell'apertura.

import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { cached } from '../api/cache'
import { itunesGetPlaylistTracks } from '../api/itunes'
import { getVirtualPlaylistCover, normalizeList, normalizeTrack } from '../api/normalize'
import { VIRTUAL_PLAYLISTS } from '../api/staticData'
import { AsyncContent } from '../components/common/AsyncContent'
import { ActionsRow, PlayButton, PlaylistHeader } from '../components/common/PlaylistHeader'
import { TrackList } from '../components/tracks/TrackList'
import { useAsync } from '../hooks/useAsync'
import { useAppDispatch } from '../store/hooks'
import { playTracks } from '../store/playerThunks'
import type { VirtualPlaylist } from '../types'

/** Cover e brani sono richieste indipendenti: partono insieme. */
function loadPlaylist(vp: VirtualPlaylist) {
  return Promise.all([
    getVirtualPlaylistCover(vp),
    cached(`vptracks_${vp.id}`, () => itunesGetPlaylistTracks(vp.id)),
  ])
}

function VirtualPlaylistPage({ vp }: { vp: VirtualPlaylist }) {
  const dispatch = useAppDispatch()
  const state = useAsync(useCallback(() => loadPlaylist(vp), [vp]), [vp.id])

  return (
    <AsyncContent state={state}>
      {([cover, rawTracks]) => {
        const tracks = normalizeList(rawTracks, normalizeTrack)

        return (
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
        )
      }}
    </AsyncContent>
  )
}

export function Playlist() {
  const { playlistId = '' } = useParams()
  const vp = VIRTUAL_PLAYLISTS.find((p) => p.id === playlistId)

  if (!vp) return <p className="text-secondary mt-4">Playlist non trovata.</p>
  return <VirtualPlaylistPage vp={vp} />
}
