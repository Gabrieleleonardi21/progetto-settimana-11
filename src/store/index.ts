// ============================================
// STORE REDUX
// Lo stato iniziale di ogni slice viene letto da localStorage (vedi i singoli
// slice); la riscrittura è centralizzata in persistMiddleware.
// ============================================

import { configureStore, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit'
import { persistMiddleware } from './persistMiddleware'
import authReducer from './slices/authSlice'
import libraryReducer from './slices/librarySlice'
import playerReducer from './slices/playerSlice'
import profileReducer from './slices/profileSlice'
import statsReducer from './slices/statsSlice'
import themeReducer from './slices/themeSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    library: libraryReducer,
    player: playerReducer,
    stats: statsReducer,
    theme: themeReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(persistMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/** Firma dei thunk scritti a mano (vedi playerThunks.ts). */
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>
