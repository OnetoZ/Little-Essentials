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
      transition: { duration: 24, repeat: Infinity, ease: 'linear' },
    })
  }, [controls])

  const resumeMarquee = () => {
    controls.start({
      x: ['0%', '-50%'],
      transition: { duration: 24, repeat: Infinity, ease: 'linear' },
    })
  }

  return (
    <section className="overflow-hidden border-y border-cappuccino/45 bg-cream py-12">
      <div className="mx-auto grid max-w-screen-xl gap-8 px-8 lg:grid-cols-[260px_1fr] lg:items-center lg:px-16">
        <div>
          <p className="font-dm text-[11px] uppercase tracking-ultra text-caramel">
            Seen in good company
          </p>
          <p className="mt-3 max-w-[220px] font-dm text-[13px] font-light leading-[1.6] text-mocha/70">
            A restrained edit with the polish of a magazine page and the utility
            of a daily shop.
          </p>
        </div>

        <div
          className="relative flex overflow-hidden"
          onMouseEnter={() => controls.stop()}
          onMouseLeave={resumeMarquee}
        >
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-cream to-transparent" />
          <motion.div animate={controls} className="flex whitespace-nowrap pr-12">
            {[...PRESS_NAMES, ...PRESS_NAMES].map((name, index) => (
              <span
                key={`${name}-${index}`}
                className="mr-12 cursor-default font-playfair text-[clamp(30px,5vw,64px)] font-black leading-none text-mocha/30 transition-colors duration-250 ease-smooth hover:text-mocha/60"
              >
                {name}
              </span>
            ))}
          </motion.div>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-cream to-transparent" />
        </div>
      </div>
    </section>
  )
}
