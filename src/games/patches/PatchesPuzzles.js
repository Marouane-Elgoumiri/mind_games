const PUZZLES = [
  {
    id: 'patches-1',
    size: 6,
    clues: [
      { row: 0, col: 0, shape: 'square', count: 4 },
      { row: 0, col: 3, shape: 'wide', count: 3 },
      { row: 1, col: 5, shape: 'tall', count: 3 },
      { row: 2, col: 2, shape: 'wide', count: 6 },
      { row: 3, col: 1, shape: 'square', count: 4 },
      { row: 4, col: 4, shape: 'tall', count: 6 },
      { row: 5, col: 0, shape: 'wide', count: 3 },
      { row: 5, col: 4, shape: 'square', count: 4 },
    ],
    solution: [
      { row: 0, col: 0, height: 2, width: 2 },
      { row: 0, col: 3, height: 1, width: 3 },
      { row: 1, col: 5, height: 3, width: 1 },
      { row: 2, col: 0, height: 2, width: 3 },
      { row: 3, col: 1, height: 2, width: 2 },
      { row: 4, col: 3, height: 2, width: 3 },
      { row: 5, col: 0, height: 1, width: 3 },
      { row: 3, col: 4, height: 1, width: 2 },
    ],
  },
  {
    id: 'patches-2',
    size: 6,
    clues: [
      { row: 0, col: 1, shape: 'wide', count: 6 },
      { row: 0, col: 4, shape: 'square', count: 4 },
      { row: 1, col: 0, shape: 'tall', count: 4 },
      { row: 2, col: 3, shape: 'wide', count: 3 },
      { row: 3, col: 2, shape: 'square', count: 9 },
      { row: 4, col: 0, shape: 'wide', count: 2 },
      { row: 5, col: 5, shape: 'tall', count: 2 },
    ],
    solution: [
      { row: 0, col: 0, height: 1, width: 6 },
      { row: 1, col: 4, height: 2, width: 2 },
      { row: 1, col: 0, height: 4, width: 1 },
      { row: 2, col: 3, height: 1, width: 3 },
      { row: 3, col: 1, height: 3, width: 3 },
      { row: 4, col: 0, height: 1, width: 1 },
      { row: 5, col: 5, height: 1, width: 1 },
    ],
  },
  {
    id: 'patches-3',
    size: 6,
    clues: [
      { row: 0, col: 0, shape: 'tall', count: 6 },
      { row: 0, col: 2, shape: 'square', count: 4 },
      { row: 0, col: 5, shape: 'tall', count: 3 },
      { row: 2, col: 1, shape: 'wide', count: 6 },
      { row: 3, col: 3, shape: 'square', count: 4 },
      { row: 4, col: 0, shape: 'wide', count: 3 },
      { row: 4, col: 4, shape: 'tall', count: 4 },
      { row: 5, col: 2, shape: 'wide', count: 2 },
    ],
    solution: [
      { row: 0, col: 0, height: 6, width: 1 },
      { row: 0, col: 1, height: 2, width: 2 },
      { row: 0, col: 5, height: 3, width: 1 },
      { row: 2, col: 1, height: 1, width: 6 },
      { row: 3, col: 3, height: 2, width: 2 },
      { row: 4, col: 0, height: 1, width: 3 },
      { row: 3, col: 4, height: 2, width: 1 },
      { row: 5, col: 2, height: 1, width: 2 },
    ],
  },
]

export function getPatchesPuzzle(index = 0) {
  return PUZZLES[index % PUZZLES.length]
}

export function getPatchesPuzzleCount() {
  return PUZZLES.length
}

export function validateRectanglePlacement(row, col, height, width, size, placedPatches, clues) {
  if (row < 0 || col < 0 || row + height > size || col + width > size) {
    return { valid: false, reason: 'Out of bounds' }
  }

  const area = height * width
  const isSquare = height === width
  const isWide = width > height
  const isTall = height > width

  for (const clue of clues) {
    if (clue.row >= row && clue.row < row + height && clue.col >= col && clue.col < col + width) {
      if (clue.count !== area) {
        return { valid: false, reason: `Area must be ${clue.count}` }
      }

      if (clue.shape === 'square' && !isSquare) {
        return { valid: false, reason: 'Must be a square' }
      }
      if (clue.shape === 'wide' && !isWide) {
        return { valid: false, reason: 'Must be wider than tall' }
      }
      if (clue.shape === 'tall' && !isTall) {
        return { valid: false, reason: 'Must be taller than wide' }
      }

      break
    }
  }

  for (const patch of placedPatches) {
    const overlap = !(row + height <= patch.row || patch.row + patch.height <= row ||
                      col + width <= patch.col || patch.col + patch.width <= col)
    if (overlap) {
      return { valid: false, reason: 'Overlaps with another patch' }
    }
  }

  return { valid: true }
}

export function isPatchesSolved(placedPatches, size) {
  const grid = Array(size).fill(null).map(() => Array(size).fill(false))

  for (const patch of placedPatches) {
    for (let r = patch.row; r < patch.row + patch.height; r++) {
      for (let c = patch.col; c < patch.col + patch.width; c++) {
        if (grid[r][c]) return false
        grid[r][c] = true
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) return false
    }
  }

  return true
}

export function getShapeIcon(shape) {
  switch (shape) {
    case 'square': return '⬜'
    case 'wide': return '▬'
    case 'tall': return '▮'
    default: return '⬜'
  }
}

export function getPatchColor(index) {
  const colors = [
    'bg-[#f97316] border-[#ea580c] dark:bg-[#c2410c] dark:border-[#9a3412] text-white shadow-sm', // Orange
    'bg-[#3b82f6] border-[#2563eb] dark:bg-[#1d4ed8] dark:border-[#1e40af] text-white shadow-sm', // Blue
    'bg-[#a855f7] border-[#9333ea] dark:bg-[#7e22ce] dark:border-[#6b21a8] text-white shadow-sm', // Purple
    'bg-[#22c55e] border-[#16a34a] dark:bg-[#15803d] dark:border-[#166534] text-white shadow-sm', // Green
    'bg-[#ef4444] border-[#dc2626] dark:bg-[#b91c1c] dark:border-[#991b1b] text-white shadow-sm', // Red
    'bg-[#eab308] border-[#d97706] dark:bg-[#b45309] dark:border-[#92400e] text-white shadow-sm', // Yellow
    'bg-[#06b6d4] border-[#0891b2] dark:bg-[#0e7490] dark:border-[#155e75] text-white shadow-sm', // Cyan
    'bg-[#ec4899] border-[#db2777] dark:bg-[#be185d] dark:border-[#9d174d] text-white shadow-sm', // Pink
  ]
  return colors[index % colors.length]
}