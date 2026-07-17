// ============================================
// INTESTAZIONE di album, playlist e profilo
// cover = null → riquadro gradiente con il cuore (pagina "Brani che ti piacciono")
// ============================================

import type { ReactNode } from 'react'

interface PlaylistHeaderProps {
  cover: string | null
  /** Etichetta piccola sopra il titolo: "Album", "Playlist", "Artista", "Profilo". */
  type: string
  title: string
  /** Righe di metadati, sotto il titolo. */
  children?: ReactNode
  /** Elemento affiancato al blocco info, allineato in basso (es. il bottone "Segui"). */
  aside?: ReactNode
}

/** Senza copertina si disegna il riquadro gradiente col cuore. */
function Cover({ cover, title }: { cover: string | null; title: string }) {
  if (cover) return <img className="playlist-cover-large" src={cover} alt={title} />

  return (
    <div
      className="playlist-cover-large d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg,#450af5,#c4efd9)' }}
    >
      <i className="bi bi-heart-fill" style={{ fontSize: 80, color: 'white' }} />
    </div>
  )
}

export function PlaylistHeader({ cover, type, title, children, aside }: PlaylistHeaderProps) {
  return (
    <div className="playlist-header">
      <Cover cover={cover} title={title} />

      <div className="playlist-header-info">
        <div className="playlist-type">{type}</div>
        <div className="playlist-name-large">{title}</div>
        {children}
      </div>

      {aside}
    </div>
  )
}

/** Bottone play verde e tondo sotto l'intestazione. */
export function PlayButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn-play-large" onClick={onClick} title="Riproduci">
      <i className="bi bi-play-fill" />
    </button>
  )
}

export function ActionsRow({ children }: { children: ReactNode }) {
  return <div className="playlist-actions-row">{children}</div>
}
