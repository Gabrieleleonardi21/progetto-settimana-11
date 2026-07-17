import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import { store } from './store'
import './styles/style.css'
import { KEYS, readString, writeString } from './utils/storage'

// La data di iscrizione si fissa al primo avvio in assoluto e non cambia più
if (readString(KEYS.profileJoinDate) === null) {
  writeString(KEYS.profileJoinDate, store.getState().profile.joinDate)
}

// HashRouter e non BrowserRouter: GitHub Pages serve file statici e non sa
// riscrivere /album/123 su index.html. Con l'hash il deploy non richiede nulla.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </StrictMode>,
)
