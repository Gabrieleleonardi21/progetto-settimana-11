// ============================================
// GUSCIO DELL'APPLICAZIONE
//
// L'equivalente di `initShell()` del vanilla, ma dichiarativo: sidebar, topbar,
// player, PiP, modali e toast sono montati una volta sola. Solo <Outlet/> cambia
// al variare della rotta — per questo la musica non si interrompe navigando.
//
// Le pagine sono lazy (vedi App.tsx), quindi serve un <Suspense>. Sta qui, il più
// vicino possibile all'<Outlet/>: un boundary più in alto sostituirebbe l'intera
// shell col fallback a ogni navigazione, smontando il <Player/> e con esso l'audio.
// ============================================

import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAudioSync } from '../../hooks/useAudioSync'
import { usePictureInPicture } from '../../hooks/usePictureInPicture'
import { Confetti } from '../common/Confetti'
import { Toast } from '../common/Toast'
import { TrackModals } from '../modals/TrackModals'
import { PipPlayer } from '../player/PipPlayer'
import { Player } from '../player/Player'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

/** Mostrato mentre il chunk della pagina viene scaricato. */
function PageLoader() {
  return (
    <div className="text-center text-secondary py-5">
      <div className="spinner-border text-success" role="status" />
    </div>
  )
}

export function Layout() {
  useAudioSync()
  const pipWindow = usePictureInPicture()

  // Cambiando pagina il contenuto deve ripartire dall'alto, come faceva showPage().
  // Lo scroll è su .main-content (overflow-y:auto), non su .content-area.
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="app-container">
      <Confetti />
      <Sidebar />

      <main className="main-content" ref={mainRef}>
        <TopBar />
        <div className="content-area">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <Player />

      {pipWindow && <PipPlayer pipWindow={pipWindow} />}
      <TrackModals />
      <Toast />
    </div>
  )
}
