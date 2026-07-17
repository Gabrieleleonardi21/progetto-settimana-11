// ============================================
// CACHE A 3 LIVELLI PER LE RISPOSTE API
//
//   1. memoria          → istantaneo, dura la sessione
//   2. localStorage     → entro la TTL evita del tutto la chiamata
//   3. chiamata API     → se fallisce, ripiega sul dato salvato (anche scaduto)
//
// Serve sia a non ripetere chiamate identiche, sia come fallback offline
// quando iTunes è irraggiungibile o limita le richieste (HTTP 403).
// ============================================

const PREFIX = 'apicache_'
const TTL = 1000 * 60 * 60 * 24 // 24h: il catalogo musicale cambia di rado

interface CacheEntry<T> {
  /** Timestamp di scrittura (ms). */
  t: number
  v: T
}

const memory = new Map<string, unknown>()

/**
 * Richieste già partite ma non ancora risolte.
 * Senza questo, due componenti che chiedono la stessa chiave nello stesso
 * momento (o il doppio effect di StrictMode) farebbero due fetch identici.
 */
const inFlight = new Map<string, Promise<unknown>>()

function readStored<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry<T>
  } catch {
    return null
  }
}

function writeStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v: value }))
  } catch {
    // quota piena o storage non disponibile: resta comunque la cache in memoria
  }
}

/**
 * Esegue `fn` solo se il valore non è già in cache.
 * @param key chiave stabile che identifica la richiesta (es. `album_1234`)
 */
export async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  // 1) memoria
  if (memory.has(key)) return memory.get(key) as T

  // 2) localStorage ancora valido
  const stored = readStored<T>(key)
  if (stored && Date.now() - stored.t < TTL) {
    memory.set(key, stored.v)
    return stored.v
  }

  // Una richiesta identica è già in corso: ci si aggancia a quella
  const pending = inFlight.get(key)
  if (pending) return pending as Promise<T>

  // 3) chiamata reale; in caso di errore ripiega sul dato scaduto se esiste
  const promise = fn()
    .then((value) => {
      memory.set(key, value)
      writeStored(key, value)
      return value
    })
    .catch((error: unknown) => {
      if (stored) {
        memory.set(key, stored.v)
        return stored.v
      }
      throw error // nessun fallback disponibile
    })
    .finally(() => inFlight.delete(key))

  inFlight.set(key, promise)
  return promise
}
