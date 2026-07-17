// ============================================
// RICERCA — campo con debounce + griglia dei generi
//
// I risultati stanno in Redux (catalog.searches), non in uno stato locale:
// tornando su una query già cercata compaiono senza nuova richiesta.
// Restano locali il testo digitato e la query "sedimentata" dal debounce:
// sono stato del campo di input, non dati dell'applicazione.
// ============================================

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardGrid } from '../components/common/Card'
import { GENRES } from '../api/staticData'
import { TrackList } from '../components/tracks/TrackList'
import { useQuickPlay } from '../hooks/useQuickPlay'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchSearch, searchKey } from '../store/slices/catalogSlice'

/** Attesa dopo l'ultimo tasto premuto, per non sovraccaricare l'API. */
const DEBOUNCE_MS = 400

export function Search() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { playAlbum } = useQuickPlay()

  const [query, setQuery] = useState('')
  /** La query solo dopo che l'utente ha smesso di digitare. */
  const [submitted, setSubmitted] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setSubmitted(query.trim()), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (submitted) dispatch(fetchSearch(submitted))
  }, [submitted, dispatch])

  const results = useAppSelector((state) => {
    if (!submitted) return undefined
    return state.catalog.searches[submitted]
  })
  const request = useAppSelector((state) => {
    if (!submitted) return undefined
    return state.catalog.requests[searchKey(submitted)]
  })

  const loading = Boolean(submitted) && !results && request?.loading !== false
  const failed = Boolean(request?.error) && !results
  const isEmpty = Boolean(results) && results!.tracks.length === 0 && results!.albums.length === 0

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
        {loading && (
          <div className="text-secondary mt-3">
            <div className="spinner-border spinner-border-sm text-success me-2" />
            Ricerca in corso...
          </div>
        )}

        {failed && <p className="text-secondary mt-3">Errore nella ricerca. Riprova.</p>}

        {isEmpty && (
          <div className="text-center text-secondary mt-5">
            <i className="bi bi-search" style={{ fontSize: 48 }} />
            <p className="mt-3">Nessun risultato per &quot;{submitted}&quot;</p>
          </div>
        )}

        {results && results.albums.length > 0 && (
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

        {results && results.tracks.length > 0 && (
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
