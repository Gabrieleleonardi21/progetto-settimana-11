// Brani di un genere musicale. Se il nome non è tra i GENRES noti,
// viene usato così com'è come termine di ricerca.

import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { cached } from '../api/cache'
import { itunesSearch } from '../api/itunes'
import { normalizeList, normalizeTrack } from '../api/normalize'
import { GENRES } from '../api/staticData'
import { AsyncContent } from '../components/common/AsyncContent'
import { TrackList } from '../components/tracks/TrackList'
import { useAsync } from '../hooks/useAsync'

export function Genre() {
  const { genreName = '' } = useParams()

  const decoded = decodeURIComponent(genreName)
  const genre = GENRES.find((g) => g.name === decoded)
  const term = genre?.term ?? decoded
  const title = genre?.name ?? decoded

  const state = useAsync(
    useCallback(() => cached(`genre_${term}`, () => itunesSearch(term, 'song', 30)), [term]),
    [term],
  )

  return (
    <>
      <h1 className="greeting-title">{title}</h1>
      <AsyncContent state={state}>
        {(items) => <TrackList tracks={normalizeList(items, normalizeTrack)} />}
      </AsyncContent>
    </>
  )
}
