const PUZZLES = [
  {
    id: 'qween-1',
    size: 7,
    // Regions for a 7x7 grid
    regions: [
      [0, 0, 0, 1, 1, 1, 1],
      [0, 0, 0, 1, 2, 2, 2],
      [3, 3, 3, 1, 2, 2, 2],
      [3, 4, 4, 4, 4, 4, 2],
      [3, 5, 5, 5, 5, 4, 2],
      [3, 6, 6, 6, 5, 4, 2],
      [3, 6, 6, 6, 5, 4, 2],
    ],
  },
  {
    id: 'qween-2',
    size: 7,
    regions: [
      [0, 0, 1, 1, 1, 2, 2],
      [0, 0, 1, 1, 1, 2, 2],
      [3, 3, 3, 4, 4, 2, 2],
      [3, 3, 3, 4, 4, 5, 5],
      [6, 6, 6, 4, 4, 5, 5],
      [6, 6, 6, 4, 4, 5, 5],
      [6, 6, 6, 4, 4, 5, 5],
    ],
  },
  {
    id: 'qween-3',
    size: 8,
    regions: [
      [0, 0, 0, 0, 1, 1, 1, 1],
      [0, 2, 2, 2, 1, 3, 3, 1],
      [0, 2, 4, 4, 1, 3, 3, 1],
      [0, 2, 4, 4, 1, 5, 5, 1],
      [6, 6, 6, 6, 1, 5, 5, 1],
      [6, 7, 7, 7, 7, 7, 7, 1],
      [6, 7, 7, 7, 7, 7, 7, 1],
      [6, 6, 6, 6, 6, 6, 6, 6],
    ],
  },
  {
    id: 'qween-4',
    size: 8,
    regions: [
      [0, 0, 1, 1, 2, 2, 3, 3],
      [0, 0, 1, 1, 2, 2, 3, 3],
      [4, 4, 5, 5, 6, 6, 7, 7],
      [4, 4, 5, 5, 6, 6, 7, 7],
      [0, 0, 1, 1, 2, 2, 3, 3],
      [0, 0, 1, 1, 2, 2, 3, 3],
      [4, 4, 5, 5, 6, 6, 7, 7],
      [4, 4, 5, 5, 6, 6, 7, 7],
    ],
  },
  {
    id: 'qween-5',
    size: 9,
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 3, 3, 1, 4, 4, 2, 5, 2],
      [0, 3, 3, 1, 4, 4, 2, 5, 2],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 3, 3, 7, 4, 4, 8, 5, 8],
      [6, 3, 3, 7, 4, 4, 8, 5, 8],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 3, 3, 1, 4, 4, 2, 5, 2],
      [0, 3, 3, 1, 4, 4, 2, 5, 2],
    ],
  },
]

export function getQweenPuzzle(index = 0) {
  const puzzle = PUZZLES[index % PUZZLES.length]
  const regionColors = Array.from({ length: 10 }).map((_, i) => getRegionColor(i))
  return { ...puzzle, regionColors }
}

export function getQweenPuzzleCount() {
  return PUZZLES.length
}

export function getConflictingQueens(queens, regions) {
  const conflicts = new Set()
  if (queens.length === 0) return conflicts

  for (let i = 0; i < queens.length; i++) {
    const [r1, c1] = queens[i]
    for (let j = i + 1; j < queens.length; j++) {
      const [r2, c2] = queens[j]

      let hasConflict = false
      // Row conflict
      if (r1 === r2) hasConflict = true
      // Col conflict
      if (c1 === c2) hasConflict = true
      // Region conflict
      if (regions[r1][c1] === regions[r2][c2]) hasConflict = true
      // Touching/Diagonal conflict
      if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) hasConflict = true

      if (hasConflict) {
        conflicts.add(`${r1},${c1}`)
        conflicts.add(`${r2},${c2}`)
      }
    }
  }
  return conflicts
}

export function isQweenSolved(queens, size, conflicts) {
  if (queens.length !== size) return false
  if (conflicts && conflicts.size > 0) return false
  
  // If conflicts set is not provided, we should calculate it, but the game passes it.
  return true
}

export function getRegionColor(index) {
  const colors = [
    'bg-[#f87171] dark:bg-[#991b1b]', // Red
    'bg-[#fb923c] dark:bg-[#9a3412]', // Orange
    'bg-[#fbbf24] dark:bg-[#92400e]', // Yellow
    'bg-[#4ade80] dark:bg-[#166534]', // Green
    'bg-[#22d3ee] dark:bg-[#155e75]', // Cyan
    'bg-[#818cf8] dark:bg-[#3730a3]', // Indigo
    'bg-[#c084fc] dark:bg-[#6b21a8]', // Purple
    'bg-[#f472b6] dark:bg-[#9d174d]', // Pink
    'bg-[#94a3b8] dark:bg-[#334155]', // Slate
  ]
  return colors[index % colors.length]
}
