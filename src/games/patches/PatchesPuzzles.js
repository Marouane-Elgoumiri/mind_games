const PUZZLES = [
  {
    id: 'patches-1',
    size: 5,
    clues: [
      { row: 0, col: 0, shape: 'square', count: 4 },
      { row: 0, col: 2, shape: 'tall', count: 2 },
      { row: 0, col: 3, shape: 'wide', count: 2 },
      { row: 1, col: 3, shape: 'tall', count: 4 },
      { row: 1, col: 4, shape: 'tall', count: 4 },
      { row: 2, col: 0, shape: 'wide', count: 6 },
      { row: 4, col: 0, shape: 'wide', count: 3 },
    ],
  },
  {
    id: 'patches-2',
    size: 5,
    clues: [
      { row: 0, col: 0, shape: 'wide', count: 5 },
      { row: 1, col: 0, shape: 'tall', count: 4 },
      { row: 1, col: 1, shape: 'square', count: 4 },
      { row: 1, col: 3, shape: 'square', count: 4 },
      { row: 3, col: 1, shape: 'square', count: 4 },
      { row: 3, col: 3, shape: 'square', count: 4 },
    ],
  },
  {
    id: 'patches-3',
    size: 5,
    clues: [
      { row: 1, col: 1, shape: 'square', count: 9 },
      { row: 0, col: 3, shape: 'square', count: 4 },
      { row: 2, col: 3, shape: 'wide', count: 2 },
      { row: 3, col: 0, shape: 'square', count: 4 },
      { row: 3, col: 2, shape: 'tall', count: 2 },
      { row: 3, col: 3, shape: 'square', count: 4 },
    ],
  },
  {
    id: 'patches-4',
    size: 5,
    clues: [
      { row: 0, col: 2, shape: 'wide', count: 5 },
      { row: 2, col: 0, shape: 'tall', count: 4 },
      { row: 1, col: 2, shape: 'wide', count: 8 },
      { row: 3, col: 1, shape: 'square', count: 4 },
      { row: 3, col: 3, shape: 'square', count: 4 },
    ],
  },
  {
    id: 'patches-5',
    size: 5,
    clues: [
      { row: 2, col: 0, shape: 'tall', count: 5 },
      { row: 0, col: 2, shape: 'wide', count: 4 },
      { row: 2, col: 1, shape: 'tall', count: 4 },
      { row: 1, col: 3, shape: 'wide', count: 6 },
      { row: 3, col: 3, shape: 'wide', count: 6 },
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

  // Find the clue that is covered by this rectangle
  const coveredClue = clues.find(
    (clue) => clue.row >= row && clue.row < row + height && clue.col >= col && clue.col < col + width
  )

  if (!coveredClue) {
    return { valid: false, reason: 'Must contain a clue' }
  }

  // Check if this rectangle covers MORE THAN ONE clue
  const allCoveredClues = clues.filter(
    (clue) => clue.row >= row && clue.row < row + height && clue.col >= col && clue.col < col + width
  )
  if (allCoveredClues.length > 1) {
    return { valid: false, reason: 'Must contain exactly one clue' }
  }

  if (coveredClue.count !== area) {
    return { valid: false, reason: `Area must be ${coveredClue.count}` }
  }

  if (coveredClue.shape === 'square' && !isSquare) {
    return { valid: false, reason: 'Must be a square' }
  }
  if (coveredClue.shape === 'wide' && !isWide) {
    return { valid: false, reason: 'Must be wider than tall' }
  }
  if (coveredClue.shape === 'tall' && !isTall) {
    return { valid: false, reason: 'Must be taller than wide' }
  }

  // Check for overlap with existing patches
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

export function getPatchColor(index) {
  const colors = [
    'bg-[#f0abfc] border-[#d946ef] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]', // Fuchsia
    'bg-[#93c5fd] border-[#3b82f6] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]', // Blue
    'bg-[#86efac] border-[#22c55e] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]', // Green
    'bg-[#fde047] border-[#eab308] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]', // Yellow
    'bg-[#fdba74] border-[#f97316] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]', // Orange
    'bg-[#fda4af] border-[#f43f5e] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]', // Rose
    'bg-[#c4b5fd] border-[#8b5cf6] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]', // Violet
    'bg-[#67e8f9] border-[#06b6d4] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]', // Cyan
  ]
  return colors[index % colors.length]
}
