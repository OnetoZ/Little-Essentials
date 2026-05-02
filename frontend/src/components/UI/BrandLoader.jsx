import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'framer-motion'

function EspressoCupSVG() {
  return (
    <svg
      width="64"
      height="72"
      viewBox="0 0 64 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 28 L12 60 Q12 64 16 64 L48 64 Q52 64 52 60 L56 28 Z"
        stroke="#B08968"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
      <ellipse
        cx="32"
        cy="66"
        rx="28"
        ry="4"
        stroke="#B08968"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M52 36 Q68 36 68 46 Q68 56 52 56"
        stroke="#B08968"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {[
        ['M22 22 Q20 15 22 8', 0],
        ['M32 20 Q30 12 32 4', 0.25],
        ['M42 22 Q40 15 42 8', 0.5],
      ].map(([path, delay]) => (
        <motion.path
          key={path}
          d={path}
          stroke="#B08968"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [20, 0, 20], opacity: [0.3, 1, 0.3] }}
          strokeDasharray="20"
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay,
          }}
        />
      ))}
    </svg>
  )
}

export default function BrandLoader({ onDone }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const doneTimeout = window.setTimeout(() => {
      setExiting(true)
      window.setTimeout(onDone, 500)
    }, 1400)

    return () => window.clearTimeout(doneTimeout)
  }, [onDone])

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-cream"
        >
          <EspressoCupSVG />
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-playfair text-[18px] font-bold text-espresso"
          >
            Little Essentials
          </motion.p>
          <div className="h-[1.5px] w-24 overflow-hidden rounded-full bg-cappuccino/40">
            <motion.div
              className="h-full rounded-full bg-caramel"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

BrandLoader.propTypes = {
  onDone: PropTypes.func.isRequired,
}
