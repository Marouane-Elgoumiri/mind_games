import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

export function Timer({ isRunning, onTimeUpdate }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1
        onTimeUpdate?.(next)
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, onTimeUpdate])

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="font-mono text-lg text-hub-accent tabular-nums">
      {formatTime(seconds)}
    </div>
  )
}

Timer.propTypes = {
  isRunning: PropTypes.bool.isRequired,
  onTimeUpdate: PropTypes.func,
}