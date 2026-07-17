// Condivisione del brano su WhatsApp / Telegram / X, o copia del link.

import { useAppDispatch } from '../../store/hooks'
import { closeShare, showToast } from '../../store/slices/uiSlice'
import type { Track } from '../../types'
import { Modal } from '../common/Modal'

/** I brani locali non hanno una pagina iTunes: si ripiega su una ricerca Apple Music. */
function shareUrl(track: Track): string {
  if (track.trackViewUrl) return track.trackViewUrl
  const query = encodeURIComponent(`${track.title} ${track.artist}`)
  return `https://music.apple.com/search?term=${query}`
}

export function ShareModal({ track }: { track: Track }) {
  const dispatch = useAppDispatch()
  const close = () => dispatch(closeShare())

  const url = shareUrl(track)
  const text = `${track.title} – ${track.artist}`
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(
      () => {
        dispatch(showToast('Link copiato!'))
        close()
      },
      () => dispatch(showToast('Impossibile copiare il link')),
    )
  }

  const title = (
    <>
      {track.title}
      <p className="text-secondary mb-0 small">{track.artist}</p>
    </>
  )

  return (
    <Modal title={title} onClose={close}>
      <div className="modal-body">
        <div className="share-buttons">
          {/* noopener: impedisce alla pagina esterna di accedere a window.opener */}
          <a
            className="share-btn share-btn-whatsapp"
            target="_blank"
            rel="noopener"
            href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
          >
            <i className="bi bi-whatsapp" />
            <span>WhatsApp</span>
          </a>

          <a
            className="share-btn share-btn-telegram"
            target="_blank"
            rel="noopener"
            href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
          >
            <i className="bi bi-telegram" />
            <span>Telegram</span>
          </a>

          <a
            className="share-btn share-btn-twitter"
            target="_blank"
            rel="noopener"
            href={`https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          >
            <i className="bi bi-twitter-x" />
            <span>X / Twitter</span>
          </a>

          <button className="share-btn share-btn-copy" onClick={copyLink}>
            <i className="bi bi-link-45deg" />
            <span>Copia link</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
