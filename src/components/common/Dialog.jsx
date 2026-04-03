import PropTypes from 'prop-types'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X, Trophy, Star, ArrowRight, Share2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function RulesDialog({ open, onOpenChange, title, rules }) {
// ... (RulesDialog code remains same)
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <DialogPrimitive.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-hub-card border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-bounce-in">
          <div className="flex items-center justify-between mb-4">
            <DialogPrimitive.Title className="text-xl font-bold">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close className="p-1 rounded hover:bg-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="text-sm text-gray-300 space-y-2">
            {rules.map((rule, i) => (
              <p key={i} className="flex gap-2">
                <span className="text-hub-accent font-bold flex-shrink-0">{i + 1}.</span>
                <span>{rule}</span>
              </p>
            ))}
          </DialogPrimitive.Description>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

RulesDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  rules: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export function WinDialog({ open, onOpenChange, stars, time, onNext, gameTitle }) {
  const [countdown, setCountdown] = useState(6)

  useEffect(() => {
    if (!open) return
    setCountdown(6)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onNext?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [open, onNext])

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleShare = () => {
    const text = `I solved ${gameTitle}! ⏱️ ${formatTime(time)} ${'⭐'.repeat(stars)}`
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!')
    })
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] animate-fade-in" />
        <DialogPrimitive.Content className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-hub-card border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-bounce-in overflow-hidden">
          
          {/* Decorative background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-hub-accent/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-6 animate-pulse">
              <Trophy className="w-12 h-12 text-white" />
            </div>

            <DialogPrimitive.Title className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
              Puzzle Solved!
            </DialogPrimitive.Title>
            
            <DialogPrimitive.Description className="text-hub-textSecondary font-mono text-sm mb-6 text-center w-full block">
              Time: {formatTime(time)}
            </DialogPrimitive.Description>

            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map((i) => (
                <Star 
                  key={i} 
                  className={`w-10 h-10 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} transition-all duration-500`} 
                  style={{ transitionDelay: `${i * 150}ms` }}
                />
              ))}
            </div>

            <div className="w-full space-y-3">
              <button 
                onClick={onNext}
                className="w-full py-4 px-6 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <span>NEXT PUZZLE</span>
                <div className="relative">
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  <span className="absolute -top-1 -right-4 text-[10px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center font-mono">
                    {countdown}
                  </span>
                </div>
              </button>

              <button 
                onClick={handleShare}
                className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span>SHARE SCORE</span>
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

WinDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  stars: PropTypes.number.isRequired,
  time: PropTypes.number.isRequired,
  onNext: PropTypes.func.isRequired,
  gameTitle: PropTypes.string.isRequired,
}