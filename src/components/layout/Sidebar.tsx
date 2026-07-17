// ============================================
// SIDEBAR — navigazione principale e playlist dell'utente
// A ≤480px diventa una barra in alto con menu hamburger a tendina.
// ============================================

import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { CreatePlaylistModal } from '../modals/CreatePlaylistModal'

/** NavLink applica `.active` da solo in base alla rotta corrente. */
function navClass({ isActive }: { isActive: boolean }): string {
  if (isActive) return 'nav-link active'
  return 'nav-link'
}

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const userPlaylists = useAppSelector((state) => state.library.userPlaylists)

  const [menuOpen, setMenuOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  // Cambiando pagina il menu mobile deve richiudersi
  useEffect(() => setMenuOpen(false), [location.pathname])

  let sidebarClass = 'sidebar'
  let toggleIcon = 'bi bi-list'
  if (menuOpen) {
    sidebarClass = 'sidebar open'
    toggleIcon = 'bi bi-x-lg'
  }

  return (
    <aside className={sidebarClass}>
      <div className="logo-container" style={{ cursor: 'pointer' }} title="Vai alla Home" onClick={() => navigate('/')}>
        <i className="bi bi-spotify" />
        <span>Spotify</span>
      </div>

      {/* Visibile solo a ≤480px (vedi CSS) */}
      <button
        className="sidebar-toggle"
        aria-label="Apri menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <i className={toggleIcon} />
      </button>

      <div className="sidebar-menu">
        <nav className="main-nav">
          <NavLink to="/" end className={navClass}>
            <i className="bi bi-house-door-fill" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/search" className={navClass}>
            <i className="bi bi-search" />
            <span>Cerca</span>
          </NavLink>

          {/* Nell'originale la libreria era assorbita dalla home: resta un alias */}
          <Link to="/" className="nav-link">
            <i className="bi bi-music-note-list" />
            <span>La tua libreria</span>
          </Link>

          <NavLink to="/wrapped" className={navClass}>
            <i className="bi bi-graph-up" />
            <span>Il tuo Wrapped</span>
          </NavLink>
        </nav>

        <div className="playlist-actions">
          <NavLink to="/liked" className={navClass}>
            <div className="action-icon liked-icon">
              <i className="bi bi-heart-fill" />
            </div>
            <span>Brani che ti piacciono</span>
          </NavLink>

          <NavLink to="/artists" className={navClass}>
            <div className="action-icon">
              <i className="bi bi-person-heart" />
            </div>
            <span>Artisti preferiti</span>
          </NavLink>

          <button className="nav-link" onClick={() => setCreateOpen(true)}>
            <div className="action-icon">
              <i className="bi bi-plus-lg" />
            </div>
            <span>Crea playlist</span>
          </button>
        </div>

        <hr className="sidebar-divider" />

        <div className="user-playlists">
          {userPlaylists.map((playlist) => (
            <Link key={playlist.id} className="user-playlist-item" to={`/userplaylist/${playlist.id}`}>
              {playlist.name}
            </Link>
          ))}
        </div>
      </div>

      {createOpen && <CreatePlaylistModal onClose={() => setCreateOpen(false)} />}
    </aside>
  )
}
