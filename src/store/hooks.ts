// Versioni tipizzate di useDispatch/useSelector: da usare al posto di quelle
// generiche di react-redux, così RootState e i thunk sono già noti al compilatore.

import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
