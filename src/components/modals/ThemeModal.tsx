// Griglia di pallini per scegliere la palette. Ogni pallino è diviso a metà tra
// colore d'accento e sfondo: dà un'idea immediata di come cambierà l'interfaccia.

import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setTheme, THEMES } from '../../store/slices/themeSlice'
import { Modal } from '../common/Modal'

function swatchClass(isActive: boolean): string {
  if (isActive) return 'theme-swatch active'
  return 'theme-swatch'
}

export function ThemeModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const activeId = useAppSelector((state) => state.theme.themeId)

  return (
    <Modal title="Personalizza il tema" onClose={onClose}>
      <div className="modal-body">
        <p className="text-white-50 small mb-3">
          Scegli una palette di colori per personalizzare la pagina.
        </p>

        <div className="theme-swatch-grid">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={swatchClass(theme.id === activeId)}
              onClick={() => dispatch(setTheme(theme.id))}
            >
              <span
                className="theme-swatch-color"
                style={{
                  background: `linear-gradient(135deg, ${theme.vars['--spotify-green']} 50%, ${theme.vars['--spotify-dark-gray']} 50%)`,
                }}
              >
                <i className="bi bi-check-circle-fill theme-swatch-check" />
              </span>
              <span className="theme-swatch-label">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}
