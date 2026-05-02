import { useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

const PRESS_NAMES = [
  'Vogue India',
  'Condé Nast',
  'Elle Decor',
  "Harper's Bazaar",
  'Architectural Digest',
  'GQ Style',
]

export default function PressStrip() {
  const controls = useAnimationControls()

  useEffect(() => {
    controls.start({
      x: ['0%', '-50%'],
      transition: { duration: 20, repeat: Infinity, ease: 'linear' },
    })
  }, [controls])

  const resumeMarquee = () => {
    controls.start({
      x: ['0%', '-50%'],
      transition: { duration: 20, repeat: Infinity, ease: 'linear' },
    })
  }

  return (
    <section className="overflow-hidden border-t border-cappuccino/50 bg-cream py-8">
      <div className="mx-auto mb-4 max-w-screen-xl px-8">
        <p className="text-center font-dm text-[11px] uppercase tracking-ultra text-caramel/60">
          As featured in
        </p>
      </div>

      <div
        className="relative flex overflow-hidden"
        onMouseEnter={() => controls.stop()}
        onMouseLeave={resumeMarquee}
      >
        <motion.div
          animate={controls}
          className="flex whitespace-nowrap pr-12"
        >
          {[...PRESS_NAMES, ...PRESS_NAMES].map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="mr-12 cursor-default font-playfair text-[16px] font-bold text-mocha/40 transition-colors duration-250 ease-smooth hover:text-mocha/70"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
