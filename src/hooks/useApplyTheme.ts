// Applica le variabili CSS del tema attivo come stile inline su <html>.
// Lo stile inline vince sempre sulle regole :root di style.css, qualunque sia
// l'ordine di caricamento.

import { useEffect } from 'react'
import { useAppSelector } from '../store/hooks'
import { resolveTheme } from '../store/slices/themeSlice'

export function useApplyTheme(): void {
  const themeId = useAppSelector((state) => state.theme.themeId)

  useEffect(() => {
    const { vars } = resolveTheme(themeId)
    for (const [name, value] of Object.entries(vars)) {
      document.documentElement.style.setProperty(name, value)
    }
  }, [themeId])
}
