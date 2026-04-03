const PUZZLES = [
  {
    id: 'zip-1',
    size: 5,
    // S-curve pattern
    numbers: [
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 2],
      [3, 0, 0, 0, 0],
      [0, 0, 0, 0, 4],
      [5, 0, 0, 0, 0],
    ],
  },
  {
    id: 'zip-2',
    size: 5,
    // Perimeter Spiral
    numbers: [
      [1, 0, 0, 0, 2],
      [0, 0, 0, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 4, 0, 0],
      [0, 0, 3, 0, 0],
    ],
  },
  {
    id: 'zip-3',
    size: 5,
    // Forced Bottleneck
    numbers: [
      [1, 0, 3, 0, 0],
      [0, 0, 0, 0, 0],
      [2, 0, 0, 0, 4],
      [0, 0, 0, 0, 0],
      [0, 0, 5, 0, 0],
    ],
  },
  {
    id: 'zip-4',
    size: 5,
    // Zig-Zag horizontal
    numbers: [
      [1, 2, 0, 0, 0],
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0],
      [0, 4, 0, 0, 0],
      [0, 5, 0, 0, 0],
    ],
  },
  {
    id: 'zip-5',
    size: 5,
    // Hard: wasteful start
    numbers: [
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0],
      [3, 4, 0, 5, 0],
    ],
  },
]

export function getZipPuzzle(index = 0) {
  return PUZZLES[index % PUZZLES.length]
}

export function getZipPuzzleCount() {
  return PUZZLES.length
}

export function getNumberedCells(numbers, size) {
  const cells = {}
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (numbers[r][c] > 0) {
        cells[numbers[r][c]] = [r, c]
      }
    }
  }
  return cells
}

export function validateZipPath(path, numbers, size) {
  if (path.length === 0) return true

  const numberedCells = getNumberedCells(numbers, size)
  const numberedEntries = Object.entries(numberedCells).map(([k, v]) => [parseInt(k), v])
  numberedEntries.sort((a, b) => a[0] - b[0])

  // Basic connectivity
  for (let i = 1; i < path.length; i++) {
    const [pr, pc] = path[i - 1]
    const [cr, cc] = path[i]
    const dist = Math.abs(pr - cr) + Math.abs(pc - cc)
    if (dist !== 1) return false
  }

  // No self-intersection
  const seen = new Set()
  for (const [r, c] of path) {
    const key = `${r},${c}`
    if (seen.has(key)) return false
    seen.add(key)
  }

  // Checkpoint order and visibility
  for (const [num, [nr, nc]] of numberedEntries) {
    const idx = path.findIndex(([r, c]) => r === nr && c === nc)
    
    if (idx === -1) {
      // If we haven't reached this number yet, check if we've reached any HIGHER number
      const hasReachedHigher = numberedEntries.some(([otherNum, [or, oc]]) => 
        otherNum > num && path.some(([r, c]) => r === or && c === oc)
      )
      if (hasReachedHigher) return false
      continue
    }

    // Ensure all numbers up to 'num' have been visited
    for (const [otherNum, [or, oc]] of numberedEntries) {
      if (otherNum < num) {
        const otherIdx = path.findIndex(([r, c]) => r === or && c === oc)
        if (otherIdx === -1 || otherIdx > idx) return false
      }
    }
  }

  return true
}

export function isZipSolved(path, numbers, size) {
  if (path.length !== size * size) return false
  return validateZipPath(path, numbers, size)
}
