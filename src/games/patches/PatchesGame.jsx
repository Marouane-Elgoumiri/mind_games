import { useState, useCallback, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import { Header } from '../../components/Header'
import { Timer } from '../../components/common/Timer'
import { Toast } from '../../components/common/Toast'
import { RulesDialog } from '../../components/common/Dialog'
import {
  getPatchesPuzzle,
  getPatchesPuzzleCount,
  validateRectanglePlacement,
  isPatchesSolved,
  getPatchColor,
} from './PatchesPuzzles'
import PropTypes from 'prop-types'
import { HelpCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

function ShapeIcon({ shape }) {
  if (shape === 'square') {
    return <div className="w-3 h-3 sm:w-4 sm:h-4 border-[1.5px] border-current bg-hub-textSecondary/20"></div>
  }
  if (shape === 'wide') {
    return <div className="w-5 h-2.5 sm:w-6 sm:h-3 border-[1.5px] border-current bg-hub-textSecondary/20"></div>
  }
  if (shape === 'tall') {
    return <div className="w-2.5 h-5 sm:w-3 sm:h-6 border-[1.5px] border-current bg-hub-textSecondary/20"></div>
  }
  return <div className="w-3 h-3 sm:w-4 sm:h-4 border-[1.5px] border-current border-dashed bg-hub-textSecondary/20 flex items-center justify-center relative">
    <div className="absolute -inset-1 border-[1.5px] border-current border-dotted opacity-50"></div>
  </div>
}

ShapeIcon.propTypes = {
  shape: PropTypes.string.isRequired,
}

export function PatchesGame() {
  const { state, recordWin, setPatchesStars } = useGame()
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = getPatchesPuzzle(puzzleIndex)
  const { size, clues } = puzzle

  const [placedPatches, setPlacedPatches] = useState([])
  const [patchHistory, setPatchHistory] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [toast, setToast] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerRunning, setTimerRunning] = useState(true)
  const [preview, setPreview] = useState(null)
  const [dragStart, setDragStart] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const boardRef = useRef(null)

  const getCellFromEvent = useCallback((e) => {
    if (!boardRef.current) return null
    const rect = boardRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const cellSize = rect.width / size
    const col = Math.floor((clientX - rect.left) / cellSize)
    const row = Math.floor((clientY - rect.top) / cellSize)
    if (row < 0 || row >= size || col < 0 || col >= size) return null
    return [row, col]
  }, [size])

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    if (isComplete) return
    const cell = getCellFromEvent(e)
    if (!cell) return
    setIsDragging(true)
    setDragStart(cell)
    setPreview({ row: cell[0], col: cell[1], height: 1, width: 1 })
  }, [isComplete, getCellFromEvent])

  const handlePointerMove = useCallback((e) => {
    e.preventDefault()
    if (!isDragging || !dragStart) return
    const cell = getCellFromEvent(e)
    if (!cell) return

    const startRow = Math.min(dragStart[0], cell[0])
    const startCol = Math.min(dragStart[1], cell[1])
    const height = Math.abs(dragStart[0] - cell[0]) + 1
    const width = Math.abs(dragStart[1] - cell[1]) + 1

    setPreview({ row: startRow, col: startCol, height, width })
  }, [isDragging, dragStart, getCellFromEvent])

  const handlePointerUp = useCallback(() => {
    if (!isDragging || !preview) {
      setIsDragging(false)
      setDragStart(null)
      setPreview(null)
      return
    }

    setIsDragging(false)

    const { row, col, height, width } = preview
    setPreview(null)
    setDragStart(null)

    if (height === 1 && width === 1) {
      for (let i = 0; i < placedPatches.length; i++) {
        const patch = placedPatches[i]
        if (row >= patch.row && row < patch.row + patch.height &&
            col >= patch.col && col < patch.col + patch.width) {
          const newPatches = placedPatches.filter((_, idx) => idx !== i)
          setPlacedPatches(newPatches)
          setPatchHistory((prev) => [...prev, { action: 'remove', patch: patch, index: i }])
          break
        }
      }
      return
    }

    const validation = validateRectanglePlacement(row, col, height, width, size, placedPatches, clues)

    if (!validation.valid) {
      return
    }

    const containsClue = clues.some(
      (clue) => clue.row >= row && clue.row < row + height && clue.col >= col && clue.col < col + width
    )

    if (!containsClue) {
      return
    }

    const newPatch = { row, col, height, width }
    const newPatches = [...placedPatches, newPatch]
    setPlacedPatches(newPatches)
    setPatchHistory((prev) => [...prev, { action: 'place', patch: newPatch }])

    if (isPatchesSolved(newPatches, size)) {
      setIsComplete(true)
      setTimerRunning(false)
      recordWin('patches', elapsedTime, puzzle.id)

      const stars = elapsedTime < 90 ? 3 : elapsedTime < 180 ? 2 : 1
      setPatchesStars(puzzle.id, stars)
    }
  }, [isDragging, preview, size, placedPatches, clues, elapsedTime, recordWin, setPatchesStars, puzzle.id])

  const handleUndo = () => {
    if (patchHistory.length === 0) return
    const lastAction = patchHistory[patchHistory.length - 1]
    setPatchHistory((prev) => prev.slice(0, -1))

    if (lastAction.action === 'place') {
      setPlacedPatches((prev) => prev.filter((p) => p !== lastAction.patch))
    } else if (lastAction.action === 'remove') {
      setPlacedPatches((prev) => [...prev.slice(0, lastAction.index), lastAction.patch, ...prev.slice(lastAction.index)])
    }
    setIsComplete(false)
    setTimerRunning(true)
  }

  const handleHint = () => {
    setToast({ message: 'Focus on cells near edges or corners first!', type: 'info' })
  }

  const handleReset = () => {
    setPlacedPatches([])
    setPatchHistory([])
    setIsComplete(false)
    setElapsedTime(0)
    setTimerRunning(true)
    setToast(null)
    setPreview(null)
    setDragStart(null)
    setIsDragging(false)
  }

  const handlePrevPuzzle = () => {
    setPuzzleIndex((prev) => (prev - 1 + getPatchesPuzzleCount()) % getPatchesPuzzleCount())
    handleReset()
  }

  const handleNextPuzzle = () => {
    setPuzzleIndex((prev) => (prev + 1) % getPatchesPuzzleCount())
    handleReset()
  }

  const handleShare = () => {
    const stars = state.scores.patches?.stars?.[puzzle.id] || 0
    const text = `Patches #${puzzleIndex + 1} ${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)} ⏱️ ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`
    navigator.clipboard.writeText(text).then(() => {
      setToast({ message: 'Copied to clipboard!', type: 'info' })
    })
  }

  const isCellCovered = (row, col) => {
    return placedPatches.some(
      (p) => row >= p.row && row < p.row + p.height && col >= p.col && col < p.col + p.width
    )
  }

  const getPatchForCell = (row, col) => {
    return placedPatches.find(
      (p) => row >= p.row && row < p.row + p.height && col >= p.col && col < p.col + p.width
    )
  }

  const isPreviewCell = (row, col) => {
    if (!preview || isDragging) return false
    return row >= preview.row && row < preview.row + preview.height &&
           col >= preview.col && col < preview.col + preview.width
  }

  const getPreviewValidation = () => {
    if (!preview) return null
    const { row, col, height, width } = preview
    if (height === 1 && width === 1) return null
    return validateRectanglePlacement(row, col, height, width, size, placedPatches, clues)
  }

  const rules = [
    'Each cell shows a shape icon and a number.',
    'Click and drag to draw a rectangle on the grid.',
    'The rectangle must match the shape type (square, wide, tall) and area of exactly one clue.',
    'No overlaps and no gaps — every cell must be covered exactly once.',
    'Tap a placed patch to remove it. Use Undo to step back.',
    'Faster solves earn more stars (⭐⭐⭐ under 1:30, ⭐⭐ under 3:00).',
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
            <span className="text-sm text-hub-textSecondary font-mono">Puzzle {puzzleIndex + 1}</span>
            <button onClick={handleNextPuzzle} className="p-2 rounded-lg hover:bg-hub-border transition-colors">
              <ChevronRight className="w-5 h-5 text-hub-text" />
            </button>
          </div>

          <Timer isRunning={timerRunning} onTimeUpdate={setElapsedTime} />

          <div className="flex items-center gap-1">
            <button onClick={() => setShowRules(true)} className="p-2 rounded-lg hover:bg-hub-border transition-colors" aria-label="Rules">
              <HelpCircle className="w-5 h-5 text-hub-text" />
            </button>
            <button onClick={handleReset} className="p-2 rounded-lg hover:bg-hub-border transition-colors" aria-label="Reset">
              <RefreshCw className="w-5 h-5 text-hub-text" />
            </button>
          </div>
        </div>

        <div
          ref={boardRef}
          className="grid gap-0 mx-auto cursor-crosshair border-2 border-hub-text bg-hub-card rounded-md shadow-sm overflow-hidden"
          style={{ 
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            backgroundImage: `linear-gradient(to right, var(--border-color) 1px, transparent 1px), linear-gradient(to bottom, var(--border-color) 1px, transparent 1px)`,
            backgroundSize: `calc(100% / ${size}) calc(100% / ${size})`,
            backgroundPosition: '-1px -1px'
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {Array.from({ length: size }).map((_, r) =>
            Array.from({ length: size }).map((_, c) => {
              const key = `${r},${c}`
              const clue = clues.find((cl) => cl.row === r && cl.col === c)
              const patch = getPatchForCell(r, c)
              const covered = isCellCovered(r, c)
              const isPreview = isPreviewCell(r, c)
              const previewValidation = isPreview ? getPreviewValidation() : null

              let patchClass = ''
              let zIndex = 'z-0'

              if (patch) {
                const patchIdx = placedPatches.indexOf(patch)
                patchClass = getPatchColor(patchIdx) + ' border-[1px] border-hub-bg/20'
                zIndex = 'z-10'
              } else if (isPreview) {
                if (previewValidation?.valid) {
                  patchClass = 'bg-green-500/30 border border-green-400'
                  zIndex = 'z-20'
                } else {
                  patchClass = 'bg-red-500/30 border border-red-400'
                  zIndex = 'z-20'
                }
              }

              // Determine if we need to show thick borders around patches
              let borders = ''
              if (patch) {
                if (r === patch.row) borders += ' border-t-2 '
                if (r === patch.row + patch.height - 1) borders += ' border-b-2 '
                if (c === patch.col) borders += ' border-l-2 '
                if (c === patch.col + patch.width - 1) borders += ' border-r-2 '
              }

              return (
                <div
                  key={key}
                  className={`
                    relative aspect-square flex items-center justify-center text-xs font-bold
                    transition-colors duration-100 ${zIndex} border-dashed border-hub-border/50 border
                  `}
                >
                  {/* Fill patch background over the grid cell */}
                  {patchClass && (
                    <div className={`absolute inset-0 ${patchClass} ${borders} shadow-inner`}></div>
                  )}

                  {clue && !covered ? (
                    <div className="flex flex-col items-center justify-center gap-1 z-10 text-hub-textSecondary">
                      <ShapeIcon shape={clue.shape} />
                      <span className="font-mono text-sm">{clue.count}</span>
                    </div>
                  ) : null}
                  {clue && covered && (
                     <div className="flex flex-col items-center justify-center gap-1 z-10 opacity-70">
                       <span className="font-mono text-sm mix-blend-plus-lighter">{clue.count}</span>
                     </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button 
            onClick={handleUndo}
            disabled={patchHistory.length === 0}
            className="flex-1 py-3 px-6 rounded-full bg-gray-200 dark:bg-gray-800 text-hub-text font-mono hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button 
            onClick={handleHint}
            className="flex-1 py-3 px-6 rounded-full border-2 border-hub-text text-hub-text font-mono hover:bg-hub-border transition-colors"
          >
            Hint
          </button>
        </div>

        {isComplete && (
          <div className="mt-4 flex justify-center animate-fade-in">
            <button 
              onClick={handleShare}
              className="w-full py-4 px-6 rounded-full bg-gray-800 dark:bg-gray-700 text-white font-bold hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>See results</span>
              <span className="text-yellow-400 text-lg">
                {'⭐'.repeat(state.scores.patches?.stars?.[puzzle.id] || 0)}
              </span>
            </button>
          </div>
        )}

        <div className="mt-8 border border-hub-border bg-hub-card rounded-xl p-6 text-sm text-hub-text font-mono">
          <p className="text-center font-bold mb-6">Complete each shape to fill the grid</p>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 max-w-xs mx-auto mb-6">
            <div className="flex items-center gap-3">
              <ShapeIcon shape="square" />
              <span>Square</span>
            </div>
            <div className="flex items-center gap-3">
              <ShapeIcon shape="tall" />
              <span>Tall rectangle</span>
            </div>
            <div className="flex items-center gap-3">
              <ShapeIcon shape="wide" />
              <span>Wide rectangle</span>
            </div>
            <div className="flex items-center gap-3">
              <ShapeIcon shape="any" />
              <span>Any of the above</span>
            </div>
          </div>
          <p className="text-center text-hub-textSecondary text-xs">If a shape has a number, it must be that size.</p>
        </div>

      </main>

      <RulesDialog
        open={showRules}
        onOpenChange={setShowRules}
        title="How to Play Patches"
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