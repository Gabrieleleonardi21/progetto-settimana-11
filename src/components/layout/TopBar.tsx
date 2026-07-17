// Barra superiore: navigazione avanti/indietro, tema, sleep timer, menu utente.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { ThemeModal } from '../modals/ThemeModal'
import { SleepTimer } from './SleepTimer'

/** Foto del profilo, o l'icona generica se non è stata caricata. */
function UserAvatar({ photo, displayName }: { photo: string | null; displayName: string }) {
  if (photo) return <img className="user-avatar-img" src={photo} alt={displayName} />
  return <i className="bi bi-person-circle" />
}

export function TopBar() {
  const navigate = useNavigate()
  const { displayName, profilePhoto } = useAppSelector((state) => state.profile)
  const [themeOpen, setThemeOpen] = useState(false)

  return (
    <header className="top-bar">
      <div className="nav-buttons">
        <button className="nav-btn" title="Indietro" onClick={() => navigate(-1)}>
          <i className="bi bi-chevron-left" />
        </button>
        <button className="nav-btn" title="Avanti" onClick={() => navigate(1)}>
          <i className="bi bi-chevron-right" />
        </button>
        <button className="nav-btn" title="Personalizza il tema" onClick={() => setThemeOpen(true)}>
          <i className="bi bi-palette-fill" />
        </button>
        <SleepTimer />
      </div>

      <div className="user-menu">
        <button className="user-btn" onClick={() => navigate('/profile')}>
          <UserAvatar photo={profilePhoto} displayName={displayName} />
          <span>{displayName}</span>
          <i className="bi bi-caret-down-fill small" />
        </button>
      </div>

      {themeOpen && <ThemeModal onClose={() => setThemeOpen(false)} />}
    </header>
  )
}
