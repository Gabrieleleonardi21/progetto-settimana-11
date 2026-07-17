// ============================================
// MODALE
//
// Riusa le classi CSS di Bootstrap ma non il suo JS: niente `new bootstrap.Modal()`,
// nessun handler da agganciare e staccare a mano. Il modale esiste finché il
// componente è montato, quindi non può restare "appeso" dopo un cambio pagina.
// ============================================

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  /** Se assente non viene disegnata l'intestazione (vedi TrackDetailModal). */
  title?: ReactNode
  onClose: () => void
  children: ReactNode
  /** Classi extra sul .modal-dialog (es. `track-detail-dialog`). */
  dialogClassName?: string
  /** Classi extra sul .modal-content. Default: sfondo scuro. */
  contentClassName?: string
}

export function Modal({
  title,
  onClose,
  children,
  dialogClassName = '',
  contentClassName = 'bg-dark text-white',
}: ModalProps) {
  // ESC chiude, e mentre il modale è aperto la pagina sotto non deve scorrere
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <>
      <div className="modal-backdrop fade show" />
      {/* Il click sul backdrop chiude; quello sul contenuto no (stopPropagation) */}
      <div className="modal fade show d-block" tabIndex={-1} onMouseDown={onClose}>
        <div
          className={`modal-dialog modal-dialog-centered ${dialogClassName}`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className={`modal-content ${contentClassName}`}>
            {title !== undefined && (
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Chiudi"
                  onClick={onClose}
                />
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
