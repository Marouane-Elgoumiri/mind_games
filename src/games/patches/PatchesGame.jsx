import { useState, useCallback, useRef, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { Header } from '../../components/Header'
import { Timer } from '../../components/common/Timer'
import { Toast } from '../../components/common/Toast'
import { RulesDialog, WinDialog } from '../../components/common/Dialog'
import {
  getPatchesPuzzle,
  getPatchesPuzzleCount,
  validateRectanglePlacement,
  isPatchesSolved,
  getPatchColor,
} from './PatchesPuzzles'
import PropTypes from 'prop-types'
import { HelpCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

function ShapeIcon({ shape, color = 'rgba(0,0,0,0.15)' }) {
  const baseClass = "w-full h-full flex items-center justify-center transition-opacity duration-300"
  
  if (shape === 'square') {
    return (
      <div className={baseClass}>
        <div 
          className="w-[70%] h-[70%] rounded-md" 
          style={{ backgroundColor: color }}
        />
      </div>
    )
  }
  if (shape === 'wide') {
    return (
      <div className={baseClass}>
        <div 
          className="w-[85%] h-[45%] rounded-md" 
          style={{ backgroundColor: color }}
        />
      </div>
    )
  }
  if (shape === 'tall') {
    return (
      <div className={baseClass}>
        <div 
          className="w-[45%] h-[85%] rounded-md" 
          style={{ backgroundColor: color }}
        />
      </div>
    )
  }
  return (
    <div className={baseClass}>
      <div 
        className="w-[70%] h-[70%] rounded-md border-2 border-dashed border-black/20" 
      />
    </div>
  )
}

ShapeIcon.propTypes = {
  shape: PropTypes.string.isRequired,
  color: PropTypes.string,
}

export function PatchesGame() {
  const { recordWin, setStars } = useGame()
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
  const [stars, setStarsCount] = useState(0)
  const [showWinDialog, setShowWinDialog] = useState(false)
  const [preview, setPreview] = useState(null)
  const [dragStart, setDragStart] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const boardRef = useRef(null)

  // Check for win condition
  useEffect(() => {
    if (!isComplete && isPatchesSolved(placedPatches, size)) {
      setIsComplete(true)
      setTimerRunning(false)
      recordWin('patches', elapsedTime, puzzle.id)
      
      const starRating = elapsedTime < 90 ? 3 : elapsedTime < 180 ? 2 : 1
      setStars('patches', puzzle.id, starRating)
      setStarsCount(starRating)
      setShowWinDialog(true)
      setToast({ message: '🎉 Puzzle solved! All patches placed correctly.', type: 'success' })
    }
  }, [placedPatches, size, isComplete, elapsedTime, recordWin, setStars, puzzle.id])

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

    // If tapping on an existing patch, remove it
    const existingPatch = placedPatches.find(
      (p) => cell[0] >= p.row && cell[0] < p.row + p.height && cell[1] >= p.col && cell[1] < p.col + p.width
    )
    if (existingPatch && !isDragging) {
      const idx = placedPatches.indexOf(existingPatch)
      setPlacedPatches(prev => prev.filter(p => p !== existingPatch))
      setPatchHistory(prev => [...prev, { action: 'remove', patch: existingPatch, index: idx }])
      return
    }

    setIsDragging(true)
    setDragStart(cell)
    setPreview({ row: cell[0], col: cell[1], height: 1, width: 1 })
  }, [isComplete, getCellFromEvent, placedPatches, isDragging])

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

    // Minimum size check (1x1 is only allowed if it's a valid clue area)
    const validation = validateRectanglePlacement(row, col, height, width, size, placedPatches, clues)

    if (!validation.valid) {
      return
    }

    const newPatch = { row, col, height, width }
    setPlacedPatches(prev => [...prev, newPatch])
    setPatchHistory(prev => [...prev, { action: 'place', patch: newPatch }])
  }, [isDragging, preview, size, placedPatches, clues])

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
    setShowWinDialog(false)
    setStarsCount(0)
  }

  const handlePrevPuzzle = () => {
    setPuzzleIndex((prev) => (prev - 1 + getPatchesPuzzleCount()) % getPatchesPuzzleCount())
    handleReset()
  }

  const handleNextPuzzle = () => {
    setPuzzleIndex((prev) => (prev + 1) % getPatchesPuzzleCount())
    handleReset()
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
    if (!preview) return false
    return row >= preview.row && row < preview.row + preview.height &&
           col >= preview.col && col < preview.col + preview.width
  }

  const rules = [
    'Each numbered shape indicates the size and orientation of its region.',
    'Click and drag to define a rectangular patch.',
    'Each patch must contain exactly one clue and match its size/type.',
    'Fill the entire grid without overlaps to solve the puzzle.',
    'Tap a patch to remove it. Earn stars for fast solves!',
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
          className={`
            relative grid gap-0 mx-auto cursor-crosshair border rounded-2xl overflow-hidden shadow-2xl transition-all duration-1000 ease-in-out
            ${isComplete 
              ? 'border-purple-500/50 shadow-purple-500/30 scale-[1.02]' 
              : 'border-hub-border bg-hub-card'}
          `}
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
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
              const isVisited = isCellCovered(r, c)
              const isPreview = isPreviewCell(r, c)
              
              const isLastRow = r === size - 1
              const isLastCol = c === size - 1

              let patchClass = ''
              if (patch) {
                const patchIdx = placedPatches.indexOf(patch)
                patchClass = getPatchColor(patchIdx)
              } else if (isPreview) {
                const previewValidation = validateRectanglePlacement(preview.row, preview.col, preview.height, preview.width, size, placedPatches, clues)
                patchClass = previewValidation.valid ? 'bg-blue-400/30 border-2 border-blue-400/50' : 'bg-red-400/30 border-2 border-red-400/50'
              }

              let borders = ''
              if (patch) {
                // Thinner borders between same-patch cells, thicker at patch boundaries
                if (r === patch.row) borders += ' border-t-2 '
                if (r === patch.row + patch.height - 1) borders += ' border-b-2 '
                if (c === patch.col) borders += ' border-l-2 '
                if (c === patch.col + patch.width - 1) borders += ' border-r-2 '
              } else if (isPreview) {
                if (r === preview.row) borders += ' border-t-2 '
                if (r === preview.row + preview.height - 1) borders += ' border-b-2 '
                if (c === preview.col) borders += ' border-l-2 '
                if (c === preview.col + preview.width - 1) borders += ' border-r-2 '
              }

              return (
                <div
                  key={key}
                  className={`
                    relative aspect-square flex items-center justify-center transition-all duration-500
                    ${!isLastRow && !isComplete ? 'border-b border-hub-border/10' : ''}
                    ${!isLastCol && !isComplete ? 'border-r border-hub-border/10' : ''}
                  `}
                >
                  {/* Visual dot at intersection when not complete */}
                  {!isComplete && !patch && !isPreview && (
                    <div className="absolute top-0 left-0 w-1 h-1 -translate-x-1/2 -translate-y-1/2 bg-hub-text/5 rounded-full" />
                  )}

                  {patchClass && (
                    <div className={`
                      absolute inset-0 z-10 ${patchClass} ${borders} transition-all duration-300 rounded-[1px]
                      ${isComplete ? 'shadow-lg border-opacity-40' : ''}
                    `}></div>
                  )}

                  {clue && (
                    <div className={`
                      relative z-20 flex items-center justify-center w-full h-full transition-all duration-700
                      ${isVisited ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}
                    `}>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <ShapeIcon shape={clue.shape} color={isVisited ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} />
                      </div>
                      <span className={`
                        relative z-30 text-lg font-black font-mono transition-colors duration-500
                        ${isVisited ? 'text-white' : 'text-hub-text/70'}
                      `}>
                        {clue.count}
                      </span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button 
            onClick={handleUndo}
            disabled={patchHistory.length === 0}
            className="py-4 rounded-2xl bg-hub-card border border-hub-border text-hub-text font-bold hover:bg-hub-bg transition-all disabled:opacity-50 shadow-sm"
          >
            Undo
          </button>
          <button 
            onClick={handleHint}
            className="py-4 rounded-2xl border-2 border-hub-text text-hub-text font-bold hover:bg-hub-border transition-all shadow-sm"
          >
            Hint
          </button>
        </div>

        <div className="mt-10 p-6 rounded-3xl bg-hub-card border border-hub-border shadow-inner space-y-4">
          <h3 className="text-center font-black text-hub-text uppercase tracking-widest text-xs">Clue Legend</h3>
          <div className="flex justify-around items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10"><ShapeIcon shape="square" /></div>
              <span className="text-[10px] uppercase font-bold text-hub-textSecondary">Square</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10"><ShapeIcon shape="wide" /></div>
              <span className="text-[10px] uppercase font-bold text-hub-textSecondary">Wide</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10"><ShapeIcon shape="tall" /></div>
              <span className="text-[10px] uppercase font-bold text-hub-textSecondary">Tall</span>
            </div>
          </div>
        </div>
      </main>

      <WinDialog 
        open={showWinDialog}
        onOpenChange={setShowWinDialog}
        stars={stars}
        time={elapsedTime}
        onNext={handleNextPuzzle}
        gameTitle="Patches"
      />


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