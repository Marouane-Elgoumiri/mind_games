import { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'

export function Toast({ message, type = 'success', duration = 3000 }) {
  const [visible, setVisible] = useState(true)

  const handleClose = useCallback(() => {
    setVisible(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!visible) return null

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600 text-gray-900',
  }[type] || 'bg-gray-600'

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={handleClose} className="text-sm opacity-70 hover:opacity-100">
          ✕
        </button>
      </div>
    </div>
  )
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string,
  duration: PropTypes.number,
}
