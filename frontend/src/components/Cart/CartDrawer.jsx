import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift, ShoppingBag, X } from 'lucide-react'
import CartItem from './CartItem'
import useStore from '../../store/useStore'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'

const FREEBIE_THRESHOLD = 4000

function EmptyCupIllustration() {
  return (
    <svg
      width="72"
      height="80"
      viewBox="0 0 72 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="12"
        y="36"
        width="40"
        height="30"
        rx="4"
        stroke="#B08968"
        strokeWidth="1.5"
      />
      <path
        d="M52 46 Q64 46 64 56 Q64 66 52 66"
        stroke="#B08968"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="18"
        y="30"
        width="28"
        height="6"
        rx="2"
        stroke="#B08968"
        strokeWidth="1.5"
      />
      <path
        d="M26 24 Q24 20 26 16"
        stroke="#B08968"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="animate-pulse"
      />
      <path
        d="M36 22 Q34 17 36 12"
        stroke="#B08968"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ animationDelay: '0.3s' }}
      />
      <path
        d="M46 24 Q44 20 46 16"
        stroke="#B08968"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ animationDelay: '0.6s' }}
      />
    </svg>
  )
}

function getIsDesktop() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(min-width: 1024px)').matches
}

export default function CartDrawer() {
  const drawerRef = useRef(null)
  const [isDesktop, setIsDesktop] = useState(getIsDesktop)
  const cartOpen = useStore((state) => state.cartOpen)
  const closeCart = useStore((state) => state.closeCart)
  const cartItems = useStore((state) => state.cartItems)
  const count = useStore((state) => state.cartCount())
  const total = useStore((state) => state.cartTotal())
  const animatedTotal = useAnimatedNumber(total)

  const freebieProgress = Math.min((total / FREEBIE_THRESHOLD) * 100, 100)
  const amountToFreebie = Math.max(FREEBIE_THRESHOLD - total, 0)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const handleChange = (event) => setIsDesktop(event.matches)

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (cartOpen && drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll('button, a, input')
      focusable[0]?.focus()
    }
  }, [cartOpen])

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [cartOpen])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') closeCart()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeCart])

  useEffect(() => {
    if (!cartOpen || !drawerRef.current) return undefined

    const trap = (event) => {
      if (event.key !== 'Tab' || !drawerRef.current) return

      const focusable = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', trap)
    return () => window.removeEventListener('keydown', trap)
  }, [cartOpen])

  const drawerMotion = isDesktop
    ? {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
      }
    : {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
      }

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={closeCart}
            className="fixed inset-0 z-[90] bg-espresso/45 backdrop-blur-[2px]"
          />

          <motion.div
            key="drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            initial={drawerMotion.initial}
            animate={drawerMotion.animate}
            exit={drawerMotion.exit}
            transition={{ duration: 0.45, ease: [0.32, 0, 0.15, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[95] flex h-[92dvh] w-full flex-col rounded-t-[8px] bg-cream shadow-[0_-24px_80px_rgba(59,42,34,0.15)] lg:bottom-0 lg:left-auto lg:top-0 lg:h-auto lg:max-w-[420px] lg:rounded-none lg:shadow-[-24px_0_80px_rgba(59,42,34,0.15)]"
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-cappuccino/50 px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag
                  size={18}
                  className="text-espresso"
                  strokeWidth={1.5}
                />
                <h2 className="font-playfair text-[18px] font-bold text-espresso">
                  Your Bag
                </h2>
                {count > 0 ? (
                  <span className="font-dm text-[13px] text-caramel">
                    ({count})
                  </span>
                ) : null}
              </div>

              <button
                onClick={closeCart}
                className="flex items-center gap-1 font-dm text-[12px] text-caramel transition-colors duration-250 ease-smooth hover:text-espresso"
                type="button"
                aria-label="Close shopping bag"
              >
                <X size={16} />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>

            {count > 0 && total < FREEBIE_THRESHOLD ? (
              <div className="flex-shrink-0 border-b border-cappuccino/30 bg-caramel/10 px-6 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <Gift size={13} className="text-caramel" />
                  <p className="font-dm text-[12px] text-caramel">
                    Add{' '}
                    <span className="font-medium text-mocha">
                      ₹{amountToFreebie.toLocaleString('en-IN')}
                    </span>{' '}
                    more to unlock a free gift
                  </p>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-cappuccino/40">
                  <motion.div
                    className="h-full rounded-full bg-caramel"
                    initial={{ width: 0 }}
                    animate={{ width: `${freebieProgress}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <AnimatePresence mode="popLayout">
                {cartItems.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex h-full flex-col items-center justify-center px-8 py-16 text-center"
                  >
                    <EmptyCupIllustration />
                    <h3 className="mb-2 mt-6 font-playfair text-[20px] font-bold text-espresso">
                      Your bag is empty.
                    </h3>
                    <p className="mb-8 font-dm text-[14px] font-light text-caramel">
                      Start exploring something beautiful.
                    </p>
                    <Link
                      to="/collections"
                      onClick={closeCart}
                      className="inline-flex items-center rounded-[3px] bg-mocha px-8 py-3 font-dm text-[13px] font-medium text-cream transition-colors duration-250 ease-smooth hover:bg-espresso"
                    >
                      Explore Now →
                    </Link>
                  </motion.div>
                ) : (
                  <ul className="divide-y divide-cappuccino/30 px-6">
                    {cartItems.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </ul>
                )}
              </AnimatePresence>
            </div>

            {cartItems.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex-shrink-0 border-t border-cappuccino/50 bg-cream px-6 py-5"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-dm text-[13px] text-caramel">
                    Subtotal
                  </span>
                  <span className="font-playfair text-[20px] font-bold text-espresso">
                    ₹{animatedTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="mb-4 text-center font-dm text-[12px] text-caramel">
                  {total >= 999
                    ? '✓ Free shipping applied'
                    : `Add ₹${(999 - total).toLocaleString('en-IN')} more for free shipping`}
                </p>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="mb-3 flex h-[52px] w-full items-center justify-center gap-2 rounded-[4px] bg-mocha font-dm text-[14px] font-medium tracking-wide text-cream transition-colors duration-250 ease-smooth hover:bg-espresso"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Checkout Securely →
                </Link>

                <div className="flex items-center justify-center gap-3 opacity-35">
                  {['VISA', 'MC', 'UPI', 'Pay'].map((method) => (
                    <span
                      key={method}
                      className="rounded-[2px] border border-espresso/30 px-2 py-[2px] font-dm text-[10px] font-medium text-espresso"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
