// Tabella dei brani: intestazione + una TrackRow per brano.

import type { Track } from '../../types'
import { TrackRow } from './TrackRow'

interface TrackListProps {
  tracks: Track[]
  /** false → la terza colonna mostra l'artista invece dell'album. */
  showAlbumCol?: boolean
  removeFromPlaylistId?: string
}

export function TrackList({ tracks, showAlbumCol = true, removeFromPlaylistId }: TrackListProps) {
  let thirdColumn = 'Artista'
  if (showAlbumCol) thirdColumn = 'Album'

  return (
    <div className="tracklist">
      <div className="tracklist-header">
        <div>#</div>
        <div>Titolo</div>
        <div>{thirdColumn}</div>
        <div />
        <div>
          <i className="bi bi-clock" />
        </div>
      </div>

      {tracks.map((track, index) => (
        <TrackRow
          key={track.id}
          track={track}
          index={index}
          queue={tracks}
          showAlbumCol={showAlbumCol}
          removeFromPlaylistId={removeFromPlaylistId}
        />
      ))}
    </div>
  )
}
