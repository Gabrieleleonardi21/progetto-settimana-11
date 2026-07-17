// Ultimi 10 brani ascoltati.

import { ActionsRow, PlayButton, PlaylistHeader } from '../components/common/PlaylistHeader'
import { TrackList } from '../components/tracks/TrackList'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playTracks } from '../store/playerThunks'

export function RecentTracks() {
  const dispatch = useAppDispatch()
  const recentTracks = useAppSelector((state) => state.library.recentTracks)

  return (
    <>
      <PlaylistHeader cover={null} type="Playlist" title="Ascoltati di recente">
        <div className="playlist-meta">{recentTracks.length} brani</div>
      </PlaylistHeader>

      <ActionsRow>
        <PlayButton onClick={() => dispatch(playTracks(recentTracks))} />
      </ActionsRow>

      {recentTracks.length === 0 && (
        <p className="text-secondary mt-4">Non hai ancora ascoltato alcun brano.</p>
      )}
      {recentTracks.length > 0 && <TrackList tracks={recentTracks} />}
    </>
  )
}
