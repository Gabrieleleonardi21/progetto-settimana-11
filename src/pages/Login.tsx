// ============================================
// LOGIN — simulato: nessuna password viene verificata
// ============================================

import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { login } from '../store/slices/authSlice'
import { KEYS, readString } from '../utils/storage'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FAKE_REQUEST_MS = 800

function SubmitLabel({ submitting }: { submitting: boolean }) {
  if (!submitting) return <>ACCEDI</>
  return (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" />
      Accesso in corso...
    </>
  )
}

export function Login() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  // Pre-compila l'ultimo nome usato: il profilo sopravvive al logout
  const [user, setUser] = useState(() => readString(KEYS.displayName) ?? '')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Sessione già attiva: l'utente non deve vedere il form
  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const value = user.trim()

    // Se contiene @ dev'essere un'email valida; altrimenti basta non sia vuoto
    const isEmail = value.includes('@')
    if (!value || (isEmail && !EMAIL_REGEX.test(value))) {
      setError(true)
      return
    }
    setError(false)
    setSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, FAKE_REQUEST_MS))

    // Da "mario@posta.it" il nome mostrato diventa "mario"
    let displayName = value
    if (isEmail) displayName = value.split('@')[0]

    // Letto dal componente Confetti sulla home
    sessionStorage.setItem(KEYS.justLoggedIn, '1')
    dispatch(login(displayName))
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="text-center mb-4">
          <i className="bi bi-spotify spotify-logo" />
          <h1 className="login-title">Spotify</h1>
        </div>
        <h2 className="text-center text-white mb-4">Accedi a Spotify</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-white">Email o nome utente</label>
            <input
              type="text"
              className="form-control login-input"
              placeholder="Email o nome utente"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            {error && (
              <div className="text-danger small mt-1">Inserisci un&apos;email o un nome utente valido.</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label text-white">Password</label>
            <input type="password" className="form-control login-input" placeholder="Password" />
          </div>

          <button type="submit" className="btn btn-spotify w-100 mb-3" disabled={submitting}>
            <SubmitLabel submitting={submitting} />
          </button>

          <hr className="text-secondary" />
          <div className="text-center text-white-50">
            Non hai un account? <a href="#" className="text-white">Iscriviti a Spotify</a>
          </div>
        </form>

        <div className="store-badges">
          <p className="text-white-50 small mb-2">Scarica l&apos;app</p>
          <a href="#" className="store-badge" title="Scarica su App Store">
            <i className="bi bi-apple" />
            <span>
              <small>Disponibile su</small>
              App Store
            </span>
          </a>
          <a href="#" className="store-badge" title="Scarica su Google Play">
            <i className="bi bi-google-play" />
            <span>
              <small>Disponibile su</small>
              Google Play
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
