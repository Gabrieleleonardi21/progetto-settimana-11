# Come funziona l'app — logica, flussi, funzionamento

Questo documento spiega **come si muovono i dati** nel progetto: chi possiede cosa, in
che ordine accadono le cose, e perché certe scelte sono fatte così.
Per la struttura delle cartelle, l'elenco delle rotte e il confronto con il vecchio
progetto vanilla, vedi il [README](./README.md).

---

## 1. Il modello mentale: tre fonti di verità separate

Quasi tutta la logica del progetto discende da una sola idea: **tre cose diverse
possiedono tre tipi di dato diversi**, e non si invadono a vicenda.

```
┌──────────────────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│          REDUX (store/)          │  │  <audio>  (audio/)   │  │ TRASPORTO (api/) │
├─────────────────┬────────────────┤  ├──────────────────────┤  ├──────────────────┤
│ Stato dell'app  │ Dati remoti    │  │ Il motore che suona  │  │ Rete + cache su  │
│ Serializzabile  │ Serializzabili │  │ Non serializzabile   │  │ localStorage 24h │
│ Persistito      │ NON persistiti │  │ Effimero             │  │ Fallback offline │
│                 │                │  │                      │  │                  │
│ brano corrente  │ album, artisti │  │ currentTime reale    │  │ fetch a iTunes   │
│ coda, isPlaying │ generi, ricerche│ │ decodifica, buffering│  │ dedup richieste  │
│ preferiti       │ home, playlist │  │                      │  │                  │
│ tema, profilo   │  (catalogSlice)│  │                      │  │                  │
└─────────────────┴────────────────┘  └──────────────────────┘  └──────────────────┘
```

Le domande che risolvono ogni dubbio su "dove metto questo dato?":

1. **Serve ad altri componenti o deve sopravvivere al ricaricamento?** → Redux.
2. **È un oggetto del browser (Window, HTMLAudioElement)?** → fuori da Redux, sempre.
   Non è serializzabile, e Redux Toolkit segnalerebbe un errore.
3. **Viene da iTunes?** → Redux, nel `catalog` ([catalogSlice.ts](src/store/slices/catalogSlice.ts)),
   passando dai suoi thunk. Nello store va il dato **già normalizzato** (`Track`, `Album`),
   mai il formato grezzo dell'API.

Tutto ciò che non rientra in questi casi — l'hover su uno slider, un menu aperto,
una bozza di form — resta `useState` locale nel componente. Non è una svista: metterlo
in Redux farebbe girare i selector di tutta l'app a ogni movimento del mouse.

> **Nota sul punto 3.** I dati remoti sono cache di server: rigenerabili, non "nostri".
> Un'architettura React li terrebbe volentieri fuori dallo store (è quello che faceva
> questo progetto fino alla migrazione a `createAsyncThunk`). Stanno in Redux per scelta
> esplicita, così ogni dato che l'app mostra è ispezionabile da un unico posto e visibile
> nei DevTools. Il prezzo è che il `catalog` va tenuto fuori dalla persistenza — vedi §6.

---

## 2. Avvio dell'app

L'ordine conta, perché il tema deve essere applicato **prima** che il browser disegni
qualcosa, altrimenti si vede un lampo del tema di default (FOUC).

```
1.  index.html — <script> inline, bloccante
      legge localStorage["color_theme_vars"] e applica le variabili CSS su <html>
      ↓  (la pagina non è ancora stata disegnata: nessun flash)
2.  main.tsx — import dello store
      ↓
3.  Ogni slice calcola il proprio initialState leggendo localStorage
      authSlice     → sessione attiva?
      profileSlice  → nome, foto, bio
      librarySlice  → preferiti, playlist, recenti
      playerSlice   → ultimo brano e volume
      statsSlice    → ascolti per artista
      ↓
4.  main.tsx — se è il primissimo avvio, fissa la data di iscrizione
      ↓
5.  <Provider store> → <HashRouter> → <App>
      ↓
6.  App: useApplyTheme() riapplica il tema (ora dallo store, non da localStorage)
      ↓
7.  Routing: sessione attiva? → Layout + pagina. Altrimenti → /login
```

**Perché il tema viene applicato due volte** (punto 1 e punto 6): lo script inline è
veloce ma stupido — legge una copia già risolta delle variabili CSS, senza conoscere la
tabella dei temi. `useApplyTheme` è la fonte autorevole e tiene il tema allineato quando
l'utente lo cambia a runtime. Il primo evita il flash, il secondo mantiene la verità.

**Perché `HashRouter` e non `BrowserRouter`**: GitHub Pages serve file statici e non sa
riscrivere `/album/123` su `index.html`. Con l'hash il deploy non richiede configurazione.

### Caricamento delle pagine (lazy)

Le 12 pagine interne sono importate con `lazy()` in [App.tsx](src/App.tsx): Vite ne
ricava un chunk separato, scaricato solo quando si apre quella rotta. Due dettagli non
ovvi:

- **Login è un import statico**, non lazy: è la prima schermata di chi non è
  autenticato, renderla lazy aggiungerebbe un round-trip proprio sul primo render.
- **Il `<Suspense>` sta dentro [Layout.tsx](src/components/layout/Layout.tsx)**, attorno
  al solo `<Outlet/>`. Se stesse più in alto (attorno a `<Routes>`), il fallback
  sostituirebbe l'intera shell a ogni navigazione, smontando il `<Player/>` — e la
  musica si fermerebbe a ogni click.

---

## 3. Flusso: autenticazione

Il login è **simulato**: nessuna password viene verificata. Serve solo a dare all'app
un nome utente e uno stato di sessione.

```
Login.tsx — l'utente scrive "mario@posta.it" e invia
   ↓
validazione: se contiene @ dev'essere un'email valida, altrimenti basta non sia vuoto
   ↓
attesa finta di 800ms (mostra lo spinner: è teatro, non rete)
   ↓
dispatch(login("mario"))          ← da "mario@posta.it" il nome diventa "mario"
   ↓
   ├─→ authSlice:        isAuthenticated = true
   ├─→ profileSlice:     intercetta la stessa action con extraReducers → displayName
   └─→ persistMiddleware: scrive session_active + i campi del profilo
   ↓
<ProtectedRoute> vede isAuthenticated = true → mostra le rotte interne
```

**Una action, tre reducer.** `login` è dichiarata in `authSlice`, ma `profileSlice` la
ascolta con `extraReducers` e il middleware la persiste. È il motivo per cui il payload
(il nome) esiste anche se `authSlice` non lo usa: serve a chi ascolta.

**Sessione e profilo sono separati di proposito.** Il logout cancella `session_active` e
il brano corrente, ma lascia nome, foto e bio su localStorage. Al prossimo accesso il
campo del login è già precompilato — il profilo sopravvive alla sessione.

---

## 4. Flusso: riproduzione (il cuore dell'app)

Questo è il punto più importante del progetto. La regola è: **i reducer restano puri**.
Un reducer non può chiamare `audio.play()` — quindi ogni effetto sull'elemento `<audio>`
passa dai thunk in [store/playerThunks.ts](src/store/playerThunks.ts).

Il traffico è **bidirezionale**, e le due direzioni hanno strade diverse:

```
        ┌──────────── Redux → audio: i THUNK ────────────┐
        │                                                ↓
   ┌─────────┐                                    ┌─────────────┐
   │  REDUX  │                                    │   <audio>   │
   └─────────┘                                    └─────────────┘
        ↑                                                │
        └──────── audio → Redux: useAudioSync ───────────┘
```

- **Redux → audio** (l'utente vuole qualcosa): thunk. `playTracks`, `togglePlay`,
  `seek`, `nextTrack`, `changeVolume`.
- **audio → Redux** (il browser decide da solo): [useAudioSync](src/hooks/useAudioSync.ts).
  Avanzamento, durata reale, fine brano, pausa dai tasti multimediali della tastiera.

### Cosa succede al click su un brano

```
TrackRow — click
   ↓
dispatch(playTracks(tracks, index))        ← unico modo di avviare la musica
   ↓
setQueue(tracks)                            la coda diventa la lista visibile
   ↓
playFromQueue(index)
   ├─→ registerListen(artista)              statistiche per il Wrapped
   ├─→ addRecentTrack(track)                ultimi 10, senza duplicati
   ├─→ setCurrent({track, index})           la UI mostra subito il brano
   │                                        (isPlaying = false: non suona ancora)
   ├─→ brano senza previewUrl?
   │      SÌ → audio.removeAttribute('src') + load() → fine, mostra 🔇
   │      NO ↓
   ├─→ audio.src = previewUrl
   └─→ audio.play()  → Promise
          ├─ risolta  → setPlaying(true)
          └─ rifiutata → setPlaying(false)   autoplay bloccato o sorgente non valida
   ↓
il browser inizia a suonare ed emette i suoi eventi
   ↓
useAudioSync li riversa in Redux: timeupdate → setCurrentTime, loadedmetadata → setDuration
   ↓
ProgressBar e Player si ridisegnano da soli
```

**Perché `audio.play()` viene gestita come Promise**: può essere rifiutata. Il browser
blocca l'autoplay senza interazione dell'utente, e la sorgente può essere non valida.
Se ignorassimo il rifiuto, `isPlaying` direbbe "sto suonando" con l'audio fermo.

**Perché `setPlaying(true)` arriva da due strade** (dalla Promise *e* dall'evento `play`
in `useAudioSync`): è ridondanza voluta e innocua, l'azione è idempotente. Copre sia il
play che parte da noi sia quello che parte dal browser (tasti multimediali).

**Le anteprime iTunes durano 30 secondi**, non quanto il brano. Per questo esiste
`setDuration`: `loadedmetadata` riporta la durata *reale* del file, che sovrascrive
quella dichiarata dai metadati del brano.

### Gli altri comandi

| Comando | Logica non ovvia |
|---|---|
| `prevTrack` | Se il brano è iniziato da più di **3 secondi**, lo riavvia invece di tornare indietro — come fa Spotify |
| `nextTrack` | Con shuffle attivo pesca a caso su tutta la coda: **può ripescare il brano corrente** |
| `handleTrackEnded` | Con repeat riavvia; altrimenti chiama `nextTrack` (che a fine coda torna al primo) |
| `togglePlay` | Dopo un ricaricamento la UI mostra l'ultimo brano ma l'`<audio>` è vuoto: reimposta `src` prima di suonare |
| `toggleMute` | Da muto torna a **0.7 fisso**, non al volume precedente (era così anche nel vanilla) |
| `seek` | Ignorato se la durata non è ancora nota: senza sorgente caricata `audio.duration` è `NaN` |

**Il volume viaggia al contrario degli altri comandi**: vive in Redux (ed è persistito),
e l'elemento `<audio>` lo *insegue* con un effetto in `useAudioSync`. È l'unico caso in
cui lo stato guida il motore in modo dichiarativo invece che imperativo.

### Perché la musica non si ferma cambiando pagina

L'elemento `<audio>` è creato **una volta sola**, come modulo
([audio/audioElement.ts](src/audio/audioElement.ts)), fuori da React e fuori da Redux.
Non è dentro nessun componente, quindi nessun re-render e nessun cambio di rotta può
smontarlo. È la differenza principale con la versione vanilla, dove ogni cambio pagina
ricaricava il documento e azzerava la riproduzione.

---

## 5. Flusso: dati remoti (catalogSlice)

I dati di iTunes stanno in Redux, nello slice `catalog`. Ogni risorsa ha il suo
`createAsyncThunk`, che genera le tre action `pending` / `fulfilled` / `rejected`.

```
Album.tsx
   ↓
useCatalogQuery({ key, run: () => fetchAlbum(id), select: s => s.catalog.albums[id] })
   ↓
il thunk parte solo se serve  →  `condition`:  dato già nello store?  → NON parte
                                               richiesta già in volo?  → NON parte
   ↓
fetchAlbum.pending → catalog.requests['album_123'] = { loading: true }
   ↓
cached(`album_123`, () => itunesGetAlbum(id))        ← il TRASPORTO, api/cache.ts
   ├─ 1. memoria (Map)          → istantaneo
   ├─ 2. localStorage entro 24h → evita del tutto la chiamata
   ├─ 3. richiesta identica in volo? → si aggancia a quella
   └─ 4. fetch reale a iTunes
          ├─ ok      → salva in memoria + localStorage
          └─ errore  → ripiega sul dato salvato ANCHE SE SCADUTO
                       se non esiste → propaga l'errore
   ↓
normalize.ts: dal formato grezzo iTunes al modello dell'app (Track, Album, Artist)
   ↓
fetchAlbum.fulfilled → catalog.albums['123'] = { album, tracks }   ← NELLO STORE
        oppure
fetchAlbum.rejected  → catalog.requests['album_123'] = { error: '...' }
   ↓
useCatalogQuery legge dallo store e restituisce { data, loading, error, retry }
   ↓
<AsyncContent> sceglie: spinner | messaggio d'errore + "Riprova" | contenuto
```

**Perché due livelli di cache** (lo store *e* `cached()`). Fanno cose diverse: lo store
serve la sessione corrente ed è ciò che la UI legge; `cached()` è il trasporto e aggiunge
quello che lo store non ha — la persistenza a 24h su localStorage (dopo un ricaricamento
il `catalog` riparte vuoto, ma i dati arrivano dal disco senza toccare la rete) e il
fallback sul dato scaduto quando iTunes risponde `403` perché sta limitando le richieste.
Meglio mostrare un album di ieri che una schermata di errore.

**`condition` è ciò che rende lo store una cache vera**: senza, ogni visita a una pagina
rifarebbe la richiesta. Con, il dato già presente la annulla in partenza. È anche la
difesa contro il doppio effect di `StrictMode`: la seconda esecuzione trova
`requests[key].loading === true` e si ferma.

**La ricerca è l'eccezione: non passa da `cached()`.** Ogni query digitata creerebbe una
voce su localStorage, riempiendolo di risultati usa e getta. Lì la cache è solo lo store,
che vive quanto la sessione.

**Le protezioni contro le risposte fuori ordine** non servono più a mano: i risultati
sono indicizzati per chiave (`catalog.searches['battisti']`), quindi una risposta lenta
di una query vecchia finisce nella *sua* casella e non sovrascrive quella nuova. Prima,
con lo stato locale, serviva un flag `cancelled` in ogni pagina.

---

## 6. Flusso: persistenza

Nel vanilla ogni mutazione doveva ricordarsi di chiamare la propria `save*()`. Qui il
salvataggio è **un solo punto**: [store/persistMiddleware.ts](src/store/persistMiddleware.ts)
osserva le action e riscrive le chiavi interessate.

```
dispatch(toggleLike(track))
   ↓
librarySlice aggiorna lo stato (reducer puro, nessun I/O)
   ↓
persistMiddleware intercetta: il tipo inizia con "library/" ?
   ↓
sì → riscrive TUTTE le chiavi della libreria da getState()
```

La lettura fa il percorso opposto, ma **una volta sola all'avvio**: ogni slice legge la
propria chiave nell'`initialState` (vedi §2). Non esiste una riga che legga localStorage
a runtime — se ne trovi una, è un bug: significa che qualcuno sta scavalcando lo store.
(L'unica eccezione è `api/cache.ts`, che ha una sua area separata con prefisso
`apicache_` e una TTL: è trasporto, non stato dell'app.)

**Il `catalog` è l'unico slice che non compare qui sotto**, ed è voluto: vedi §5 e
l'invariante 7.

| Cosa scatena il salvataggio | Cosa viene scritto |
|---|---|
| qualsiasi action `library/*` | preferiti, artisti, playlist, recenti (tutti insieme) |
| `updateProfile`, `login` | nome, bio, città, data iscrizione, foto |
| `login` / `logout` | apertura / chiusura sessione |
| `setVolume` | volume |
| `setCurrent` | brano corrente (per ripristinare la UI al ricaricamento) |
| `registerListen` | statistiche Wrapped |
| `setTheme` | id del tema + copia risolta delle variabili CSS |

Tre punti che sembrano stranezze ma sono deliberati:

- **Il formato su disco è quello del vanilla**: le collezioni indicizzate sono salvate
  come array di coppie `[id, valore]` (`Object.entries`), perché il vecchio progetto fa
  `new Map(array)`. In memoria invece sono `Record<id, valore>`, perché Redux richiede
  stato serializzabile e non accetta `Map`. `readRecord()` accetta entrambi i formati.
- **La foto profilo è protetta da `try/catch`**: è un data URL e da sola può saturare la
  quota di localStorage. Se fallisce, un toast avvisa e il resto del profilo è comunque
  salvo — meglio che fallire in silenzio.
- **`isPlaying` non è persistito, `currentTrack` sì.** Dopo un ricaricamento la UI mostra
  l'ultimo brano ma non parte da sola: sarebbe autoplay, e il browser lo bloccherebbe.

---

## 7. Flusso: libreria e statistiche

```
cuoricino su una riga → toggleLike(track)      ← il brano INTERO, non solo l'id
"Aggiungi a playlist" → uiSlice apre il modale → addTrackToPlaylist({playlistId, track})
ogni riproduzione     → registerListen(artista) + addRecentTrack(track)
```

**Perché `toggleLike` vuole il brano intero e non l'id**: la pagina Preferiti deve poter
mostrare i brani senza richiamare l'API. Se salvassimo solo gli id, servirebbe una
lookup per ognuno. Stesso motivo per le playlist utente e i brani recenti.

**Il Wrapped salva solo il nome dell'artista e un contatore**, non le copertine. Per
mostrare un'immagine, `selectArtistCover` la ripesca dal brano più recente di
quell'artista (o dai preferiti). Se non la trova, `createCover()`
([utils/format.ts](src/utils/format.ts)) genera al volo una copertina SVG con le
iniziali su un gradiente, restituita come data URI.

**`createCover` interpola testo dentro un SVG, quindi passa da `escapeXml()`.** Il nome
dell'artista arriva da iTunes: senza escape, un `"` o un `<` nel nome chiuderebbe
l'attributo o il tag e permetterebbe di iniettare markup arbitrario nell'SVG. È lo stesso
motivo per cui nel resto dell'app non si usa mai `innerHTML` con dati dinamici.

**I selettori derivati sono memoizzati** con `createSelector`
([store/selectors.ts](src/store/selectors.ts)): `Object.values()` su un Record crea un
array nuovo a ogni chiamata, e un array nuovo a ogni render farebbe ri-renderizzare tutto
anche senza modifiche reali.

**Gli id delle playlist si generano in `prepare`, non nel reducer**: `nanoid()` non è
puro, e un reducer che non lo è rompe il time-travel debugging e i test.

---

## 8. Flusso: tema

```
ThemeModal → dispatch(setTheme(id))
   ↓
   ├─→ themeSlice: themeId = id
   ├─→ useApplyTheme: resolveTheme(id) → setProperty() su <html>
   │      (stile inline: vince sempre sulle regole :root di style.css,
   │       qualunque sia l'ordine di caricamento dei CSS)
   └─→ persistMiddleware: salva l'id + la copia già risolta delle variabili
          ↑
          └── è questa copia che lo script inline di index.html legge
              al prossimo avvio, per applicare il tema prima del disegno
```

Il giro può sembrare ridondante, ma serve a tenere lo script inline **stupido**: non
conosce la tabella dei temi, legge solo variabili CSS già pronte. Se un domani i temi
cambiano, `index.html` non va toccato.

---

## 9. Invarianti — le regole da non rompere

Se modifichi il progetto, questi sono i punti dove è facile fare danni:

1. **Nessun effetto nei reducer.** `audio.play()`, `localStorage.setItem()`, `nanoid()`,
   `Date.now()` non vanno in un reducer. Il loro posto è: thunk (audio), middleware
   (persistenza), `prepare` (id e timestamp).
2. **La musica si avvia solo con `playTracks`.** È l'unico ingresso: garantisce che coda,
   statistiche e brani recenti restino allineati. Chiamare `audio.play()` direttamente
   lascerebbe Redux a raccontare una bugia.
3. **Non leggere localStorage a runtime.** Si legge una volta sola nell'`initialState`.
   Ogni altra lettura è uno store scavalcato — è esattamente il bug che c'era in
   `Login.tsx`, che rileggeva il nome utente dal disco mentre `profileSlice` lo aveva già.
4. **Niente oggetti non serializzabili in Redux.** `Window`, `HTMLAudioElement`, `Map`,
   `Date`. Redux Toolkit lo segnala in sviluppo, ma la vera ragione è che rompe
   persistenza e debugging.
5. **Il `<Suspense>` non deve salire sopra il `Layout`**, o la musica si ferma a ogni
   navigazione (vedi §2).
6. **Il dato remoto entra in Redux solo dai thunk del `catalog`**, e già normalizzato.
   Una pagina non deve chiamare `itunes*()` o `cached()` per conto suo: se serve una
   risorsa nuova, si aggiunge un thunk allo slice.
7. **Il `catalog` non va persistito.** È l'unico slice che `persistMiddleware` ignora, e
   deve restare così: sono decine di album e ricerche: saturerebbero localStorage e non
   avrebbero mai una scadenza. La persistenza dei dati remoti è già compito di
   `cached()`, che ha una TTL di 24h (vedi §5).

---

## 10. Mappa rapida: "dove metto le mani per..."

| Voglio cambiare… | File |
|---|---|
| il comportamento di play/pause/next/seek | [store/playerThunks.ts](src/store/playerThunks.ts) |
| cosa succede quando l'audio finisce o avanza | [hooks/useAudioSync.ts](src/hooks/useAudioSync.ts) |
| cosa viene salvato e quando | [store/persistMiddleware.ts](src/store/persistMiddleware.ts) |
| come i dati iTunes entrano nello store | [store/slices/catalogSlice.ts](src/store/slices/catalogSlice.ts) |
| come una pagina legge una risorsa remota | [hooks/useCatalogQuery.ts](src/hooks/useCatalogQuery.ts) |
| durata cache / comportamento offline | [api/cache.ts](src/api/cache.ts) |
| le chiamate a iTunes | [api/itunes.ts](src/api/itunes.ts) |
| il formato dei dati che arrivano dall'API | [api/normalize.ts](src/api/normalize.ts) |
| rotte e lazy loading | [App.tsx](src/App.tsx) |
| la shell (sidebar, player, modali sempre montati) | [components/layout/Layout.tsx](src/components/layout/Layout.tsx) |
| playlist virtuali, generi, brano locale | [api/staticData.ts](src/api/staticData.ts) |
| i temi disponibili | [store/slices/themeSlice.ts](src/store/slices/themeSlice.ts) (`THEMES`) |
| copertine di fallback, durata, saluto | [utils/format.ts](src/utils/format.ts) |
