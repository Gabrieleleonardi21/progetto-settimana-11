// ============================================
// ACCESSO A localStorage
// Un solo punto di ingresso, così le chiavi non finiscono sparse nel codice
// e ogni lettura è protetta da JSON corrotti / storage non disponibile.
// ============================================

/** Tutte le chiavi usate dall'app. Mantiene la compatibilità col progetto vanilla. */
export const KEYS = {
  sessionActive: 'session_active',
  displayName: 'display_name',
  profilePhoto: 'profile_photo',
  profileBio: 'profile_bio',
  profileLocation: 'profile_location',
  profileJoinDate: 'profile_join_date',
  likedTracks: 'liked_tracks',
  favoriteArtists: 'favorite_artists',
  userPlaylists: 'user_playlists',
  recentTracks: 'recent_tracks',
  currentTrack: 'current_track',
  playerVolume: 'player_volume',
  wrappedStats: 'wrapped_stats',
  colorTheme: 'color_theme',
  /** Copia risolta delle variabili CSS, letta dallo script inline in index.html. */
  colorThemeVars: 'color_theme_vars',
  justLoggedIn: 'just_logged_in',
} as const

/** Legge e deserializza una chiave. Torna `fallback` se assente o corrotta. */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Serializza e salva. Ignora l'errore di quota piena: il dato resta in memoria. */
export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // QuotaExceededError o storage disabilitato: lo stato Redux resta valido
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** `value === null` rimuove la chiave. Lancia se la quota è piena (vedi foto profilo). */
export function writeString(key: string, value: string | null): void {
  if (value === null) {
    localStorage.removeItem(key)
    return
  }
  localStorage.setItem(key, value)
}
