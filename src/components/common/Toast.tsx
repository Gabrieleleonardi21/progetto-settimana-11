// Messaggio temporaneo in basso allo schermo. Si nasconde da solo dopo 2s.

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { hideToast } from '../../store/slices/uiSlice'

const TOAST_DURATION_MS = 2000

export function Toast() {
  const dispatch = useAppDispatch()
  const message = useAppSelector((state) => state.ui.toast)

  useEffect(() => {
    if (message === null) return
    const timer = setTimeout(() => dispatch(hideToast()), TOAST_DURATION_MS)
    // Un nuovo toast prima della scadenza azzera il conto alla rovescia
    return () => clearTimeout(timer)
  }, [message, dispatch])

  if (message === null) return null
  return <div className="toast-msg">{message}</div>
}
