// Punto unico di montaggio dei modali legati a un brano.
// Sono in uiSlice perché possono essere aperti da qualsiasi tracklist dell'app.

import { useAppSelector } from '../../store/hooks'
import { AddToPlaylistModal } from './AddToPlaylistModal'
import { ShareModal } from './ShareModal'
import { TrackActionsModal } from './TrackActionsModal'
import { TrackDetailModal } from './TrackDetailModal'

export function TrackModals() {
  const { addToPlaylistTrack, trackDetail, trackActions, shareTrack } = useAppSelector((state) => state.ui)

  return (
    <>
      {addToPlaylistTrack && <AddToPlaylistModal track={addToPlaylistTrack} />}
      {trackDetail && <TrackDetailModal context={trackDetail} />}
      {trackActions && <TrackActionsModal context={trackActions} />}
      {shareTrack && <ShareModal track={shareTrack} />}
    </>
  )
}
