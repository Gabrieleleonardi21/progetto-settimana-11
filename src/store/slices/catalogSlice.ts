// ============================================
// CATALOGO — i dati che arrivano dall'API iTunes, dentro Redux
//
// Ogni risorsa remota (album, artista, genere, playlist virtuale, ricerca, home)
// ha il suo thunk asincrono: `createAsyncThunk` genera le tre action
// pending/fulfilled/rejected, raccolte qui sotto negli `extraReducers`.
//
// Nello store finiscono i dati GIÀ NORMALIZZATI (Track, Album, Podcast), non il
// formato grezzo iTunes: lo store parla il modello di dominio dell'app.
//
// I thunk chiamano `cached()` (api/cache.ts) invece dell'API diretta: quel
// livello aggiunge la persistenza a 24h su localStorage e il fallback sul dato
// scaduto quando iTunes risponde 403. Redux è la fonte per la UI, `cached` è il
// trasporto sottostante. Fa eccezione la ricerca — vedi `fetchSearch`.
// ============================================

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { cached } from '../../api/cache'
import {
  itunesGetAlbum,
  itunesGetArtist,
  itunesGetPlaylistTracks,
  itunesGetTopPodcasts,
  itunesSearch,
} from '../../api/itunes'
import {
  dedupeById,
  getVirtualPlaylistCover,
  normalizeAlbum,
  normalizeList,
  normalizePodcast,
  normalizeTrack,
} from '../../api/normalize'
import { CUSTOM_TRACK_DARIO, VIRTUAL_PLAYLISTS } from '../../api/staticData'
import type { Album, FavoriteArtist, Podcast, Track } from '../../types'
import type { RootState } from '../index'

// --- FORMA DEI DATI ---------------------------------------------------------

export interface AlbumDetail {
  /** null = l'id non corrisponde a nessun album su iTunes. */
  album: Album | null
  tracks: Track[]
}

export interface ArtistDetail {
  /** null = artista inesistente. */
  artist: FavoriteArtist | null
  albums: Album[]
}

export interface PlaylistDetail {
  cover: string
  tracks: Track[]
}

export interface SearchResults {
  tracks: Track[]
  albums: Album[]
}

export interface HomeData {
  albums: Album[]
  podcasts: Podcast[]
  /** Una cover per ogni elemento di VIRTUAL_PLAYLISTS, nello stesso ordine. */
  playlistCovers: string[]
}

/** Stato di una singola richiesta, indicizzato per chiave. */
interface RequestState {
  loading: boolean
  error: string | null
}

interface CatalogState {
  albums: Record<string, AlbumDetail>
  artists: Record<string, ArtistDetail>
  genres: Record<string, Track[]>
  playlists: Record<string, PlaylistDetail>
  searches: Record<string, SearchResults>
  home: HomeData | null
  requests: Record<string, RequestState>
}

const initialState: CatalogState = {
  albums: {},
  artists: {},
  genres: {},
  playlists: {},
  searches: {},
  home: null,
  requests: {},
}

// --- CHIAVI DELLE RICHIESTE -------------------------------------------------
// Identificano una richiesta in `requests`. Le stesse funzioni le usa
// useCatalogQuery per leggere loading/error della risorsa che sta mostrando.

export const albumKey = (albumId: string) => `album_${albumId}`
export const artistKey = (artistId: string) => `artist_${artistId}`
export const genreKey = (term: string) => `genre_${term}`
export const playlistKey = (playlistId: string) => `playlist_${playlistId}`
export const searchKey = (query: string) => `search_${query}`
export const HOME_KEY = 'home'

// --- THUNK ------------------------------------------------------------------

/** Salta la richiesta se il dato è già nello store o se una identica è in volo. */
function shouldFetch(state: RootState, key: string, hasData: boolean): boolean {
  if (hasData) return false
  return !state.catalog.requests[key]?.loading
}

export const fetchAlbum = createAsyncThunk(
  'catalog/fetchAlbum',
  async (albumId: string): Promise<AlbumDetail> => {
    const { album, tracks } = await cached(albumKey(albumId), () => itunesGetAlbum(albumId))
    return {
      album: normalizeAlbum(album),
      tracks: normalizeList(tracks, normalizeTrack),
    }
  },
  {
    condition: (albumId, { getState }) => {
      const state = getState() as RootState
      return shouldFetch(state, albumKey(albumId), Boolean(state.catalog.albums[albumId]))
    },
  },
)

export const fetchArtist = createAsyncThunk(
  'catalog/fetchArtist',
  async (artistId: string): Promise<ArtistDetail> => {
    const { artist, albums } = await cached(artistKey(artistId), () => itunesGetArtist(artistId))

    let normalizedArtist: FavoriteArtist | null = null
    if (artist) {
      normalizedArtist = {
        artistId: String(artist.artistId ?? ''),
        artistName: artist.artistName ?? '',
        genre: artist.primaryGenreName ?? '',
      }
    }

    return { artist: normalizedArtist, albums: normalizeList(albums, normalizeAlbum) }
  },
  {
    condition: (artistId, { getState }) => {
      const state = getState() as RootState
      return shouldFetch(state, artistKey(artistId), Boolean(state.catalog.artists[artistId]))
    },
  },
)

export const fetchGenre = createAsyncThunk(
  'catalog/fetchGenre',
  async (term: string): Promise<Track[]> => {
    const items = await cached(genreKey(term), () => itunesSearch(term, 'song', 30))
    return normalizeList(items, normalizeTrack)
  },
  {
    condition: (term, { getState }) => {
      const state = getState() as RootState
      return shouldFetch(state, genreKey(term), Boolean(state.catalog.genres[term]))
    },
  },
)

export const fetchPlaylist = createAsyncThunk(
  'catalog/fetchPlaylist',
  async (playlistId: string): Promise<PlaylistDetail> => {
    const vp = VIRTUAL_PLAYLISTS.find((p) => p.id === playlistId)
    if (!vp) throw new Error('Playlist non trovata')

    // Cover e brani sono richieste indipendenti: partono insieme
    const [cover, rawTracks] = await Promise.all([
      getVirtualPlaylistCover(vp),
      cached(playlistKey(playlistId), () => itunesGetPlaylistTracks(playlistId)),
    ])

    return { cover, tracks: normalizeList(rawTracks, normalizeTrack) }
  },
  {
    condition: (playlistId, { getState }) => {
      const state = getState() as RootState
      return shouldFetch(state, playlistKey(playlistId), Boolean(state.catalog.playlists[playlistId]))
    },
  },
)

/**
 * La ricerca non passa da `cached()`: ogni query digitata creerebbe una voce su
 * localStorage, riempiendolo di risultati usa e getta. Qui la cache è lo store,
 * che vive quanto la sessione.
 */
export const fetchSearch = createAsyncThunk(
  'catalog/fetchSearch',
  async (query: string): Promise<SearchResults> => {
    const [songItems, albumItems] = await Promise.all([
      itunesSearch(query, 'song', 20),
      itunesSearch(query, 'album', 8),
    ])

    const tracks = normalizeList(songItems, normalizeTrack)

    // Il brano locale non esiste su iTunes: si confronta con la query a mano
    const q = query.trim().toLowerCase()
    const matchesCustom =
      (CUSTOM_TRACK_DARIO.trackName ?? '').toLowerCase().includes(q) ||
      (CUSTOM_TRACK_DARIO.artistName ?? '').toLowerCase().includes(q)

    if (matchesCustom) {
      const custom = normalizeTrack(CUSTOM_TRACK_DARIO)
      if (custom) tracks.unshift(custom)
    }

    return { tracks, albums: dedupeById(normalizeList(albumItems, normalizeAlbum)) }
  },
  {
    condition: (query, { getState }) => {
      const state = getState() as RootState
      return shouldFetch(state, searchKey(query), Boolean(state.catalog.searches[query]))
    },
  },
)

export const fetchHome = createAsyncThunk(
  'catalog/fetchHome',
  async (): Promise<HomeData> => {
    // Le tre richieste sono indipendenti: partono insieme
    const [rawAlbums, playlistCovers, rawPodcasts] = await Promise.all([
      cached('top_albums', () => itunesSearch('top hits', 'album', 8)),
      Promise.all(VIRTUAL_PLAYLISTS.map((p) => getVirtualPlaylistCover(p))),
      cached('top_podcasts', () => itunesGetTopPodcasts(8)),
    ])

    return {
      albums: dedupeById(normalizeList(rawAlbums, normalizeAlbum)),
      podcasts: normalizeList(rawPodcasts, normalizePodcast),
      playlistCovers,
    }
  },
  {
    condition: (_arg, { getState }) => {
      const state = getState() as RootState
      return shouldFetch(state, HOME_KEY, state.catalog.home !== null)
    },
  },
)

// --- SLICE ------------------------------------------------------------------

function start(state: CatalogState, key: string) {
  state.requests[key] = { loading: true, error: null }
}

function done(state: CatalogState, key: string) {
  state.requests[key] = { loading: false, error: null }
}

function fail(state: CatalogState, key: string, message: string | undefined) {
  state.requests[key] = { loading: false, error: message ?? 'Errore nel caricamento' }
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- ALBUM ---
      .addCase(fetchAlbum.pending, (state, action) => start(state, albumKey(action.meta.arg)))
      .addCase(fetchAlbum.fulfilled, (state, action) => {
        done(state, albumKey(action.meta.arg))
        state.albums[action.meta.arg] = action.payload
      })
      .addCase(fetchAlbum.rejected, (state, action) =>
        fail(state, albumKey(action.meta.arg), action.error.message),
      )

      // --- ARTISTA ---
      .addCase(fetchArtist.pending, (state, action) => start(state, artistKey(action.meta.arg)))
      .addCase(fetchArtist.fulfilled, (state, action) => {
        done(state, artistKey(action.meta.arg))
        state.artists[action.meta.arg] = action.payload
      })
      .addCase(fetchArtist.rejected, (state, action) =>
        fail(state, artistKey(action.meta.arg), action.error.message),
      )

      // --- GENERE ---
      .addCase(fetchGenre.pending, (state, action) => start(state, genreKey(action.meta.arg)))
      .addCase(fetchGenre.fulfilled, (state, action) => {
        done(state, genreKey(action.meta.arg))
        state.genres[action.meta.arg] = action.payload
      })
      .addCase(fetchGenre.rejected, (state, action) =>
        fail(state, genreKey(action.meta.arg), action.error.message),
      )

      // --- PLAYLIST VIRTUALE ---
      .addCase(fetchPlaylist.pending, (state, action) => start(state, playlistKey(action.meta.arg)))
      .addCase(fetchPlaylist.fulfilled, (state, action) => {
        done(state, playlistKey(action.meta.arg))
        state.playlists[action.meta.arg] = action.payload
      })
      .addCase(fetchPlaylist.rejected, (state, action) =>
        fail(state, playlistKey(action.meta.arg), action.error.message),
      )

      // --- RICERCA ---
      .addCase(fetchSearch.pending, (state, action) => start(state, searchKey(action.meta.arg)))
      .addCase(fetchSearch.fulfilled, (state, action) => {
        done(state, searchKey(action.meta.arg))
        state.searches[action.meta.arg] = action.payload
      })
      .addCase(fetchSearch.rejected, (state, action) =>
        fail(state, searchKey(action.meta.arg), action.error.message),
      )

      // --- HOME ---
      .addCase(fetchHome.pending, (state) => start(state, HOME_KEY))
      .addCase(fetchHome.fulfilled, (state, action) => {
        done(state, HOME_KEY)
        state.home = action.payload
      })
      .addCase(fetchHome.rejected, (state, action) => fail(state, HOME_KEY, action.error.message))
  },
})

export default catalogSlice.reducer
