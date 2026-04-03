import PropTypes from 'prop-types'
import { useGame } from '../context/GameContext'
import { Sun, Moon, Gamepad2, ArrowLeft } from 'lucide-react'

export function Header({ onBack }) {
  const { state, toggleTheme, setCurrentGame } = useGame()

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-hub-card/50 backdrop-blur-sm border-b border-hub-border">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-hub-bg transition-colors"
            aria-label="Back to hub"
          >
            <ArrowLeft className="w-5 h-5 text-hub-text" />
          </button>
        )}
        <button
          onClick={() => setCurrentGame(null)}
          className="flex items-center gap-2"
        >
          <Gamepad2 className="w-7 h-7 text-hub-accent" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-hub-accent to-purple-400 bg-clip-text text-transparent">
            Mind Games
          </h1>
        </button>
      </div>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-hub-bg transition-colors"
        aria-label="Toggle theme"
      >
        {state.theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-400" />
        )}
      </button>
    </header>
  )
}

Header.propTypes = {
  onBack: PropTypes.func,
}