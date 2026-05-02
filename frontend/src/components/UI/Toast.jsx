import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, X } from 'lucide-react'
import { useToast } from '../../store/useToast'

const ICONS = {
  success: <Check size={15} className="text-green-500" />,
  error: <AlertCircle size={15} className="text-red-400" />,
  info: <AlertCircle size={15} className="text-caramel" />,
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex max-w-[320px] items-center gap-3 rounded-full bg-espresso px-5 py-3 font-dm text-[13px] font-medium text-cream shadow-[0_8px_32px_rgba(59,42,34,0.35)]"
          >
            {ICONS[toast.type] ?? ICONS.info}
            <span>{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-1 text-cream/50 transition-colors hover:text-cream"
              type="button"
              aria-label="Dismiss notification"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
