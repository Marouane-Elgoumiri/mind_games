import PropTypes from 'prop-types'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

export function RulesDialog({ open, onOpenChange, title, rules }) {
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