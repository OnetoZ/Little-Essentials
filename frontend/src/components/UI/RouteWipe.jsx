import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export default function RouteWipe() {
  const { pathname } = useLocation()

  return (
    <motion.div
      key={pathname}
      initial={{ y: '100%' }}
      animate={{ y: ['100%', '0%', '-100%'] }}
      transition={{
        duration: 0.55,
        times: [0, 0.4, 1],
        ease: [0.16, 1, 0.3, 1],
      }}
      className="pointer-events-none fixed inset-0 z-[200] bg-cream"
    />
  )
}
