import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import useStore from '../../store/useStore'

export default function CartDrawer() {
  const { cartOpen, closeCart } = useStore()

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={closeCart}
            className="fixed inset-0 z-[90] bg-espresso/45"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.32, 0, 0.15, 1] }}
            className="fixed bottom-0 right-0 top-0 z-[95] flex w-full max-w-[420px] flex-col bg-cream"
          >
            <div className="flex items-center justify-between border-b border-cappuccino/50 p-6">
              <h2 className="font-playfair text-lg text-espresso">Your Bag</h2>
              <button
                onClick={closeCart}
                className="text-caramel transition-colors duration-300 ease-premium hover:text-espresso"
                aria-label="Close cart"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center">
              <p className="font-dm text-sm text-caramel">Cart coming Day 06</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
