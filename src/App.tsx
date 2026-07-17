// ============================================
// ROTTE
//
// Le sotto-pagine che nel vanilla erano hash (#album-123) renderizzati dentro
// #contentArea diventano rotte vere, annidate nel Layout: la shell (sidebar,
// topbar, player) non viene mai smontata.
//
// Ogni pagina è caricata su richiesta: Vite ne ricava un chunk separato, così il
// primo caricamento non trascina pagine che l'utente potrebbe non aprire mai.
// Login resta un import statico: è la prima schermata di chi non è autenticato,
// caricarla in differita aggiungerebbe un round-trip proprio sul primo render.
// Il <Suspense> che copre queste pagine sta nel Layout, attorno all'<Outlet/>.
// ============================================

import { lazy, type ComponentType } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { useApplyTheme } from './hooks/useApplyTheme'
import { Login } from './pages/Login'
import { useAppSelector } from './store/hooks'

/**
 * lazy() vuole un modulo con default export, le pagine usano export nominati:
 * l'helper rimappa il modulo sul componente richiesto, evitando di ripetere
 * `.then((m) => ({ default: m.X }))` dodici volte.
 */
function lazyPage<M, K extends keyof M>(loader: () => Promise<M>, name: K) {
  return lazy(() => loader().then((m) => ({ default: m[name] as ComponentType })))
}

const Album = lazyPage(() => import('./pages/Album'), 'Album')
const Artist = lazyPage(() => import('./pages/Artist'), 'Artist')
const FavoriteArtists = lazyPage(() => import('./pages/FavoriteArtists'), 'FavoriteArtists')
const Genre = lazyPage(() => import('./pages/Genre'), 'Genre')
const Home = lazyPage(() => import('./pages/Home'), 'Home')
const Liked = lazyPage(() => import('./pages/Liked'), 'Liked')
const Playlist = lazyPage(() => import('./pages/Playlist'), 'Playlist')
const Profile = lazyPage(() => import('./pages/Profile'), 'Profile')
const RecentTracks = lazyPage(() => import('./pages/RecentTracks'), 'RecentTracks')
const Search = lazyPage(() => import('./pages/Search'), 'Search')
const UserPlaylist = lazyPage(() => import('./pages/UserPlaylist'), 'UserPlaylist')
const Wrapped = lazyPage(() => import('./pages/Wrapped'), 'Wrapped')

/** Senza sessione attiva ogni rotta rimanda al login. */
function ProtectedRoute() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export function App() {
  useApplyTheme()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="liked" element={<Liked />} />
          <Route path="wrapped" element={<Wrapped />} />
          <Route path="profile" element={<Profile />} />
          <Route path="artists" element={<FavoriteArtists />} />
          <Route path="recent" element={<RecentTracks />} />
          <Route path="album/:albumId" element={<Album />} />
          <Route path="artist/:artistId" element={<Artist />} />
          <Route path="genre/:genreName" element={<Genre />} />
          <Route path="playlist/:playlistId" element={<Playlist />} />
          <Route path="userplaylist/:playlistId" element={<UserPlaylist />} />
        </Route>
      </Route>

      {/* Qualsiasi altra rotta torna alla home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
