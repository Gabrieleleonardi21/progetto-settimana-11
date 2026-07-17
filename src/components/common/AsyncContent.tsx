// ============================================
// SPINNER / ERRORE / CONTENUTO
//
// Sostituisce la coppia showLoading() + showRenderError() del vanilla.
// Il render prop riceve i dati già garantiti non-null, così le pagine non
// devono controllare `data && ...` a ogni uso.
// ============================================

import type { ReactNode } from 'react'
import type { AsyncResult } from '../../hooks/useAsync'

export function Loading() {
  return (
    <div className="text-center mt-5 text-secondary">
      <div className="spinner-border text-success" role="status" />
      <p className="mt-3">Caricamento...</p>
    </div>
  )
}

interface ErrorBoxProps {
  onRetry: () => void
}

export function ErrorBox({ onRetry }: ErrorBoxProps) {
  return (
    <div className="text-center mt-5 text-secondary">
      <i className="bi bi-exclamation-circle" style={{ fontSize: 48 }} />
      <p className="mt-3">Errore nel caricamento. Controlla la connessione e riprova.</p>
      <button className="btn btn-spotify mt-3" onClick={onRetry}>
        Riprova
      </button>
    </div>
  )
}

interface AsyncContentProps<T> {
  state: AsyncResult<T>
  children: (data: T) => ReactNode
}

export function AsyncContent<T>({ state, children }: AsyncContentProps<T>) {
  if (state.loading) return <Loading />
  if (state.error || state.data === null) return <ErrorBox onRetry={state.retry} />
  return <>{children(state.data)}</>
}
