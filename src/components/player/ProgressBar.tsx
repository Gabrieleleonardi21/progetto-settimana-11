// ============================================
// BARRA DI AVANZAMENTO — click per saltare, tooltip col tempo al passaggio del mouse
// `compact` = versione senza tooltip usata dentro la finestra Picture-in-Picture.
// ============================================

import { useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { seek } from '../../store/playerThunks'
import { formatDuration } from '../../utils/format'

export function ProgressBar({ compact = false }: { compact?: boolean }) {
  const dispatch = useAppDispatch()
  const { currentTrack, currentTime, duration } = useAppSelector((state) => state.player)

  const containerRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ pct: number; time: number } | null>(null)

  const isSeekable = currentTrack !== null && duration > 0

  let playedPct = 0
  if (isSeekable) playedPct = (currentTime / duration) * 100

  let wrapperClass = 'player-progress'
  if (compact) wrapperClass = 'pip-progress'

  const pctFromClientX = (clientX: number): number => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return 0
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  return (
    <div className={wrapperClass}>
      <span className="time-text">{formatDuration(currentTime)}</span>

      <div
        ref={containerRef}
        className="progress-bar-container"
        onMouseMove={(e) => {
          if (!isSeekable) return
          const pct = pctFromClientX(e.clientX)
          setHover({ pct, time: Math.floor(pct * duration) })
        }}
        onMouseLeave={() => setHover(null)}
        onClick={(e) => {
          if (!isSeekable) return
          dispatch(seek(pctFromClientX(e.clientX) * duration))
        }}
      >
        {!compact && <div className="progress-bar-hover" style={{ width: `${(hover?.pct ?? 0) * 100}%` }} />}
        <div className="progress-bar-fill" style={{ width: `${playedPct}%` }} />

        {!compact && hover && (
          <div className="progress-bar-tooltip visible" style={{ left: `${hover.pct * 100}%` }}>
            {formatDuration(hover.time)}
          </div>
        )}
      </div>

      <span className="time-text">{formatDuration(duration)}</span>
    </div>
  )
}
