import { useState, useCallback, useMemo } from 'react'
import { useGame } from '../../context/GameContext'
import { Header } from '../../components/Header'
import { Timer } from '../../components/common/Timer'
import { Toast } from '../../components/common/Toast'
import { RulesDialog } from '../../components/common/Dialog'
import { getQweenPuzzle, getQweenPuzzleCount, getConflictingQueens, isQweenSolved } from './QweenPuzzles'
import { HelpCircle, RefreshCw, ChevronLeft, ChevronRight, Crown, X } from 'lucide-react'

export function QweenGame() {
  const { recordWin } = useGame()
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = getQweenPuzzle(puzzleIndex)
  const { size, regions, regionColors } = puzzle

  const [board, setBoard] = useState(() => Array(size).fill(null).map(() => Array(size).fill(0)))
  const [queens, setQueens] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [toast, setToast] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerRunning, setTimerRunning] = useState(true)

  const conflicts = useMemo(() => getConflictingQueens(queens, regions, size), [queens, regions, size])

  const handleCellClick = useCallback((row, col) => {
    if (isComplete) return

    setBoard((prev) => {
      const next = prev.map((r) => [...r])
      const current = next[row][col]

      if (current === 0) {
        next[row][col] = 2
      } else if (current === 2) {
        next[row][col] = 1
      } else {
        next[row][col] = 0
      }

      const newQueens = []
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (next[r][c] === 2) newQueens.push([r, c])
        }
      }

      setQueens(newQueens)

      const newConflicts = getConflictingQueens(newQueens, regions)

      if (isQweenSolved(newQueens, size, newConflicts)) {
        setIsComplete(true)
        setTimerRunning(false)
        recordWin('qween', elapsedTime, puzzle.id)
        setToast({ message: '🎉 Congratulations! Puzzle solved!', type: 'success' })
      }

      return next
    })
  }, [isComplete, size, regions, elapsedTime, recordWin, puzzle.id])

  const handleReset = () => {
    setBoard(Array(size).fill(null).map(() => Array(size).fill(0)))
    setQueens([])
    setIsComplete(false)
    setElapsedTime(0)
    setTimerRunning(true)
    setToast(null)
  }

  const handlePrevPuzzle = () => {
    setPuzzleIndex((prev) => (prev - 1 + getQweenPuzzleCount()) % getQweenPuzzleCount())
    handleReset()
  }

  const handleNextPuzzle = () => {
    setPuzzleIndex((prev) => (prev + 1) % getQweenPuzzleCount())
    handleReset()
  }

  const rules = [
    'Each row must contain exactly one queen (👑).',
    'Each column must contain exactly one queen.',
    'Each colored region must contain exactly one queen.',
    'Queens cannot touch each other — not even diagonally.',
    'Tap once to place X (blocked), tap again for Queen, tap again to clear.',
    'Use X marks to eliminate impossible cells.',
  ]

  return (
    <div className="min-h-screen bg-hub-bg transition-colors duration-200">
      <Header onBack={() => window.location.reload()} />

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={handlePrevPuzzle} className="p-2 rounded-lg hover:bg-hub-border transition-colors">
              <ChevronLeft className="w-5 h-5 text-hub-text" />
            </button>
            <span className="text-sm text-hub-textSecondary">Puzzle {puzzleIndex + 1}</span>
            <button onClick={handleNextPuzzle} className="p-2 rounded-lg hover:bg-hub-border transition-colors">
              <ChevronRight className="w-5 h-5 text-hub-text" />
            </button>
          </div>

          <Timer isRunning={timerRunning} onTimeUpdate={setElapsedTime} />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRules(true)}
              className="p-2 rounded-lg hover:bg-hub-border transition-colors"
              aria-label="Rules"
            >
              <HelpCircle className="w-5 h-5 text-hub-text" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-hub-border transition-colors"
              aria-label="Reset"
            >
              <RefreshCw className="w-5 h-5 text-hub-text" />
            </button>
          </div>
        </div>

        <div
          className="grid mx-auto border-4 border-hub-text rounded-sm overflow-hidden shadow-lg bg-hub-border gap-px"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const regionIdx = regions[r][c]
              const regionClass = regionColors[regionIdx]
              const isQueen = cell === 2
              const isBlocked = cell === 1
              const isConflict = isQueen && conflicts.has(`${r},${c}`)

              const borderTop = r > 0 && regions[r-1][c] !== regionIdx ? 'border-t-[3px] border-t-hub-text' : ''
              const borderLeft = c > 0 && regions[r][c-1] !== regionIdx ? 'border-l-[3px] border-l-hub-text' : ''

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`
                    aspect-square flex items-center justify-center text-xl sm:text-2xl font-bold
                    transition-colors duration-150 relative bg-hub-card
                    ${regionClass}
                    ${borderTop} ${borderLeft}
                    ${!isQueen && !isBlocked ? 'hover:brightness-95 dark:hover:brightness-110' : ''}
                  `}
                >
                  {isConflict && (
                    <div className="absolute inset-0 opacity-80" style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 4px, transparent 4px, transparent 12px)'
                    }}></div>
                  )}
                  <span className={`relative z-10 flex items-center justify-center w-full h-full`}>
                    {isQueen && (
                      <Crown className={`w-3/5 h-3/5 ${isConflict ? 'text-red-700 dark:text-red-500 scale-90' : 'text-hub-text fill-current'}`} />
                    )}
                    {isBlocked && !isQueen && <X className="w-2/5 h-2/5 text-hub-textSecondary opacity-60" />}
                  </span>
                </button>
              )
            })
          )}
        </div>

        <div className="mt-6 text-center text-sm text-hub-textSecondary">
          Queens placed: {queens.length} / {size}
        </div>
      </main>

      <RulesDialog
        open={showRules}
        onOpenChange={setShowRules}
        title="How to Play Qween"
        rules={rules}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.type === 'success' ? 5000 : 3000}
        />
      )}
    </div>
  )
}