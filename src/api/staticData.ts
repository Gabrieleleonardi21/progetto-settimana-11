// ============================================
// DATI STATICI — playlist virtuali, generi, brano locale
// ============================================

import type { Genre, ItunesResult, VirtualPlaylist } from '../types'
// WebP: le due immagini locali sono ridotte a 700px di lato lungo (il massimo
// con cui vengono mostrate, 232px @2x) — da 2,3 MB + 167 KB a 84 KB + 59 KB.
// santino ha trasparenza reale, quindi niente JPEG.
import darioAudio from '../assets/audio/the-dark-side-of-dario.mp3'
import santinoCover from '../assets/img/santino.webp'
import playlistCover from '../assets/img/ppp.webp'

/** Cover di default delle playlist create dall'utente e della card "Recenti". */
export const USER_PLAYLIST_COVER = playlistCover

/** Playlist "finte": il contenuto viene cercato su iTunes al momento del click. */
export const VIRTUAL_PLAYLISTS: VirtualPlaylist[] = [
  { id: 'vp_top_it',   title: 'Top Italia',   description: 'I brani più ascoltati in Italia', term: 'pop italiana',       color1: '#ff6b35', color2: '#c9184a' },
  { id: 'vp_chill',    title: 'Chill Vibes',  description: 'Relax e buon umore',              term: 'chill lofi',         color1: '#00b4d8', color2: '#0077b6' },
  { id: 'vp_workout',  title: 'Workout Mix',  description: 'Energia pura per allenarti',      term: 'workout motivation', color1: '#f72585', color2: '#7209b7' },
  { id: 'vp_focus',    title: 'Focus Mode',   description: 'Concentrazione e produttività',   term: 'focus study',        color1: '#06ffa5', color2: '#0d3b66' },
  { id: 'vp_party',    title: 'Party Time',   description: 'Le hit per la tua festa',         term: 'party dance',        color1: '#ffba08', color2: '#dc2f02' },
  { id: 'vp_acoustic', title: 'Acustico',     description: 'Il meglio della musica acustica', term: 'acoustic guitar',    color1: '#5a189a', color2: '#10002b' },
  { id: 'vp_indie',    title: 'Indie Vibes',  description: 'Indie e alternative del momento', term: 'indie alternative',  color1: '#e63946', color2: '#1d3557' },
  { id: 'vp_rnb',      title: 'R&B Soul',     description: 'Soul, R&B e groove',              term: 'rnb soul',           color1: '#6a4c93', color2: '#1982c4' },
]

/**
 * Brano locale, non proveniente da iTunes: viene iniettato in testa alla
 * playlist "Top Italia" ed è ricercabile per titolo/artista.
 *
 * Usa lo stesso formato grezzo di un risultato iTunes, così `normalizeTrack()`
 * lo elabora come un brano qualsiasi. `trackId` e `artistId` sono stringhe
 * finte: non collidono mai con un id iTunes reale e restano riconoscibili.
 */
export const CUSTOM_TRACK_DARIO: ItunesResult = {
  wrapperType: 'track',
  trackId: 'custom-dario-1',
  trackName: 'The Dark Side of Dario',
  artistName: 'Dario Del Giudice',
  artistId: 'custom-dario-artist',
  collectionName: 'The Dark Side of Dario',
  trackTimeMillis: 204000,
  artworkUrl100: santinoCover,
  previewUrl: darioAudio,
  trackViewUrl: null,
}

/** Cover fissa della playlist "Top Italia" (contiene il brano locale). */
export const TOP_ITALIA_COVER = santinoCover

export const GENRES: Genre[] = [
  { name: 'Pop',         term: 'pop',        color: 'linear-gradient(135deg, #ff6b35, #c9184a)' },
  { name: 'Rock',        term: 'rock',       color: 'linear-gradient(135deg, #d62828, #003049)' },
  { name: 'Hip Hop',     term: 'hip hop',    color: 'linear-gradient(135deg, #ffb703, #fb8500)' },
  { name: 'Elettronica', term: 'electronic', color: 'linear-gradient(135deg, #00b4d8, #023e8a)' },
  { name: 'Jazz',        term: 'jazz',       color: 'linear-gradient(135deg, #7209b7, #3a0ca3)' },
  { name: 'Classica',    term: 'classical',  color: 'linear-gradient(135deg, #2d6a4f, #1b4332)' },
  { name: 'Indie',       term: 'indie',      color: 'linear-gradient(135deg, #f72585, #7209b7)' },
  { name: 'Latina',      term: 'latin',      color: 'linear-gradient(135deg, #ffba08, #d00000)' },
  { name: 'Reggae',      term: 'reggae',     color: 'linear-gradient(135deg, #2a9d8f, #264653)' },
  { name: 'R&B',         term: 'rnb soul',   color: 'linear-gradient(135deg, #6a4c93, #1982c4)' },
  { name: 'Country',     term: 'country',    color: 'linear-gradient(135deg, #bc6c25, #606c38)' },
  { name: 'Metal',       term: 'metal',      color: 'linear-gradient(135deg, #495057, #212529)' },
]
