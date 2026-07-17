// Versioni tipizzate di useDispatch/useSelector: da usare al posto di quelle
// generiche di react-redux, così RootState e i thunk sono già noti al compilatore.

import { useDispatch, useSelector, useStore } from 'react-redux'
import type { AppDispatch, RootState } from './index'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

/**
 * Accesso allo store dentro una callback, quando la chiave del dato non è nota
 * al render (es. l'id di un album passato al click). Con useAppSelector non si
 * potrebbe: gli hook non si chiamano dentro un handler.
 */
export const useAppStore = useStore.withTypes<ReturnType<typeof useStore<RootState>>>()
