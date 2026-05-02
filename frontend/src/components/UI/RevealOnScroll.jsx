import PropTypes from 'prop-types'
import { motion } from 'framer-motion'

const VARIANTS = {
  up: { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0 } },
  scale: {
    hidden: { opacity: 0, scale: 0.94 },
    show: { opacity: 1, scale: 1 },
  },
}

export default function RevealOnScroll({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) {
  return (
    <motion.div
      variants={VARIANTS[direction] ?? VARIANTS.up}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

RevealOnScroll.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  direction: PropTypes.oneOf(['up', 'left', 'right', 'scale']),
}
