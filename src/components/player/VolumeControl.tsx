// ============================================
// CONTROLLO VOLUME — barra orizzontale cliccabile e trascinabile
//
// Il vanilla gestiva anche un orientamento verticale per il player mobile.
// Ora a ≤480px il CSS nasconde la barra (resta il solo bottone mute), quindi
// serve un solo asse.
//
// I listener del drag si agganciano a `ownerDocument`, non a `document`: così
// il componente funziona identico dentro la finestra Picture-in-Picture, che ha
// un documento proprio.
// ============================================

import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { changeVolume, toggleMute } from '../../store/playerThunks'

function volumeIconClass(volume: number): string {
  if (volume === 0) return 'bi bi-volume-mute-fill'
  if (volume < 0.5) return 'bi bi-volume-down-fill'
  return 'bi bi-volume-up-fill'
}

/**
 * Solo la barra, senza il bottone e senza il wrapper `.volume-control`.
 *
 * La PiP la usa così com'è: il suo documento è largo 360px, quindi le media
 * query ≤480px sono attive anche lì dentro e una `.volume-control` attorno
 * farebbe sparire la barra.
 */
export function VolumeBar() {
  const dispatch = useAppDispatch()
  const volume = useAppSelector((state) => state.player.volume)

  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverPct, setHoverPct] = useState(0)
  const [dragging, setDragging] = useState(false)

  const pctFromClientX = (clientX: number): number => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return 0
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  // Trascinando, il puntatore esce quasi subito dalla barra: i listener vanno sul document
  useEffect(() => {
    if (!dragging) return
    const doc = containerRef.current?.ownerDocument
    if (!doc) return

    const onMouseMove = (e: MouseEvent) => dispatch(changeVolume(pctFromClientX(e.clientX)))
    const onMouseUp = () => setDragging(false)

    doc.addEventListener('mousemove', onMouseMove)
    doc.addEventListener('mouseup', onMouseUp)
    return () => {
      doc.removeEventListener('mousemove', onMouseMove)
      doc.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging, dispatch])

  let containerClass = 'volume-bar-container'
  if (dragging) containerClass += ' dragging'

  return (
    <div
      ref={containerRef}
      className={containerClass}
      onMouseDown={(e) => {
        dispatch(changeVolume(pctFromClientX(e.clientX)))
        setDragging(true)
      }}
      onMouseMove={(e) => {
        if (!dragging) setHoverPct(pctFromClientX(e.clientX))
      }}
      onMouseLeave={() => setHoverPct(0)}
    >
      <div className="volume-bar-hover" style={{ width: `${hoverPct * 100}%` }} />
      <div className="volume-bar-fill" style={{ width: `${volume * 100}%` }}>
        <div className="volume-bar-thumb" />
      </div>
    </div>
  )
}

/** Bottone muto + barra: la versione usata nel player principale. */
export function VolumeControl() {
  const dispatch = useAppDispatch()
  const volume = useAppSelector((state) => state.player.volume)

  return (
    <div className="volume-control">
      <button className="btn-icon" title="Muto" onClick={() => dispatch(toggleMute())}>
        <i className={volumeIconClass(volume)} />
      </button>
      <VolumeBar />
    </div>
  )
}
