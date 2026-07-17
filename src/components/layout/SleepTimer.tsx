// ============================================
// SLEEP TIMER — ferma la riproduzione dopo N minuti
//
// Nella MPA il timer moriva a ogni cambio pagina. Qui il componente è montato
// una volta sola nella TopBar, quindi il conto alla rovescia sopravvive alla
// navigazione — un difetto risolto dal passaggio a SPA.
//
// ⚠️ Va montato una volta sola: due istanze creerebbero due timeout.
// ============================================

import { useEffect, useState } from 'react'
import { audio } from '../../audio/audioElement'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSleepTimer, showToast } from '../../store/slices/uiSlice'

const OPTIONS_MINUTES = [15, 30, 60]
/** Ogni quanto ridisegnare i minuti residui sul pulsante. */
const LABEL_REFRESH_MS = 30_000

export function SleepTimer() {
  const dispatch = useAppDispatch()
  const endTime = useAppSelector((state) => state.ui.sleepTimerEndTime)
  const [menuOpen, setMenuOpen] = useState(false)
  const [, forceRefresh] = useState(0)

  // Chiude il menu cliccando ovunque fuori
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  useEffect(() => {
    if (endTime === null) return

    const stop = setTimeout(() => {
      audio.pause() // l'evento 'pause' aggiorna isPlaying (vedi useAudioSync)
      dispatch(setSleepTimer(null))
      dispatch(showToast('Sleep timer: riproduzione fermata'))
    }, Math.max(0, endTime - Date.now()))

    const refresh = setInterval(() => forceRefresh((n) => n + 1), LABEL_REFRESH_MS)

    return () => {
      clearTimeout(stop)
      clearInterval(refresh)
    }
  }, [endTime, dispatch])

  const start = (minutes: number) => {
    dispatch(setSleepTimer(Date.now() + minutes * 60_000))
    dispatch(showToast(`Sleep timer: stop tra ${minutes} min`))
    setMenuOpen(false)
  }

  const isActive = endTime !== null

  // Timer attivo → icona piena e minuti residui; spento → icona vuota
  let buttonClass = 'btn-icon'
  let moonIcon = 'bi bi-moon'
  let remainingLabel = ''
  if (endTime !== null) {
    buttonClass = 'btn-icon active'
    moonIcon = 'bi bi-moon-fill'
    remainingLabel = ` ${Math.max(0, Math.ceil((endTime - Date.now()) / 60_000))}m`
  }

  let menuClass = 'sleep-timer-menu'
  if (menuOpen) menuClass = 'sleep-timer-menu open'

  return (
    <div className="sleep-timer-wrapper">
      <button
        className={buttonClass}
        title="Sleep timer"
        onClick={(e) => {
          e.stopPropagation() // altrimenti il listener sul document richiude subito il menu
          setMenuOpen((open) => !open)
        }}
      >
        <i className={moonIcon} />
        <span className="sleep-timer-label">{remainingLabel}</span>
      </button>

      <div className={menuClass} onClick={(e) => e.stopPropagation()}>
        {OPTIONS_MINUTES.map((minutes) => (
          <button key={minutes} className="sleep-timer-option" onClick={() => start(minutes)}>
            Smetti tra {minutes} min
          </button>
        ))}

        <hr className="sleep-timer-divider" />
        <button
          className="sleep-timer-option sleep-timer-cancel"
          disabled={!isActive}
          onClick={() => {
            dispatch(setSleepTimer(null))
            setMenuOpen(false)
          }}
        >
          Annulla timer
        </button>
      </div>
    </div>
  )
}
