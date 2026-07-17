// ============================================
// FORMATTAZIONE E COPERTINE DI FALLBACK
// ============================================

/** Secondi → "m:ss". */
export function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/** Neutralizza i caratteri che chiuderebbero un tag/attributo dentro l'SVG. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Genera una copertina SVG con gradiente, usata quando manca l'artwork reale.
 * Restituisce un data URI pronto per l'attributo `src` di un <img>.
 */
export function createCover(text: string, color1: string, color2: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${escapeXml(color1)}"/>
          <stop offset="100%" stop-color="${escapeXml(color2)}"/>
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#g)"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
            fill="white" font-family="Montserrat, sans-serif" font-weight="900"
            font-size="40">${escapeXml(text)}</text>
    </svg>`

  // encodeURIComponent invece di btoa: gestisce nativamente gli emoji
  // (btoa lancia su caratteri fuori da Latin-1) e non serve base64.
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** Saluto in base all'ora del giorno, come nella home originale. */
export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour < 12) return 'Buongiorno'
  if (hour < 18) return 'Buon pomeriggio'
  return 'Buonasera'
}
