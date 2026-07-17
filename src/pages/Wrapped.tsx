// ============================================
// WRAPPED — i 5 artisti più ascoltati
//
// Le statistiche salvano solo il nome dell'artista, non la copertina: viene
// ripescata dai brani recenti o dai preferiti. Se non si trova, si genera una
// copertina SVG con le iniziali (nel vanilla puntava a un file inesistente).
// ============================================

import { CardGrid } from '../components/common/Card'
import { useAppSelector } from '../store/hooks'
import { selectArtistCover, selectTopArtists } from '../store/selectors'
import type { RootState } from '../store'
import { createCover } from '../utils/format'

const TOP_COUNT = 5

function ArtistCard({ artistName, plays, rank }: { artistName: string; plays: number; rank: number }) {
  const cover = useAppSelector((state: RootState) => selectArtistCover(state, artistName))

  return (
    <div className="album-card">
      <img
        className="album-cover"
        src={cover ?? createCover(artistName.substring(0, 2).toUpperCase(), '#555', '#333')}
        alt={artistName}
      />
      <div className="rank-placeholder">#{rank}</div>
      <div className="album-title">{artistName}</div>
      <div className="album-description">{plays} ascolti</div>
    </div>
  )
}

export function Wrapped() {
  const topArtists = useAppSelector(selectTopArtists)

  return (
    <>
      <h2 className="section-title">Il tuo Wrapped {new Date().getFullYear()}</h2>

      {topArtists.length === 0 && (
        <p className="text-secondary">Ascolta qualche brano per vedere le tue statistiche!</p>
      )}

      {topArtists.length > 0 && (
        <CardGrid>
          {topArtists.slice(0, TOP_COUNT).map(([artistName, plays], index) => (
            <ArtistCard key={artistName} artistName={artistName} plays={plays} rank={index + 1} />
          ))}
        </CardGrid>
      )}
    </>
  )
}
