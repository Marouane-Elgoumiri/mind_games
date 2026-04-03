import { useState, useCallback, useRef, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { Header } from '../../components/Header'
import { Timer } from '../../components/common/Timer'
import { Toast } from '../../components/common/Toast'
import { getZipPuzzle, getZipPuzzleCount, isZipSolved, validateZipPath } from './ZipPuzzles'
import { RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { WinDialog } from '../../components/common/Dialog'

function ZipHowToPlay() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="mt-8 border border-hub-border rounded-xl bg-hub-card overflow-hidden transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-hub-text font-semibold hover:bg-hub-bg transition-colors"
      >
        <span>How to play</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-hub-textSecondary" /> : <ChevronDown className="w-5 h-5 text-hub-textSecondary" />}
      </button>
      {isOpen && (
        <div className="p-6 border-t border-hub-border bg-hub-bg flex flex-col sm:flex-row gap-8 justify-around items-start sm:items-center text-sm text-hub-text font-mono">
          <div className="flex flex-col items-center gap-4">
             <div className="flex items-center">
               <div className="w-8 h-8 rounded-full bg-hub-text text-hub-bg flex items-center justify-center text-sm font-bold z-10 relative">1</div>
               <div className="w-6 h-3 bg-blue-600 dark:bg-purple-600 -mx-1 relative z-0"></div>
               <div className="w-8 h-8 rounded-full bg-hub-text text-hub-bg flex items-center justify-center text-sm font-bold z-10 relative">2</div>
               <div className="w-6 h-3 bg-blue-600 dark:bg-purple-600 -mx-1 relative z-0"></div>
               <div className="w-8 h-8 rounded-full bg-hub-text text-hub-bg flex items-center justify-center text-sm font-bold z-10 relative">3</div>
             </div>
             <p className="text-center">Connect the<br/>dots in order</p>
          </div>
          <div className="flex flex-col items-center gap-4">
             <div className="grid grid-cols-3 gap-0 border-2 border-hub-text p-0.5 rounded-lg bg-hub-card">
               <div className="w-5 h-5 bg-blue-600 dark:bg-purple-600 border border-white/20"></div>
               <div className="w-5 h-5 bg-blue-600 dark:bg-purple-600 border border-white/20"></div>
               <div className="w-5 h-5 bg-blue-600 dark:bg-purple-600 border border-white/20"></div>
               <div className="w-5 h-5 bg-blue-600 dark:bg-purple-600 border border-white/20"></div>
               <div className="w-5 h-5 bg-transparent border border-hub-border"></div>
               <div className="w-5 h-5 bg-blue-600 dark:bg-purple-600 border border-white/20"></div>
               <div className="w-5 h-5 bg-blue-600 dark:bg-purple-600 border border-white/20"></div>
               <div className="w-5 h-5 bg-blue-600 dark:bg-purple-600 border border-white/20"></div>
               <div className="w-5 h-5 bg-blue-600 dark:bg-purple-600 border border-white/20"></div>
             </div>
             <p className="text-center">Fill every cell</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function ZipGame() {
  const { recordWin, setStars } = useGame()
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = getZipPuzzle(puzzleIndex)
  const { size, numbers } = puzzle

  const [path, setPath] = useState([])
  const [currentPointer, setCurrentPointer] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showWinDialog, setShowWinDialog] = useState(false)
  const [stars, setStarsCount] = useState(0)
  const [toast, setToast] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerRunning, setTimerRunning] = useState(true)
  const boardRef = useRef(null)

  // Check for win condition
  useEffect(() => {
    if (!isComplete && isZipSolved(path, numbers, size)) {
      setIsComplete(true)
      setTimerRunning(false)
      recordWin('zip', elapsedTime, puzzle.id)
      
      const starRating = elapsedTime < 60 ? 3 : elapsedTime < 120 ? 2 : 1
      setStars('zip', puzzle.id, starRating)
      setStarsCount(starRating)
      setShowWinDialog(true)
      setToast({ message: '🎉 Path complete! Puzzle solved!', type: 'success' })
    }
  }, [path, numbers, size, isComplete, elapsedTime, recordWin, setStars, puzzle.id])

  const getCellFromEvent = useCallback((e) => {
    if (!boardRef.current) return null
    const rect = boardRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const cellSize = rect.width / size
    const col = Math.floor((clientX - rect.left) / cellSize)
    const row = Math.floor((clientY - rect.top) / cellSize)
    
    // Store exact pointer position for smooth drawing
    const px = clientX - rect.left
    const py = clientY - rect.top

    if (row < 0 || row >= size || col < 0 || col >= size) return { row, col, px, py, outOfBounds: true }
    return { row, col, px, py, outOfBounds: false }
  }, [size])

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    if (isComplete) return
    const result = getCellFromEvent(e)
    if (!result || result.outOfBounds) return
    
    // Must start the path at tile '1'
    if (path.length === 0 && numbers[result.row][result.col] !== 1) {
      return
    }

    // If starting a new drawing, check if we are picking up from the end of an existing path
    if (path.length > 0) {
      const [lastRow, lastCol] = path[path.length - 1]
      // Only allow resuming from the last drawn cell
      if (lastRow !== result.row || lastCol !== result.col) {
        return
      }
    } else {
      setPath([[result.row, result.col]])
    }

    setIsDrawing(true)
    setCurrentPointer({ x: result.px, y: result.py })
  }, [isComplete, getCellFromEvent, numbers, path])

  const handlePointerMove = useCallback((e) => {
    e.preventDefault()
    if (!isDrawing || isComplete) return
    const result = getCellFromEvent(e)
    if (!result) return

    const { row, col, px, py, outOfBounds } = result
    setCurrentPointer({ x: px, y: py })

    if (outOfBounds) return

    setPath((prev) => {
      if (prev.length === 0) return [[row, col]]

      const lastCell = prev[prev.length - 1]
      
      // Check if we are moving BACK to the previous cell (instant scrubbing)
      if (prev.length > 1) {
        const secondToLast = prev[prev.length - 2]
        if (secondToLast[0] === row && secondToLast[1] === col) {
          // Check distance to center of current cell (backtracking)
          const rect = boardRef.current.getBoundingClientRect()
          const cellSize = rect.width / size
          const targetX = col * cellSize + cellSize / 2
          const targetY = row * cellSize + cellSize / 2
          const dist = Math.sqrt(Math.pow(px - targetX, 2) + Math.pow(py - targetY, 2))
          
          // If we are closer to the previous cell than the current one, pop
          if (dist < cellSize * 0.45) {
             return prev.slice(0, -1)
          }
        }
      }

      if (lastCell[0] === row && lastCell[1] === col) return prev

      // Magnetic Snapping: Check distance to the center of the target cell
      const rect = boardRef.current.getBoundingClientRect()
      const cellSize = rect.width / size
      const targetX = col * cellSize + cellSize / 2
      const targetY = row * cellSize + cellSize / 2
      const distToCenter = Math.sqrt(Math.pow(px - targetX, 2) + Math.pow(py - targetY, 2))

      // Only add cell if we are sufficiently "inside" or "moving towards" it (magnetic feel)
      if (distToCenter > cellSize * 0.4) return prev

      const alreadyInPath = prev.some(([r, c]) => r === row && c === col)
      if (alreadyInPath) {
        const idx = prev.findIndex(([r, c]) => r === row && c === col)
        return prev.slice(0, idx + 1)
      }

      const [lr, lc] = lastCell
      if (Math.abs(lr - row) + Math.abs(lc - col) !== 1) return prev

      const newPath = [...prev, [row, col]]

      if (!validateZipPath(newPath, numbers, size)) {
        return prev
      }

      return newPath
    })
  }, [isDrawing, isComplete, getCellFromEvent, numbers, size])

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)
    setCurrentPointer(null)
  }, [isDrawing])

  const handleReset = () => {
    setPath([])
    setCurrentPointer(null)
    setIsDrawing(false)
    setIsComplete(false)
    setElapsedTime(0)
    setTimerRunning(true)
    setToast(null)
    setShowWinDialog(false)
    setStarsCount(0)
  }

  const handleUndo = () => {
    setPath((prev) => prev.slice(0, -1))
  }

  const handlePrevPuzzle = () => {
    setPuzzleIndex((prev) => (prev - 1 + getZipPuzzleCount()) % getZipPuzzleCount())
    handleReset()
  }

  const handleNextPuzzle = () => {
    setPuzzleIndex((prev) => (prev + 1) % getZipPuzzleCount())
    handleReset()
  }

  const handleHint = () => {
    setToast({ message: 'Try starting from number 1 and follow the path logically!', type: 'info' })
  }

  const renderSVGPath = () => {
    if (path.length === 0 || !boardRef.current) return null
    
    const rect = boardRef.current.getBoundingClientRect()
    const cellSize = rect.width / size
    const halfCell = cellSize / 2

    const getCoord = ([r, c]) => ({
      x: c * cellSize + halfCell,
      y: r * cellSize + halfCell
    })

    let d = ""
    path.forEach((cell, i) => {
      const { x, y } = getCoord(cell)
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
    })

    if (isDrawing && currentPointer && path.length > 0) {
      d += ` L ${currentPointer.x} ${currentPointer.y}`
    }

    const lastCoord = path.length > 0 ? getCoord(path[path.length - 1]) : null

    return (
      <svg className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-2xl" width="100%" height="100%">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa">
              <animate attributeName="offset" values="-1; 1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#a855f7">
              <animate attributeName="offset" values="0; 2" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#ec4899">
              <animate attributeName="offset" values="1; 3" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glowStrong">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          d={d}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth={isComplete ? cellSize * 0.95 : cellSize * 0.45}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={isComplete ? "url(#glowStrong)" : "url(#glow)"}
          className="transition-all duration-1000 ease-in-out"
        />
        {/* Pulsing Head Marker */}
        {!isComplete && isDrawing && lastCoord && (
          <>
            <circle 
              cx={lastCoord.x} 
              cy={lastCoord.y} 
              r={cellSize * 0.25} 
              fill="#ec4899" 
              className="zip-head-pulse"
            />
            <circle 
              cx={lastCoord.x} 
              cy={lastCoord.y} 
              r={cellSize * 0.1} 
              fill="white" 
            />
          </>
        )}
      </svg>
    )
  }

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

          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="p-2 rounded-lg hover:bg-hub-border transition-colors" aria-label="Reset">
              <RefreshCw className="w-5 h-5 text-hub-text" />
            </button>
          </div>
        </div>

        <div
          ref={boardRef}
          className={`
            relative grid mx-auto cursor-crosshair border rounded-2xl overflow-hidden shadow-2xl
            transition-all duration-1000 ease-in-out
            ${isComplete 
              ? 'border-purple-500/50 shadow-purple-500/20 bg-hub-card scale-[1.02]' 
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
          {renderSVGPath()}
          {Array.from({ length: size }).map((_, r) =>
            Array.from({ length: size }).map((_, c) => {
              const key = `${r},${c}`
              const number = numbers[r][c]
              const isNumbered = number > 0
              const pathIdx = path.findIndex(([pr, pc]) => pr === r && pc === c)
              const isVisited = pathIdx !== -1
              const isHead = isVisited && pathIdx === path.length - 1
              
              const isLastRow = r === size - 1
              const isLastCol = c === size - 1

              return (
                <div
                  key={key}
                  className={`
                    relative aspect-square flex items-center justify-center
                    transition-all duration-300
                    ${!isLastRow ? 'border-b border-hub-border/10' : ''}
                    ${!isLastCol ? 'border-r border-hub-border/10' : ''}
                  `}
                >
                  {/* Grid intersection point (subtle dot) */}
                  {!isNumbered && (
                    <div className={`
                      w-1.5 h-1.5 rounded-full transition-all duration-300 
                      ${isVisited ? 'scale-0 opacity-0' : 'bg-hub-text/10'}
                      ${isVisited && 'zip-cell-hit'}
                    `} />
                  )}

                  {/* Checkpoint / Numbered Cell */}
                  {isNumbered && (
                    <div className={`
                      relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full 
                      flex items-center justify-center font-mono text-lg font-black
                      transition-all duration-500 border-2
                      ${isVisited 
                        ? 'bg-hub-text text-hub-bg border-hub-text scale-105 shadow-md' 
                        : 'bg-hub-bg text-hub-text border-hub-border hover:border-hub-text/40'}
                      ${isHead && !isComplete ? 'ring-4 ring-hub-accent/30' : ''}
                    `}>
                      {number}
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
            disabled={path.length === 0}
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

        <ZipHowToPlay />
      </main>

      <WinDialog 
        open={showWinDialog}
        onOpenChange={setShowWinDialog}
        stars={stars}
        time={elapsedTime}
        onNext={handleNextPuzzle}
        gameTitle="Zip"
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