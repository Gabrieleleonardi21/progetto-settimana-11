// ============================================
// MODIFICA PROFILO — nome, foto, bio, città
// La foto viene ridimensionata a 256px prima di finire in localStorage.
// ============================================

import { useRef, useState, type ChangeEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { updateProfile } from '../../store/slices/profileSlice'
import { showToast } from '../../store/slices/uiSlice'
import { resizeImage } from '../../utils/image'
import { Modal } from '../common/Modal'

const PHOTO_MAX_SIZE_PX = 256

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const profile = useAppSelector((state) => state.profile)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Copie locali: si scrivono in Redux solo al "Salva"
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [location, setLocation] = useState(profile.location ?? '')
  const [photo, setPhoto] = useState(profile.profilePhoto)

  const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setPhoto(await resizeImage(file, PHOTO_MAX_SIZE_PX))
    } catch {
      dispatch(showToast('Immagine non valida'))
    }
  }

  const save = () => {
    dispatch(
      updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        profilePhoto: photo,
      }),
    )
    onClose()
  }

  // Senza foto resta il segnaposto con l'icona macchina fotografica
  let photoStyle: { backgroundImage: string } | undefined
  if (photo) photoStyle = { backgroundImage: `url('${photo}')` }

  return (
    <Modal title="Modifica profilo" onClose={onClose}>
      <div className="modal-body">
        <div className="d-flex gap-3 align-items-center mb-3">
          <div className="profile-photo-edit" style={photoStyle} onClick={() => fileInputRef.current?.click()}>
            {!photo && (
              <span>
                <i className="bi bi-camera-fill" />
              </span>
            )}
          </div>

          <div className="flex-grow-1">
            <label className="form-label text-white">Nome</label>
            <input
              type="text"
              className="form-control login-input"
              placeholder="Il tuo nome"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <small className="text-white-50 d-block mt-2">Clicca sull&apos;immagine per caricare una foto</small>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label text-white">Bio</label>
          <textarea
            className="form-control login-input"
            rows={3}
            placeholder="Raccontati in poche parole..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="form-label text-white">Città</label>
          <input
            type="text"
            className="form-control login-input"
            placeholder="Es. Milano, Italia"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickPhoto} />
      </div>

      <div className="modal-footer border-secondary">
        <button type="button" className="btn btn-outline-light" onClick={onClose}>
          Annulla
        </button>
        <button type="button" className="btn btn-spotify" onClick={save}>
          Salva
        </button>
      </div>
    </Modal>
  )
}
