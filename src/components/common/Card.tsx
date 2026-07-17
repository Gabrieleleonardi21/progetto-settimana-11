// ============================================
// CARD — riquadro con copertina, titolo e descrizione
// Usata per album, playlist, podcast e brani in evidenza.
// ============================================

import { useNavigate } from 'react-router-dom'

interface CardProps {
  cover: string
  title: string
  description: string
  /** Rotta da aprire al click. Alternativa a `onClick`. */
  to?: string
  onClick?: () => void
  /** Se presente, mostra il bottone play in sovrimpressione. */
  onPlay?: () => void
}

export function Card({ cover, title, description, to, onClick, onPlay }: CardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) onClick()
    else if (to) navigate(to)
  }

  return (
    <div className="album-card" onClick={handleClick}>
      <img className="album-cover" src={cover} alt={title} />
      <div className="album-title">{title}</div>
      <div className="album-description">{description}</div>

      {onPlay && (
        <div
          className="play-overlay"
          onClick={(e) => {
            e.stopPropagation() // il click sulla card navigherebbe
            onPlay()
          }}
        >
          <i className="bi bi-play-fill" />
        </div>
      )}
    </div>
  )
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="card-grid">{children}</div>
}
