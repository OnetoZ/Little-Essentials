import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'

const COLORS = ['#F3E9D7', '#D6BFA6', '#B08968', '#7A553A', '#3B2A22']
const SHAPES = ['circle', 'square', 'rect']

function pseudoRandom(index, salt) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function ConfettiPiece({ color, shape, x, delay, duration }) {
  const size = shape === 'rect' ? { width: 12, height: 6 } : { width: 8, height: 8 }

  return (
    <motion.div
      initial={{ y: -20, x: `${x}vw`, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ y: '110vh', opacity: [1, 1, 0], rotate: 720, scale: [1, 1, 0.5] }}
      transition={{ duration, delay, ease: 'easeIn' }}
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 999,
        width: size.width,
        height: size.height,
        background: color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '2px' : '1px',
        pointerEvents: 'none',
      }}
    />
  )
}

ConfettiPiece.propTypes = {
  color: PropTypes.string.isRequired,
  delay: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  shape: PropTypes.oneOf(SHAPES).isRequired,
  x: PropTypes.number.isRequired,
}

export default function Confetti({ active }) {
  const pieces = useMemo(() => {
    if (!active) return []

    return Array.from({ length: 40 }, (_, index) => ({
        id: index,
        color: COLORS[index % COLORS.length],
        shape: SHAPES[index % SHAPES.length],
        x: pseudoRandom(index, 1) * 100,
        delay: pseudoRandom(index, 2) * 0.8,
        duration: 3 + pseudoRandom(index, 3) * 2,
      }))
  }, [active])

  if (!active || pieces.length === 0) return null

  return pieces.map((piece) => <ConfettiPiece key={piece.id} {...piece} />)
}

Confetti.propTypes = {
  active: PropTypes.bool.isRequired,
}
