// ============================================
// HOME — saluto, playlist dell'utente, preferiti, playlist in evidenza,
// podcast e album popolari.
// ============================================

import { USER_PLAYLIST_COVER, VIRTUAL_PLAYLISTS } from '../api/staticData'
import { AsyncContent } from '../components/common/AsyncContent'
import { Card, CardGrid } from '../components/common/Card'
import { useCatalogQuery } from '../hooks/useCatalogQuery'
import { useQuickPlay } from '../hooks/useQuickPlay'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playTracks } from '../store/playerThunks'
import { selectLikedTracks } from '../store/selectors'
import { fetchHome, HOME_KEY } from '../store/slices/catalogSlice'
import { getGreeting } from '../utils/format'

const MAX_LIKED_CARDS = 6

export function Home() {
  const dispatch = useAppDispatch()
  const { playAlbum, playVirtualPlaylist } = useQuickPlay()

  const displayName = useAppSelector((state) => state.profile.displayName)
  const likedTracks = useAppSelector(selectLikedTracks)
  const userPlaylists = useAppSelector((state) => state.library.userPlaylists)
  const recentTracks = useAppSelector((state) => state.library.recentTracks)

  const state = useCatalogQuery({
    key: HOME_KEY,
    run: () => fetchHome(),
    select: (s) => s.catalog.home ?? undefined,
  })

  return (
    <>
      <h1 className="greeting-title">
        {getGreeting()}, {displayName}
      </h1>

      {(userPlaylists.length > 0 || recentTracks.length > 0) && (
        <>
          <h2 className="section-title">Le tue playlist</h2>
          <CardGrid>
            {recentTracks.length > 0 && (
              <Card
                cover={USER_PLAYLIST_COVER}
                title="Ascoltati di recente"
                description={`${recentTracks.length} brani`}
                to="/recent"
                onPlay={() => dispatch(playTracks(recentTracks))}
              />
            )}
            {userPlaylists.map((playlist) => (
              <Card
                key={playlist.id}
                cover={USER_PLAYLIST_COVER}
                title={playlist.name}
                description={`${playlist.tracks.length} brani`}
                to={`/userplaylist/${playlist.id}`}
                onPlay={() => dispatch(playTracks(playlist.tracks))}
              />
            ))}
          </CardGrid>
        </>
      )}

      {likedTracks.length > 0 && (
        <>
          <h2 className="section-title">I tuoi brani preferiti</h2>
          <CardGrid>
            {likedTracks.slice(0, MAX_LIKED_CARDS).map((track) => (
              // Una card di brano non apre una pagina: riproduce e basta
              <Card
                key={track.id}
                cover={track.cover}
                title={track.title}
                description={track.artist}
                onClick={() => dispatch(playTracks([track]))}
                onPlay={() => dispatch(playTracks([track]))}
              />
            ))}
          </CardGrid>
        </>
      )}

      <AsyncContent state={state}>
        {({ albums, podcasts, playlistCovers }) => {
          return (
            <>
              <h2 className="section-title">Playlist in evidenza</h2>
              <CardGrid>
                {VIRTUAL_PLAYLISTS.map((playlist, i) => (
                  <Card
                    key={playlist.id}
                    cover={playlistCovers[i]}
                    title={playlist.title}
                    description={playlist.description}
                    to={`/playlist/${playlist.id}`}
                    onPlay={() => void playVirtualPlaylist(playlist.id)}
                  />
                ))}
              </CardGrid>

              <h2 className="section-title">🎙️ Podcast più ascoltati</h2>
              <CardGrid>
                {podcasts.map((podcast) => (
                  <Card
                    key={podcast.id}
                    cover={podcast.cover}
                    title={podcast.title}
                    description={podcast.author}
                    // noopener: impedisce alla pagina esterna di accedere a window.opener
                    onClick={() => window.open(podcast.url, '_blank', 'noopener')}
                  />
                ))}
              </CardGrid>

              {albums.length > 0 && (
                <>
                  <h2 className="section-title">Album popolari</h2>
                  <CardGrid>
                    {albums.map((album) => (
                      <Card
                        key={album.id}
                        cover={album.cover}
                        title={album.title}
                        description={album.artist}
                        to={`/album/${album.id}`}
                        onPlay={() => void playAlbum(album.id)}
                      />
                    ))}
                  </CardGrid>
                </>
              )}
            </>
          )
        }}
      </AsyncContent>
    </>
  )
}
