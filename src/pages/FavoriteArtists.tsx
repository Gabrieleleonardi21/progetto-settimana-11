// Artisti seguiti. Le card non hanno copertina: iTunes non espone
// un'immagine per l'entità "artist".

import { useNavigate } from 'react-router-dom'
import { CardGrid } from '../components/common/Card'
import { useAppSelector } from '../store/hooks'
import { selectFavoriteArtists } from '../store/selectors'

export function FavoriteArtists() {
  const navigate = useNavigate()
  const artists = useAppSelector(selectFavoriteArtists)

  return (
    <>
      <h1 className="greeting-title">Artisti preferiti</h1>

      {artists.length === 0 && <p className="text-secondary mt-4">Non segui ancora nessun artista.</p>}

      {artists.length > 0 && (
        <CardGrid>
          {artists.map((artist) => (
            <div key={artist.artistId} className="album-card" onClick={() => navigate(`/artist/${artist.artistId}`)}>
              <div className="album-title">{artist.artistName}</div>
              <div className="album-description">{artist.genre}</div>
            </div>
          ))}
        </CardGrid>
      )}
    </>
  )
}
