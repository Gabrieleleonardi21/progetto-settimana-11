// ============================================
// LETTURA DI UNA RISORSA DEL CATALOGO
//
// I dati remoti non stanno in uno stato locale ma in Redux
// (store/slices/catalogSlice.ts). Il thunk parte al mount e a ogni cambio di
// `key`; se il dato è già nello store il thunk si ferma da solo (`condition`)
// e la pagina lo mostra senza nessuna richiesta.
//
// Espone { data, loading, error, retry }: è la forma che <AsyncContent> si aspetta.
// ============================================

import { useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { RootState } from '../store'

export interface CatalogQueryResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  /** Riesegue il thunk: usato dal bottone "Riprova". */
  retry: () => void
}

interface Options<T> {
  /** Identifica la richiesta in `catalog.requests` (vedi le funzioni *Key dello slice). */
  key: string
  /** Il thunk già applicato al suo argomento, es. `() => fetchAlbum(albumId)`. */
  run: () => unknown
  /** Estrae il dato dallo store. `undefined` = non ancora caricato. */
  select: (state: RootState) => T | undefined
}

export function useCatalogQuery<T>({ key, run, select }: Options<T>): CatalogQueryResult<T> {
  const dispatch = useAppDispatch()
  const data = useAppSelector(select)
  const request = useAppSelector((state) => state.catalog.requests[key])

  // `run` è una funzione inline: cambierebbe identità a ogni render e ri-lancerebbe
  // l'effetto. La ref la tiene aggiornata senza entrare tra le dipendenze.
  const runRef = useRef(run)
  runRef.current = run

  useEffect(() => {
    dispatch(runRef.current() as Parameters<typeof dispatch>[0])
  }, [dispatch, key])

  const retry = useCallback(() => {
    dispatch(runRef.current() as Parameters<typeof dispatch>[0])
  }, [dispatch])

  // Il dato c'è: nessun caricamento, qualunque cosa dica la richiesta.
  // Se manca e non risulta ancora nessuna richiesta, l'effetto sta per partire:
  // meglio lo spinner di un lampo di "errore" al primo render.
  let loading = true
  if (data !== undefined) loading = false
  else if (request) loading = request.loading

  let error: Error | null = null
  if (data === undefined && request?.error) error = new Error(request.error)

  return { data: data ?? null, loading, error, retry }
}
