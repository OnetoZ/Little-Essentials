import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-8 pt-[80px] text-center">
      <div className="relative mb-8">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="select-none font-playfair text-[clamp(120px,25vw,220px)] font-black leading-none"
          style={{ color: 'rgba(59,42,34,0.07)' }}
        >
          404
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <p className="mb-3 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
            Page not found
          </p>
          <h1 className="font-playfair text-[clamp(28px,4vw,48px)] font-bold leading-[1.2] text-espresso">
            Nothing here yet.
          </h1>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 max-w-sm font-dm text-[16px] font-light text-mocha"
      >
        The page you&apos;re looking for has been moved, or perhaps it was never
        meant to exist.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <Link
          to="/"
          className="rounded-[3px] bg-mocha px-8 py-4 font-dm text-[14px] font-medium text-cream transition-colors duration-250 ease-smooth hover:bg-espresso"
        >
          Go Home
        </Link>
        <Link
          to="/collections"
          className="rounded-[3px] border border-cappuccino px-8 py-4 font-dm text-[14px] font-medium text-espresso transition-colors duration-250 ease-smooth hover:border-caramel"
        >
          Explore Collections
        </Link>
      </motion.div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 h-[1.5px] w-32 origin-left bg-caramel"
      />
    </main>
  )
}
