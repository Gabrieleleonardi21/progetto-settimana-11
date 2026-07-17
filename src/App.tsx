// ============================================
// ROTTE
//
// Le sotto-pagine che nel vanilla erano hash (#album-123) renderizzati dentro
// #contentArea diventano rotte vere, annidate nel Layout: la shell (sidebar,
// topbar, player) non viene mai smontata.
// ============================================

import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { useApplyTheme } from './hooks/useApplyTheme'
import { Album } from './pages/Album'
import { Artist } from './pages/Artist'
import { FavoriteArtists } from './pages/FavoriteArtists'
import { Genre } from './pages/Genre'
import { Home } from './pages/Home'
import { Liked } from './pages/Liked'
import { Login } from './pages/Login'
import { Playlist } from './pages/Playlist'
import { Profile } from './pages/Profile'
import { RecentTracks } from './pages/RecentTracks'
import { Search } from './pages/Search'
import { UserPlaylist } from './pages/UserPlaylist'
import { Wrapped } from './pages/Wrapped'
import { useAppSelector } from './store/hooks'

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
