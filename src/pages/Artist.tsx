// ============================================
// Pagina artista: intestazione, bottone segui, griglia degli album.
// L'artista del brano locale non esiste su iTunes: ha un ramo dedicato,
// così non parte nessuna chiamata all'API.
// ============================================

import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { cached } from '../api/cache'
import { itunesGetArtist } from '../api/itunes'
import { normalizeAlbum, normalizeList, normalizeTrack } from '../api/normalize'
import { CUSTOM_TRACK_DARIO } from '../api/staticData'
import { AsyncContent } from '../components/common/AsyncContent'
import { Card, CardGrid } from '../components/common/Card'
import { PlaylistHeader } from '../components/common/PlaylistHeader'
import { TrackList } from '../components/tracks/TrackList'
import { useAsync } from '../hooks/useAsync'
import { useQuickPlay } from '../hooks/useQuickPlay'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectIsFollowed } from '../store/selectors'
import { toggleFollowArtist } from '../store/slices/librarySlice'
import type { FavoriteArtist } from '../types'

const CUSTOM_ARTIST_ID = String(CUSTOM_TRACK_DARIO.artistId)

function FollowButton({ artist }: { artist: FavoriteArtist }) {
  const dispatch = useAppDispatch()
  const isFollowed = useAppSelector((state) => selectIsFollowed(state, artist.artistId))

  let className = 'btn mt-3 btn-success'
  let label = 'Segui'
  if (isFollowed) {
    className = 'btn mt-3 btn-outline-light'
    label = 'Seguito'
  }

  return (
    <button className={className} onClick={() => dispatch(toggleFollowArtist(artist))}>
      {label}
    </button>
  )
}

/** L'artista del brano locale: nessuna chiamata all'API, un solo brano. */
function CustomArtist() {
  const track = normalizeTrack(CUSTOM_TRACK_DARIO)

  return (
    <>
      <PlaylistHeader cover={null} type="Artista" title={CUSTOM_TRACK_DARIO.artistName ?? ''}>
        <div className="playlist-meta">Artista indipendente</div>
      </PlaylistHeader>

      <h2 className="section-title">Brani</h2>
      {track && <TrackList tracks={[track]} />}
    </>
  )
}

function ItunesArtist({ artistId }: { artistId: string }) {
  const { playAlbum } = useQuickPlay()

  const state = useAsync(
    useCallback(() => cached(`artist_${artistId}`, () => itunesGetArtist(artistId)), [artistId]),
    [artistId],
  )

  return (
    <AsyncContent state={state}>
      {({ artist, albums: rawAlbums }) => {
        if (!artist) return <p className="text-secondary mt-4">Artista non trovato.</p>

        const albums = normalizeList(rawAlbums, normalizeAlbum)
        const favorite: FavoriteArtist = {
          artistId: String(artist.artistId ?? ''),
          artistName: artist.artistName ?? '',
          genre: artist.primaryGenreName ?? '',
        }

        return (
          <>
            <PlaylistHeader
              cover={null}
              type="Artista"
              title={favorite.artistName}
              aside={<FollowButton artist={favorite} />}
            >
              <div className="playlist-meta">
                <span>{favorite.genre}</span>
              </div>
            </PlaylistHeader>

            {albums.length > 0 && (
              <>
                <h2 className="section-title">Album</h2>
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
  )
}

export function Artist() {
  const { artistId = '' } = useParams()

  if (artistId === CUSTOM_ARTIST_ID) return <CustomArtist />
  return <ItunesArtist artistId={artistId} />
}
