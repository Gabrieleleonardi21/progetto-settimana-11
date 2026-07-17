// Brani di un genere musicale. Se il nome non è tra i GENRES noti,
// viene usato così com'è come termine di ricerca.

import { useParams } from 'react-router-dom'
import { GENRES } from '../api/staticData'
import { AsyncContent } from '../components/common/AsyncContent'
import { TrackList } from '../components/tracks/TrackList'
import { useCatalogQuery } from '../hooks/useCatalogQuery'
import { fetchGenre, genreKey } from '../store/slices/catalogSlice'

export function Genre() {
  const { genreName = '' } = useParams()

  const decoded = decodeURIComponent(genreName)
  const genre = GENRES.find((g) => g.name === decoded)
  const term = genre?.term ?? decoded
  const title = genre?.name ?? decoded

  const state = useCatalogQuery({
    key: genreKey(term),
    run: () => fetchGenre(term),
    select: (s) => s.catalog.genres[term],
  })

  return (
    <>
      <h1 className="greeting-title">{title}</h1>
      <AsyncContent state={state}>{(tracks) => <TrackList tracks={tracks} />}</AsyncContent>
    </>
  )
}
