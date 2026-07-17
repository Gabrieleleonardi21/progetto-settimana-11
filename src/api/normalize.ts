// ============================================
// NORMALIZZATORI — formato grezzo iTunes → formato interno dell'app
// ============================================

import type { Album, ItunesResult, Podcast, Track, VirtualPlaylist } from '../types'
import { createCover } from '../utils/format'
import { cached } from './cache'
import { itunesSearch } from './itunes'
import { TOP_ITALIA_COVER } from './staticData'

/**
 * iTunes serve artwork 100x100: l'URL contiene letteralmente "100x100bb",
 * sostituirlo con "600x600bb" restituisce la versione ad alta risoluzione.
 * I brani locali hanno già un artwork proprio, che passa inalterato.
 */
function upscaleArtwork(url: string | undefined, fallback: string): string {
  if (!url) return fallback
  return url.replace('100x100bb', '600x600bb')
}

export function normalizeTrack(item: ItunesResult | null | undefined): Track | null {
  if (!item?.trackId) return null
  return {
    id: String(item.trackId),
    title: item.trackName ?? '',
    artist: item.artistName ?? '',
    artistId: String(item.artistId ?? ''),
    album: item.collectionName ?? '',
    albumId: String(item.collectionId ?? ''),
    duration: Math.round((item.trackTimeMillis ?? 0) / 1000),
    cover: upscaleArtwork(item.artworkUrl100, createCover('?', '#555', '#333')),
    previewUrl: item.previewUrl ?? null,
    trackViewUrl: item.trackViewUrl ?? null,
  }
}

export function normalizeAlbum(item: ItunesResult | null | undefined): Album | null {
  if (!item?.collectionId) return null
  return {
    id: String(item.collectionId),
    title: item.collectionName ?? '',
    artist: item.artistName ?? '',
    cover: upscaleArtwork(item.artworkUrl100, createCover('?', '#555', '#333')),
    trackCount: item.trackCount ?? 0,
  }
}

export function normalizePodcast(item: ItunesResult | null | undefined): Podcast | null {
  if (!item) return null
  return {
    id: String(item.collectionId ?? item.trackId),
    title: item.collectionName ?? item.trackName ?? '',
    author: item.artistName ?? '',
    cover: upscaleArtwork(item.artworkUrl100, createCover('🎙️', '#1db954', '#191414')),
    url: item.collectionViewUrl ?? item.trackViewUrl ?? '#',
  }
}

/** Mappa una lista grezza scartando gli elementi non normalizzabili. */
export function normalizeList<T>(
  items: ItunesResult[],
  normalize: (item: ItunesResult) => T | null,
): T[] {
  return items.map(normalize).filter((x): x is T => x !== null)
}

/** Rimuove i duplicati per `id` mantenendo il primo incontrato. */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()]
}

/**
 * Cover di una playlist virtuale: l'artwork del primo risultato iTunes per il
 * suo termine di ricerca. In mancanza, una copertina SVG generata dai suoi colori.
 */
export function getVirtualPlaylistCover(p: VirtualPlaylist): Promise<string> {
  if (p.id === 'vp_top_it') return Promise.resolve(TOP_ITALIA_COVER)

  return cached(`cover_${p.id}`, async () => {
    const [item] = await itunesSearch(p.term, 'song', 1)
    if (!item?.artworkUrl100) {
      return createCover(p.title.substring(0, 2).toUpperCase(), p.color1, p.color2)
    }
    return upscaleArtwork(item.artworkUrl100, '')
  })
}
