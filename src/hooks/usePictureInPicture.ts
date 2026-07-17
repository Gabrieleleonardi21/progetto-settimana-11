// ============================================
// PICTURE-IN-PICTURE — mini-player flottante
//
// Quando cambi scheda mentre la musica suona, su Chrome/Edge si apre una
// finestra separata con i controlli. Su Firefox/Safari l'hook non fa nulla.
//
// Restituisce la Window della PiP: il chiamante vi disegna dentro il player
// con createPortal, quindi la UI resta React e si aggiorna da sola.
// ============================================

import { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../store/hooks'

const PIP_SIZE = { width: 360, height: 300 }

/** Il documento della PiP è vuoto: vanno ricopiati fogli di stile e variabili del tema. */
function cloneStyles(pipWindow: Window): void {
  // In produzione gli stili sono <link>, in sviluppo Vite li inietta come <style>
  document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((link) => {
    const clone = pipWindow.document.createElement('link')
    clone.rel = 'stylesheet'
    clone.href = link.href
    pipWindow.document.head.append(clone)
  })

  document.querySelectorAll('style').forEach((style) => {
    pipWindow.document.head.append(style.cloneNode(true))
  })

  // Le variabili del tema sono stile inline su <html>: vanno copiate a mano
  pipWindow.document.documentElement.style.cssText = document.documentElement.style.cssText
  pipWindow.document.documentElement.classList.add('pip-mode')
}

export function usePictureInPicture(): Window | null {
  const [pipWindow, setPipWindow] = useState<Window | null>(null)
  const isPlaying = useAppSelector((state) => state.player.isPlaying)
  const hasTrack = useAppSelector((state) => state.player.currentTrack !== null)

  // Il listener deve leggere i valori aggiornati senza essere ri-registrato a ogni play/pause
  const canOpen = useRef(false)
  canOpen.current = isPlaying && hasTrack

  // `pipWindow` nello state serve al portal; qui serve anche una copia sincrona,
  // perché due visibilitychange ravvicinati aprirebbero due finestre.
  const windowRef = useRef<Window | null>(null)

  useEffect(() => {
    if (!window.documentPictureInPicture) return // Firefox/Safari: nessun PiP

    const openPip = async () => {
      if (windowRef.current) return
      try {
        const pip = await window.documentPictureInPicture!.requestWindow(PIP_SIZE)
        cloneStyles(pip)
        windowRef.current = pip
        setPipWindow(pip)

        // L'utente può chiudere la finestra a mano
        pip.addEventListener('pagehide', () => {
          windowRef.current = null
          setPipWindow(null)
        })
      } catch {
        // Il browser può rifiutare (nessuna interazione utente recente): si prosegue senza PiP
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden && canOpen.current) void openPip()
      else if (!document.hidden) windowRef.current?.close()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      windowRef.current?.close()
    }
  }, [])

  return pipWindow
}
