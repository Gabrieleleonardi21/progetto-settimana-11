# Spotify Clone — React + Redux + TypeScript

Refactor del progetto vanilla (cartella padre) in una **SPA** React.
Stessa grafica, stesso `style.css`, stessa API iTunes: cambia l'architettura.

## Avvio

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + bundle in dist/
npm run lint
```

## Struttura

```
src/
  api/          chiamate iTunes, normalizzatori, cache a 3 livelli, dati statici
  audio/        l'unico HTMLAudioElement dell'app (vive fuori da React e da Redux)
  components/
    common/     Modal, Card, PlaylistHeader, Toast, Confetti, AsyncContent
    layout/     Layout (guscio), Sidebar, TopBar, SleepTimer
    modals/     i modali dell'app
    player/     Player, PipPlayer, ProgressBar, VolumeControl, PlayerControls
    tracks/     TrackList, TrackRow
  hooks/        useAsync, useAudioSync, useApplyTheme, usePictureInPicture, useQuickPlay
  pages/        una per rotta
  store/        slice, thunk del player, selettori, middleware di persistenza
  types/        modello dati + tipi grezzi iTunes
  utils/        formattazione, localStorage, ridimensionamento immagini
```

## Stato (Redux Toolkit)

| Slice | Contenuto |
|---|---|
| `auth` | sessione attiva |
| `profile` | nome, foto, bio, città, data iscrizione |
| `library` | preferiti, artisti seguiti, playlist utente, brani recenti |
| `player` | brano corrente, coda, play/shuffle/repeat, volume, avanzamento |
| `stats` | ascolti per artista (Wrapped) |
| `theme` | palette attiva |
| `ui` | toast, sleep timer, modali dei brani |

**Persistenza**: nessuna funzione `save*()` sparsa. `store/persistMiddleware.ts` osserva
le action e riscrive le chiavi di `localStorage` interessate. Il formato su disco è
quello del progetto vanilla (array di coppie `[id, valore]`), così le due versioni
leggono gli stessi dati.

**Effetti sull'audio**: i reducer restano puri. Ogni `play`/`pause`/`seek` passa dai
thunk in `store/playerThunks.ts`. Il flusso opposto (l'audio che notifica avanzamento,
durata, fine brano) è in `hooks/useAudioSync.ts`.

## Routing

`HashRouter`, non `BrowserRouter`: GitHub Pages serve file statici e non sa riscrivere
`/album/123` su `index.html`. Con l'hash il deploy non richiede alcuna configurazione.

```
/login
/                        Home
/search  /liked  /wrapped  /profile  /artists  /recent
/album/:albumId
/artist/:artistId
/genre/:genreName
/playlist/:playlistId          playlist virtuali (Top Italia, Chill…)
/userplaylist/:playlistId      playlist create dall'utente
```

## Cosa è cambiato rispetto al vanilla

| Prima (MPA) | Ora (SPA) |
|---|---|
| 4 file HTML, `location.href` ricarica la pagina | rotte annidate nel `Layout` |
| La musica si interrompeva cambiando pagina | `<audio>` singleton, mai smontato |
| Lo sleep timer moriva al cambio pagina | sopravvive alla navigazione |
| `_trackRegistry`: Map globale id → brano | il brano arriva come prop |
| `refreshCurrentPage()` dopo ogni like/play | re-render automatico |
| Modali imperativi (`new bootstrap.Modal`) | componenti montati/smontati |
| PiP ricostruita a mano + `refreshPipUI()` | `createPortal` nella finestra PiP |
| `getTopArtists()` definita due volte | un solo selettore memoizzato |
| Cover artista Wrapped → file inesistente | fallback SVG generato |

## Note

- **Immagini locali in WebP**, ridotte a 700px di lato lungo (il massimo con cui
  vengono mostrate: `playlist-cover-large` è 232px, ×2 per i display retina).
  `santino` è passata da 2,3 MB a 84 KB, `ppp` da 167 KB a 59 KB. Attenzione:
  `santino` ha **trasparenza reale**, quindi non va convertita in JPEG.
  Se aggiungi immagini, tienile sotto i 700px e in WebP.
- Le anteprime iTunes durano 30s. I brani senza `previewUrl` mostrano 🔇 e non partono.
- La finestra PiP è larga 360px: al suo interno **valgono le media query ≤480px**.
  Per questo il player PiP usa `<VolumeBar/>` e non `<VolumeControl/>` (che lì
  verrebbe nascosto). Vedi il commento in `components/player/VolumeControl.tsx`.
- Il Document Picture-in-Picture esiste solo su Chrome/Edge 116+. Altrove l'hook
  non fa nulla, senza errori.
