import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'framer-motion'

function DigitBlock({ digit }) {
  return (
    <div className="relative flex h-[56px] w-[42px] items-center justify-center overflow-hidden rounded-[8px] bg-espresso sm:h-[68px] sm:w-[52px]">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute font-playfair text-[28px] font-bold text-cream sm:text-[32px]"
          style={{ transformOrigin: 'center' }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

DigitBlock.propTypes = {
  digit: PropTypes.string.isRequired,
}

function ColonSep() {
  return (
    <span className="mx-1 flex flex-col gap-2">
      <span className="block h-[5px] w-[5px] rounded-full bg-caramel" />
      <span className="block h-[5px] w-[5px] rounded-full bg-caramel" />
    </span>
  )
}

export default function CountdownTimer({ targetHours = 18 }) {
  const [timeLeft, setTimeLeft] = useState(targetHours * 3600)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
        Arriving in
      </p>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex gap-1">
          <DigitBlock digit={hours[0]} />
          <DigitBlock digit={hours[1]} />
        </div>
        <ColonSep />
        <div className="flex gap-1">
          <DigitBlock digit={minutes[0]} />
          <DigitBlock digit={minutes[1]} />
        </div>
        <ColonSep />
        <div className="flex gap-1">
          <DigitBlock digit={seconds[0]} />
          <DigitBlock digit={seconds[1]} />
        </div>
      </div>
      <p className="font-dm text-[11px] text-caramel/60">
        Hours · Minutes · Seconds
      </p>
    </div>
  )
}

CountdownTimer.propTypes = {
  targetHours: PropTypes.number,
}
