import { useGame } from '../context/GameContext'
import { Header } from './Header'
import { GameCard } from './GameCard'
import { QweenGame } from '../games/qween/QweenGame'
import { ZipGame } from '../games/zip/ZipGame'
import { PatchesGame } from '../games/patches/PatchesGame'

const GAMES = [
  {
    id: 'qween',
    name: 'Qween',
    icon: '👑',
    description: 'Place one queen per row, column, and region. No queens touching — not even diagonally.',
    difficulty: 'Medium',
    type: 'Logic Grid',
    playTime: '3-5 min',
  },
  {
    id: 'zip',
    name: 'Zip',
    icon: '⚡',
    description: 'Draw a continuous path through every cell, visiting numbers in ascending order.',
    difficulty: 'Medium',
    type: 'Path Drawing',
    playTime: '2-4 min',
  },
  {
    id: 'patches',
    name: 'Patches',
    icon: '🧩',
    description: 'Fill the grid with colored rectangles matching shape and number clues. No gaps, no overlaps.',
    difficulty: 'Hard',
    type: 'Rectangle Puzzle',
    playTime: '5-10 min',
  },
]

export function GameHub() {
  const { state, setCurrentGame } = useGame()

  if (state.currentGame === 'qween') return <QweenGame />
  if (state.currentGame === 'zip') return <ZipGame />
  if (state.currentGame === 'patches') return <PatchesGame />

  return (
    <div className="min-h-screen bg-hub-bg transition-colors duration-200">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-hub-text">Choose Your Challenge</h2>
          <p className="text-hub-textSecondary">Sharpen your mind with daily logic puzzles</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => setCurrentGame(game.id)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}