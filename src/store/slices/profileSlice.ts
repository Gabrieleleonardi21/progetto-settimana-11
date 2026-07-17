// ============================================
// PROFILO UTENTE — nome, foto, bio, città, data di iscrizione
// Sopravvive al logout: vedi authSlice.
// ============================================

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { KEYS, readString } from '../../utils/storage'
import { login } from './authSlice'

interface ProfileState {
  displayName: string
  profilePhoto: string | null
  bio: string | null
  location: string | null
  /** ISO string. Impostata al primo accesso e mai più modificata. */
  joinDate: string
}

/** Campi modificabili dal modale "Modifica profilo". */
export interface ProfileEdit {
  displayName: string
  profilePhoto: string | null
  bio: string | null
  location: string | null
}

function initialJoinDate(): string {
  const saved = readString(KEYS.profileJoinDate)
  if (saved) return saved
  return new Date().toISOString()
}

const initialState: ProfileState = {
  displayName: readString(KEYS.displayName) ?? '',
  profilePhoto: readString(KEYS.profilePhoto),
  bio: readString(KEYS.profileBio),
  location: readString(KEYS.profileLocation),
  joinDate: initialJoinDate(),
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile(state, action: PayloadAction<ProfileEdit>) {
      // Un nome vuoto verrebbe mostrato come stringa vuota ovunque: si ignora
      if (action.payload.displayName) state.displayName = action.payload.displayName
      state.bio = action.payload.bio
      state.location = action.payload.location
      state.profilePhoto = action.payload.profilePhoto
    },
  },
  extraReducers: (builder) => {
    // Al login il nome digitato diventa il nome visualizzato
    builder.addCase(login, (state, action) => {
      state.displayName = action.payload
    })
  },
})

export const { updateProfile } = profileSlice.actions
export default profileSlice.reducer
