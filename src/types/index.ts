// ============================================
// MODELLO DATI DELL'APP
// I tipi "Itunes*" descrivono il formato grezzo restituito dall'API;
// gli altri sono il formato interno prodotto dai normalizzatori (api/normalize.ts).
// ============================================

/** Brano nel formato interno dell'app. */
export interface Track {
  id: string
  title: string
  artist: string
  artistId: string
  album: string
  albumId: string
  /** Durata in secondi. */
  duration: number
  cover: string
  /** null = anteprima non disponibile, il brano non è riproducibile. */
  previewUrl: string | null
  trackViewUrl: string | null
}

export interface Album {
  id: string
  title: string
  artist: string
  cover: string
  trackCount: number
}

export interface Podcast {
  id: string
  title: string
  author: string
  cover: string
  url: string
}

/** Artista seguito dall'utente (salvato in localStorage). */
export interface FavoriteArtist {
  artistId: string
  artistName: string
  genre: string
}

/** Playlist creata dall'utente (salvata in localStorage). */
export interface UserPlaylist {
  id: string
  name: string
  tracks: Track[]
}

/** Playlist "finta": non esiste su iTunes, i brani si cercano al volo per `term`. */
export interface VirtualPlaylist {
  id: string
  title: string
  description: string
  term: string
  color1: string
  color2: string
}

export interface Genre {
  name: string
  term: string
  /** Valore CSS completo (gradiente), usato come background della card. */
  color: string
}

/** Palette colori: ogni tema ridefinisce le variabili CSS di :root. */
export interface Theme {
  id: string
  name: string
  vars: Record<string, string>
}

// ============================================
// FORMATO GREZZO ITUNES
// I campi sono tutti opzionali: l'API restituisce insiemi diversi
// a seconda del wrapperType (track / collection / artist).
// ============================================

export interface ItunesResult {
  wrapperType?: 'track' | 'collection' | 'artist'
  trackId?: number | string
  trackName?: string
  artistId?: number | string
  artistName?: string
  collectionId?: number | string
  collectionName?: string
  trackTimeMillis?: number
  trackCount?: number
  artworkUrl100?: string
  previewUrl?: string | null
  trackViewUrl?: string | null
  collectionViewUrl?: string
  primaryGenreName?: string
}

/** Risultato di itunesGetAlbum: la collection più le sue tracce. */
export interface ItunesAlbumResponse {
  album: ItunesResult | undefined
  tracks: ItunesResult[]
}

/** Risultato di itunesGetArtist: l'artista più i suoi album. */
export interface ItunesArtistResponse {
  artist: ItunesResult | undefined
  albums: ItunesResult[]
}
