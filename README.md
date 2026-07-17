# 🎵 Spotify Clone — React + Redux + TypeScript

> **Dal codice imperativo all'architettura dichiarativa.** Un refactoring completo del progetto originale Vanilla JS (MPA) trasformato in una moderna **Single Page Application (SPA)** reattiva, robusta e tipata. Stessa estetica iconica, stessa API iTunes, ma con un motore completamente nuovo.

---

## 🚀 Avvio Rapido

Avvia l'ambiente locale in pochi istanti:

```bash
# 1. Installa tutte le dipendenze del progetto
npm install

# 2. Lancia il server di sviluppo (http://localhost:5173)
npm run dev

# 3. Compila ed esegui il type-check per la produzione (output in dist/)
npm run build

# 4. Analizza il codice per prevenire bug e formattazioni errate
npm run lint

```

---

## 📂 Architettura e Struttura delle Cartelle

La codebase è organizzata secondo principi di separazione delle responsabilità (_Separation of Concerns_), isolando la logica dei dati dalla UI:

```bash
src/
 ├── api/          # Integrazione iTunes, logiche di caching a 3 livelli e normalizzatori
 ├── audio/        # Singleton HTMLAudioElement (vive al di fuori del ciclo React/Redux)
 ├── components/   # UI modulare divisa per responsabilità
 │    ├── common/  # Componenti atomici e riutilizzabili (Modal, Card, Toast, Confetti, AsyncContent...)
 │    ├── layout/  # Guscio dell'app, Sidebar, TopBar e Sleep Timer
 │    ├── modals/  # Finestre di dialogo modali dell'applicazione
 │    ├── player/  # Player centrale, controlli volume, barre di riproduzione e PiP
 │    └── tracks/  # Liste tracce e righe interattive dei brani
 ├── hooks/        # Logiche riutilizzabili (useCatalogQuery, useAudioSync, usePictureInPicture, useQuickPlay...)
 ├── pages/        # Componenti principali di rotta (Home, Search, Liked, Wrapped, Album, Artist...)
 ├── store/        # Gestione globale dello stato: Slice, Thunk del Player e Middleware
 ├── types/        # Tipizzazione forte: modelli di dominio ed interfacce iTunes API
 └── utils/        # Utility di formattazione, localStorage e ottimizzazione immagini

```

---

## 🔄 Evoluzione dell'Architettura (Prima vs Ora)

| Prima (Vanilla MPA)                                                                                  | Ora (React SPA)                                                                                                              |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Navigazione con refresh**: 4 file HTML distinti. L'uso di `location.href` distruggeva lo stato.    | **Rotte dichiarative**: Navigazione fluida e istantanea integrata dentro un unico `Layout` comune.                           |
| **Musica instabile**: La riproduzione audio si interrompeva inevitabilmente a ogni cambio pagina.    | **Singleton audio ininterrotto**: Il tag `<audio>` vive fuori da React/Redux, suonando senza pause durante i cambi di rotta. |
| **Perdita dello sleep timer**: Il timer moriva ad ogni ricaricamento della pagina.                   | **Timer persistente**: Lo stato del timer sopravvive intatto alla navigazione e alle interazioni.                            |
| **Stato accoppiato**: Registro globale imperativo dei brani basato sulla mappa `_trackRegistry`.     | **Flusso dati unidirezionale**: Il brano fluisce pulito dall'alto verso il basso come semplice `prop` reattiva.              |
| **Refresh manuali**: Necessità di invocare `refreshCurrentPage()` dopo ogni interazione (like/play). | **Re-rendering automatico**: L'interfaccia si aggiorna autonomamente al mutare dello stato Redux.                            |
| **Modali imperativi**: Finestre gestite via codice nativo bootstrap (`new bootstrap.Modal`).         | **Modali dichiarativi**: I componenti vengono montati e smontati programmaticamente da React.                                |
| **PiP instabile**: Picture-in-Picture ricreato a mano ad ogni transizione con `refreshPipUI()`.      | **PiP nativo con Portals**: Sfrutta `createPortal` per proiettare la UI direttamente nella finestra esterna.                 |
| **Codice duplicato**: Funzioni come `getTopArtists()` definite e manutenute in più file.             | **Selettori memoizzati**: Logica centralizzata e ottimizzata con _Reselect_ per evitare ricalcoli.                           |
| **Asset corrotti**: La copertina dell'artista Wrapped cercava file locali inesistenti.               | **Fallback reattivo**: Generazione automatica di un SVG alternativo se l'immagine non è disponibile.                         |

---

## 🧠 Gestione dello Stato (Redux Toolkit)

Lo store globale è suddiviso in moduli specializzati per mantenere l'applicazione scalabile e performante:

- `auth`: Tiene traccia della sessione attiva. Il login è simulato: nessuna password viene verificata.
- `profile`: Gestione dell'anagrafica utente (Nome, immagine del profilo, biografia, città, data d'iscrizione).
- `library`: Preferiti, artisti seguiti, cronologia dei brani ascoltati e playlist create dall'utente.
- `player`: Stato del riproduttore musicale (brano attivo, coda, shuffle, loop, volume, avanzamento).
- `stats`: Aggregazione degli ascolti per artista, motore pulsante dell'esperienza _Wrapped_.
- `theme`: Controlla e applica dinamicamente la palette colori ed il tema dell'interfaccia.
- `ui`: Gestione dello stato di elementi volatili come Toast, Sleep Timer e modali attivi.
- `catalog`: I risultati delle chiamate a iTunes (album, artisti, generi, playlist, ricerche, home), caricati dai `createAsyncThunk` in `store/slices/catalogSlice.ts`.

### 💾 Persistenza Invisibile ed Elegante

Dimentica le chiamate esplicite a `saveToLocalStorage()`. Abbiamo implementato un middleware centralizzato (`store/persistMiddleware.ts`) che osserva silenziosamente le action Redux e aggiorna le rispettive chiavi su disco.

> **Retrocompatibilità garantita:** Il formato di salvataggio rispetta fedelmente la struttura del vecchio progetto vanilla (array di coppie `[id, valore]`), consentendo alle due versioni di coesistere e leggere gli stessi dati sullo stesso browser.

### 🔌 Gestione degli Effetti Collaterali (Side-Effects)

I reducer rimangono puri e privi di side-effects.

1. **Dall'App all'Audio (Thunks)**: Azioni come `play`, `pause` o `seek` transitano per i Thunk asincroni presenti in `store/playerThunks.ts`, dialogando in sicurezza con il singleton audio.
   Allo stesso modo le chiamate di rete passano dai `createAsyncThunk` di `store/slices/catalogSlice.ts`: i risultati finiscono nello store già normalizzati, e i tre stati `pending`/`fulfilled`/`rejected` alimentano spinner ed errori delle pagine.
2. **Dall'Audio all'App (Hooks)**: Il flusso opposto (avanzamento, durata reale dell'anteprima, fine brano, play/pausa dai tasti multimediali) viene intercettato dall'hook `hooks/useAudioSync.ts` e inviato allo store Redux.

---

## 🗺️ Routing e Navigazione

L'applicazione fa uso di **`HashRouter`** (es: `/#/album/123`). Questo permette di effettuare il deploy statico su host come _GitHub Pages_ senza temere errori 404 sui refresh e senza la necessità di configurazioni o rewrite lato server.

### Elenco delle Rotte Disponibili:

- `/login` — Schermata di accesso
- `/` — Home Page con feed personalizzato
- `/search` — Ricerca globale di brani, album ed artisti
- `/liked` — Raccolta dei tuoi brani preferiti
- `/wrapped` — Statistiche di ascolto e riepilogo dell'anno
- `/profile` — Visualizzazione e modifica del profilo utente
- `/artists` — Lista dei creatori seguiti
- `/recent` — Cronologia degli ultimi ascolti
- `/album/:albumId` — Pagina di dettaglio dell'album
- `/artist/:artistId` — Pagina dell'artista con i suoi album
- `/genre/:genreName` — Canali tematici divisi per genere musicale
- `/playlist/:playlistId` — Playlist di sistema pre-generate (Top Italia, Chill, ecc.)
- `/userplaylist/:playlistId` — Playlist create e modificate dall'utente

---

## ⚠️ Note Tecniche Importanti

- **Ottimizzazione WebP**: Tutte le immagini locali sono state convertite in `.webp` e ridimensionate ad un massimo di 700px sul lato lungo. Il limite è abbondante di proposito: la resa più grande nell'app è `playlist-cover-large` a 232px, che raddoppiata per i display Retina arriva a 464px. I risparmi sono netti — `santino` è passata da **2.3 MB a 84 KB**, `ppp` da **167 KB a 59 KB**.
  > **Se aggiungi immagini**: tienile sotto i 700px e in WebP. Attenzione a `santino`, che ha **trasparenza reale**: non va convertita in JPEG.
- **Limiti iTunes API**: Le anteprime dei brani durano esattamente 30 secondi. I brani sprovvisti di `previewUrl` mostrano l'icona 🔇 e i comandi di riproduzione vengono disabilitati.
- **Picture-in-Picture (PiP)**: Supportato nativamente solo su browser Chromium-based (Chrome/Edge 116+). Sulle altre piattaforme, l'hook `usePictureInPicture` si disattiva silenziosamente senza causare crash o rallentamenti.
- **Vincoli di Layout PiP**: La finestra di PiP è limitata a una larghezza di **360px**, attivando le media query CSS per dispositivi mobili (`≤480px`). Per questa ragione, il player all'interno del PiP monta `<VolumeBar/>` al posto di `<VolumeControl/>` (che verrebbe altrimenti nascosto per ragioni di spazio).
