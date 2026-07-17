// ============================================
// RICERCA — campo con debounce + griglia dei generi
// ============================================

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { itunesSearch } from '../api/itunes'
import { dedupeById, normalizeAlbum, normalizeList, normalizeTrack } from '../api/normalize'
import { CUSTOM_TRACK_DARIO, GENRES } from '../api/staticData'
import { Card, CardGrid } from '../components/common/Card'
import { TrackList } from '../components/tracks/TrackList'
import { useQuickPlay } from '../hooks/useQuickPlay'
import type { Album, Track } from '../types'

/** Attesa dopo l'ultimo tasto premuto, per non sovraccaricare l'API. */
const DEBOUNCE_MS = 400

interface Results {
  tracks: Track[]
  albums: Album[]
}

type Status = 'idle' | 'loading' | 'done' | 'error'

/** Il brano locale non esiste su iTunes: lo si confronta con la query a mano. */
function matchesCustomTrack(query: string): boolean {
  const q = query.trim().toLowerCase()
  return (
    (CUSTOM_TRACK_DARIO.trackName ?? '').toLowerCase().includes(q) ||
    (CUSTOM_TRACK_DARIO.artistName ?? '').toLowerCase().includes(q)
  )
}

export function Search() {
  const navigate = useNavigate()
  const { playAlbum } = useQuickPlay()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [results, setResults] = useState<Results>({ tracks: [], albums: [] })

  useEffect(() => {
    if (!query.trim()) {
      setStatus('idle')
      return
    }

    // Una risposta lenta di una query vecchia non deve sovrascrivere quella nuova
    let cancelled = false
    setStatus('loading')

    const timer = setTimeout(async () => {
      try {
        const [songItems, albumItems] = await Promise.all([
          itunesSearch(query, 'song', 20),
          itunesSearch(query, 'album', 8),
        ])
        if (cancelled) return

        const tracks = normalizeList(songItems, normalizeTrack)
        if (matchesCustomTrack(query)) {
          const custom = normalizeTrack(CUSTOM_TRACK_DARIO)
          if (custom) tracks.unshift(custom)
        }

        setResults({ tracks, albums: dedupeById(normalizeList(albumItems, normalizeAlbum)) })
        setStatus('done')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  const isEmpty = status === 'done' && results.tracks.length === 0 && results.albums.length === 0

  return (
    <>
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="Cosa vuoi ascoltare?"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div>
        {status === 'loading' && (
          <div className="text-secondary mt-3">
            <div className="spinner-border spinner-border-sm text-success me-2" />
            Ricerca in corso...
          </div>
        )}

        {status === 'error' && <p className="text-secondary mt-3">Errore nella ricerca. Riprova.</p>}

        {isEmpty && (
          <div className="text-center text-secondary mt-5">
            <i className="bi bi-search" style={{ fontSize: 48 }} />
            <p className="mt-3">Nessun risultato per &quot;{query}&quot;</p>
          </div>
        )}

        {status === 'done' && results.albums.length > 0 && (
          <>
            <h2 className="section-title">Album</h2>
            <CardGrid>
              {results.albums.map((album) => (
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

        {status === 'done' && results.tracks.length > 0 && (
          <>
            <h2 className="section-title">Brani</h2>
            <TrackList tracks={results.tracks} />
          </>
        )}
      </div>

      <h2 className="section-title">Sfoglia tutto</h2>
      <div className="genre-grid">
        {GENRES.map((genre) => (
          <div
            key={genre.name}
            className="genre-card"
            style={{ background: genre.color }}
            onClick={() => navigate(`/genre/${encodeURIComponent(genre.name)}`)}
          >
            {genre.name}
          </div>
        ))}
      </div>
    </>
  )
}
