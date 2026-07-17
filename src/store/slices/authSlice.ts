// ============================================
// AUTENTICAZIONE — login simulato, nessuna password reale
//
// La sessione (`session_active`) è volutamente separata dal profilo: il logout
// la chiude ma lascia nome, foto e bio in localStorage per il prossimo accesso.
// ============================================

import { createSlice } from '@reduxjs/toolkit'
import { KEYS, readString } from '../../utils/storage'

interface AuthState {
  isAuthenticated: boolean
}

const initialState: AuthState = {
  isAuthenticated: readString(KEYS.sessionActive) !== null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Il payload (nome visualizzato) non serve qui, ma profileSlice lo
    // intercetta con extraReducers per salvare il nome scelto al login.
    login: {
      reducer(state) {
        state.isAuthenticated = true
      },
      prepare(displayName: string) {
        return { payload: displayName }
      },
    },
    logout(state) {
      state.isAuthenticated = false
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
