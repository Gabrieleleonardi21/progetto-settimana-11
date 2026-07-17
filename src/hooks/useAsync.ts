// ============================================
// CARICAMENTO DATI ASINCRONO
//
// Sostituisce lo schema showLoading → render → showRenderError del vanilla.
// I dati remoti non stanno in Redux: sono cache di server, gestita da api/cache.ts.
// ============================================

import { useCallback, useEffect, useRef, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export interface AsyncResult<T> extends AsyncState<T> {
  /** Riesegue la richiesta: usato dal bottone "Riprova". */
  retry: () => void
}

/**
 * Esegue `fn` al mount e a ogni cambio di `deps`.
 *
 * @param fn  deve essere stabile o dipendere solo da `deps` (racchiudilo in useCallback)
 * @param deps chiavi che identificano la richiesta (es. `[albumId]`)
 */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[]): AsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })
  const [attempt, setAttempt] = useState(0)

  // Tiene `fn` aggiornata senza inserirla tra le dipendenze dell'effetto:
  // una funzione inline cambierebbe identità a ogni render, ri-lanciando il fetch.
  const fnRef = useRef(fn)
  fnRef.current = fn

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    // Se le deps cambiano mentre una richiesta è in volo, la risposta vecchia
    // arriverebbe dopo la nuova e sovrascriverebbe i dati corretti.
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    fnRef.current().then(
      (data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      },
      (error: unknown) => {
        if (cancelled) return
        // Una Promise può essere rifiutata con qualsiasi valore, non solo con un Error
        let asError = new Error(String(error))
        if (error instanceof Error) asError = error
        setState({ data: null, loading: false, error: asError })
      },
    )

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  return { ...state, retry }
}
