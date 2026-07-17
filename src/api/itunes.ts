// ============================================
// ITUNES SEARCH API
// https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
//
// L'API invia gli header CORS, quindi si usa fetch (niente JSONP).
// ============================================

import type { ItunesAlbumResponse, ItunesArtistResponse, ItunesResult } from '../types'
import { CUSTOM_TRACK_DARIO, VIRTUAL_PLAYLISTS } from './staticData'

const ITUNES_API = 'https://itunes.apple.com'
const TIMEOUT_MS = 10000

/** Entità richiedibili all'endpoint /search. */
type Entity = 'song' | 'album' | 'podcast'

/** GET con timeout via AbortController. Restituisce sempre `results`. */
async function request(url: string, params: URLSearchParams): Promise<ItunesResult[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${url}?${params}`, { signal: controller.signal })
    if (!res.ok) throw new Error('Rete non raggiungibile')
    const data = (await res.json()) as { results?: ItunesResult[] }
    return data.results ?? []
  } finally {
    clearTimeout(timer)
  }
}

export function itunesSearch(term: string, entity: Entity = 'song', limit = 20) {
  const params = new URLSearchParams({ term, media: 'music', entity, limit: String(limit), country: 'it' })
  return request(`${ITUNES_API}/search`, params)
}

/** Album con tutte le sue tracce. */
export async function itunesGetAlbum(albumId: string): Promise<ItunesAlbumResponse> {
  const params = new URLSearchParams({ id: albumId, entity: 'song', country: 'it' })
  const results = await request(`${ITUNES_API}/lookup`, params)
  return {
    album: results.find((r) => r.wrapperType === 'collection') ?? results[0],
    tracks: results.filter((r) => r.wrapperType === 'track' && r.trackId),
  }
}

/** Artista con i suoi album. */
export async function itunesGetArtist(artistId: string): Promise<ItunesArtistResponse> {
  const params = new URLSearchParams({ id: artistId, entity: 'album', limit: '6', country: 'it' })
  const results = await request(`${ITUNES_API}/lookup`, params)
  return {
    artist: results.find((r) => r.wrapperType === 'artist'),
    albums: results.filter((r) => r.wrapperType === 'collection' && r.collectionId),
  }
}

/** Brani di una playlist virtuale: cercati al volo per `term`. */
export async function itunesGetPlaylistTracks(playlistId: string): Promise<ItunesResult[]> {
  const vp = VIRTUAL_PLAYLISTS.find((p) => p.id === playlistId)
  if (!vp) return []

  const items = await itunesSearch(vp.term, 'song', 25)
  const tracks = items.filter((i) => i.wrapperType === 'track' && i.trackId)

  // Il brano locale vive solo qui: iTunes non lo conosce
  if (playlistId === 'vp_top_it') tracks.unshift(CUSTOM_TRACK_DARIO)
  return tracks
}

export async function itunesGetTopPodcasts(limit = 8): Promise<ItunesResult[]> {
  const podcasts = await itunesSearch('podcast', 'podcast', limit)
  return podcasts.filter((p) => p.wrapperType === 'track' || p.collectionId)
}
