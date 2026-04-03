const PUZZLES = [
  {
    id: 'qween-1',
    size: 6,
    regions: [
      [0, 0, 0, 1, 1, 1],
      [0, 0, 1, 1, 1, 2],
      [0, 3, 1, 2, 2, 2],
      [3, 3, 3, 2, 4, 4],
      [3, 5, 5, 4, 4, 4],
      [5, 5, 5, 5, 4, 4],
    ],
    regionColors: [
      'bg-blue-300 dark:bg-blue-900/60',
      'bg-green-300 dark:bg-green-900/60',
      'bg-yellow-300 dark:bg-yellow-900/60',
      'bg-pink-300 dark:bg-pink-900/60',
      'bg-purple-300 dark:bg-purple-900/60',
      'bg-orange-300 dark:bg-orange-900/60',
    ],
    solution: [[0,3],[1,0],[2,2],[3,4],[4,1],[5,5]],
  },
  {
    id: 'qween-2',
    size: 6,
    regions: [
      [0, 0, 1, 1, 2, 2],
      [0, 1, 1, 2, 2, 2],
      [0, 0, 1, 3, 2, 2],
      [4, 0, 3, 3, 3, 5],
      [4, 4, 4, 3, 5, 5],
      [4, 4, 5, 5, 5, 5],
    ],
    regionColors: [
      'bg-blue-300 dark:bg-blue-900/60',
      'bg-green-300 dark:bg-green-900/60',
      'bg-yellow-300 dark:bg-yellow-900/60',
      'bg-pink-300 dark:bg-pink-900/60',
      'bg-purple-300 dark:bg-purple-900/60',
      'bg-orange-300 dark:bg-orange-900/60',
    ],
    solution: [[0,2],[1,5],[2,0],[3,3],[4,1],[5,4]],
  },
  {
    id: 'qween-3',
    size: 6,
    regions: [
      [0, 0, 0, 1, 1, 2],
      [0, 0, 1, 1, 2, 2],
      [3, 0, 1, 2, 2, 2],
      [3, 3, 4, 1, 5, 2],
      [3, 4, 4, 4, 5, 5],
      [3, 3, 4, 5, 5, 5],
    ],
    regionColors: [
      'bg-blue-300 dark:bg-blue-900/60',
      'bg-green-300 dark:bg-green-900/60',
      'bg-yellow-300 dark:bg-yellow-900/60',
      'bg-pink-300 dark:bg-pink-900/60',
      'bg-purple-300 dark:bg-purple-900/60',
      'bg-orange-300 dark:bg-orange-900/60',
    ],
    solution: [[0,5],[1,2],[2,3],[3,0],[4,4],[5,1]],
  },
]

export function getQweenPuzzle(index = 0) {
  return PUZZLES[index % PUZZLES.length]
}

export function getQweenPuzzleCount() {
  return PUZZLES.length
}

export function getConflictingQueens(queens, regions) {
  const conflicts = new Set()
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const [r1, c1] = queens[i]
      const [r2, c2] = queens[j]

      let isConflict = false
      if (r1 === r2 || c1 === c2) isConflict = true
      else if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) isConflict = true
      else if (regions[r1][c1] === regions[r2][c2]) isConflict = true

      if (isConflict) {
        conflicts.add(`${r1},${c1}`)
        conflicts.add(`${r2},${c2}`)
      }
    }
  }
  return conflicts
}

export function isQweenSolved(queens, size, conflicts) {
  return queens.length === size && conflicts.size === 0
}