import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' → gli asset sono referenziati in modo relativo all'index.html.
// Funziona sia in locale che su GitHub Pages sotto un sottopercorso
// (/Build-week-2/...), senza dover configurare nulla al deploy.
// Presuppone HashRouter: vedi src/main.tsx.
export default defineConfig({
  base: './',
  plugins: [react()],
})
