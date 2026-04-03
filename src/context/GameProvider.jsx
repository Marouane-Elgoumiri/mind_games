import { useReducer, useEffect } from 'react'
import PropTypes from 'prop-types'
import { GameContext } from './GameContext'

const STORAGE_KEY = 'mind_games_state'

const initialState = {
  theme: 'dark',
  currentGame: null,
  scores: {
    qween: { wins: 0, streak: 0, bestTime: null, puzzlesSolved: [], lastPlayed: null, stars: {} },
    zip: { wins: 0, streak: 0, bestTime: null, puzzlesSolved: [], lastPlayed: null, stars: {} },
    patches: { wins: 0, streak: 0, bestTime: null, puzzlesSolved: [], lastPlayed: null, stars: {} },
  },
  dailyStreak: 0,
  lastDailyDate: null,
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...initialState, ...parsed }
    }
  } catch (error) {
    console.error(error)
  }
  return initialState
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload }

    case 'SET_CURRENT_GAME':
      return { ...state, currentGame: action.payload }

    case 'RECORD_WIN': {
      const { game, time, puzzleId } = action.payload
      const today = new Date().toDateString()
      const lastPlayed = state.scores[game]?.lastPlayed
      let newStreak = state.scores[game]?.streak || 0

      if (lastPlayed) {
        const lastDate = new Date(lastPlayed)
        const diffDays = Math.floor((new Date(today) - lastDate) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          newStreak += 1
        } else if (diffDays > 1) {
          newStreak = 1
        }
      } else {
        newStreak = 1
      }

      return {
        ...state,
        scores: {
          ...state.scores,
          [game]: {
            ...state.scores[game],
            wins: (state.scores[game]?.wins || 0) + 1,
            streak: newStreak,
            bestTime: state.scores[game]?.bestTime
              ? Math.min(state.scores[game].bestTime, time)
              : time,
            puzzlesSolved: puzzleId && !state.scores[game]?.puzzlesSolved?.includes(puzzleId)
              ? [...(state.scores[game]?.puzzlesSolved || []), puzzleId]
              : state.scores[game]?.puzzlesSolved || [],
            lastPlayed: today,
          },
        },
      }
    }

    case 'SET_STARS': {
      const { game, puzzleId, stars } = action.payload
      return {
        ...state,
        scores: {
          ...state.scores,
          [game]: {
            ...state.scores[game],
            stars: {
              ...(state.scores[game]?.stars || {}),
              [puzzleId]: stars,
            },
          },
        },
      }
    }

    case 'RESET_GAME_STATS': {
      return {
        ...state,
        scores: {
          ...state.scores,
          [action.payload]: initialState.scores[action.payload],
        },
      }
    }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error(error)
    }
  }, [state])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
    document.documentElement.classList.toggle('light', state.theme === 'light')
  }, [state.theme])

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' })
  }

  const setCurrentGame = (game) => {
    dispatch({ type: 'SET_CURRENT_GAME', payload: game })
  }

  const recordWin = (game, time, puzzleId) => {
    dispatch({ type: 'RECORD_WIN', payload: { game, time, puzzleId } })
  }

  const setStars = (game, puzzleId, stars) => {
    dispatch({ type: 'SET_STARS', payload: { game, puzzleId, stars } })
  }

  return (
    <GameContext.Provider value={{ state, toggleTheme, setCurrentGame, recordWin, setStars }}>
      {children}
    </GameContext.Provider>
  )
}

GameProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
