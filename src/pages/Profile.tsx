// Profilo utente: avatar, dati, playlist create, modifica e logout.

import { useState } from 'react'
import { USER_PLAYLIST_COVER } from '../api/staticData'
import { Card, CardGrid } from '../components/common/Card'
import { ActionsRow } from '../components/common/PlaylistHeader'
import { ProfileModal } from '../components/modals/ProfileModal'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playTracks } from '../store/playerThunks'
import { logout } from '../store/slices/authSlice'
import { audio } from '../audio/audioElement'

/** Foto dell'utente o, in mancanza, la sua iniziale su sfondo verde. */
function Avatar({ photo, displayName }: { photo: string | null; displayName: string }) {
  if (photo) {
    return (
      <div
        className="playlist-cover-large"
        style={{
          borderRadius: '50%',
          backgroundImage: `url('${photo}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    )
  }

  return (
    <div
      className="playlist-cover-large d-flex align-items-center justify-content-center"
      style={{ borderRadius: '50%', background: 'linear-gradient(135deg,#1db954,#191414)' }}
    >
      <span style={{ fontSize: 90, fontWeight: 900, color: 'white' }}>
        {displayName.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export function Profile() {
  const dispatch = useAppDispatch()
  const { displayName, profilePhoto, bio, location, joinDate } = useAppSelector((state) => state.profile)
  const userPlaylists = useAppSelector((state) => state.library.userPlaylists)
  const likedCount = useAppSelector((state) => Object.keys(state.library.likedTracks).length)

  const [editing, setEditing] = useState(false)

  const joinedOn = new Date(joinDate).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })

  const handleLogout = () => {
    audio.pause()
    audio.removeAttribute('src')
    dispatch(logout()) // il middleware rimuove session_active; ProtectedRoute rimanda al login
  }

  return (
    <>
      <div className="playlist-header">
        <Avatar photo={profilePhoto} displayName={displayName} />

        <div className="playlist-header-info">
          <div className="playlist-type">Profilo</div>
          <div className="playlist-name-large">{displayName}</div>

          {bio && <div className="playlist-meta profile-bio">{bio}</div>}

          <div className="playlist-meta profile-details-row">
            {location && (
              <span className="profile-detail-item">
                <i className="bi bi-geo-alt-fill" /> {location}
              </span>
            )}
            <span className="profile-detail-item">
              <i className="bi bi-calendar3" /> Iscritto da {joinedOn}
            </span>
          </div>

          <div className="playlist-meta mt-1">
            {userPlaylists.length} playlist • {likedCount} brani salvati
          </div>
        </div>
      </div>

      <ActionsRow>
        <button className="btn btn-spotify" onClick={() => setEditing(true)}>
          <i className="bi bi-pencil-fill" /> Modifica profilo
        </button>
        <button className="btn-icon" style={{ fontSize: 32 }} title="Esci" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" />
        </button>
      </ActionsRow>

      {userPlaylists.length > 0 && (
        <>
          <h2 className="section-title">Le tue playlist</h2>
          <CardGrid>
            {userPlaylists.map((playlist) => (
              <Card
                key={playlist.id}
                cover={USER_PLAYLIST_COVER}
                title={playlist.name}
                description={`${playlist.tracks.length} brani`}
                to={`/userplaylist/${playlist.id}`}
                onPlay={() => dispatch(playTracks(playlist.tracks))}
              />
            ))}
          </CardGrid>
        </>
      )}

      {editing && <ProfileModal onClose={() => setEditing(false)} />}
    </>
  )
}
