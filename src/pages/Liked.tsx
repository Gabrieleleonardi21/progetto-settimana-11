// Brani che ti piacciono.

import { ActionsRow, PlayButton, PlaylistHeader } from '../components/common/PlaylistHeader'
import { TrackList } from '../components/tracks/TrackList'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playTracks } from '../store/playerThunks'
import { selectLikedTracks } from '../store/selectors'

export function Liked() {
  const dispatch = useAppDispatch()
  const likedTracks = useAppSelector(selectLikedTracks)
  const displayName = useAppSelector((state) => state.profile.displayName)

  return (
    <>
      <PlaylistHeader cover={null} type="Playlist" title="Brani che ti piacciono">
        <div className="playlist-meta">
          <strong>{displayName}</strong>
          {` • ${likedTracks.length} brani`}
        </div>
      </PlaylistHeader>

      {likedTracks.length === 0 && (
        <div className="text-center mt-5 text-secondary">
          <i className="bi bi-heart" style={{ fontSize: 48 }} />
          <p className="mt-3">Non hai ancora salvato brani. Clicca sul cuore ♥ per aggiungerli.</p>
        </div>
      )}

      {likedTracks.length > 0 && (
        <>
          <ActionsRow>
            <PlayButton onClick={() => dispatch(playTracks(likedTracks))} />
          </ActionsRow>
          <TrackList tracks={likedTracks} />
        </>
      )}
    </>
  )
}
