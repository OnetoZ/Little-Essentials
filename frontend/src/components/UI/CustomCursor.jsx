import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function supportsCustomCursor() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches
}

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(supportsCustomCursor)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine) and (min-width: 1024px)')
    const handleChange = (event) => setEnabled(event.matches)

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    const move = (event) => {
      setPos({ x: event.clientX, y: event.clientY })
      setVisible(true)
    }
    const leave = () => setVisible(false)
    const down = () => setClicked(true)
    const up = () => setClicked(false)
    const checkHover = (event) => {
      const element = event.target
      const isClickable = element.closest(
        'button, a, [role="button"], input, select, textarea, [data-cursor="hover"]',
      )
      setHovered(Boolean(isClickable))
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mousemove', checkHover)
    window.addEventListener('mouseleave', leave)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousemove', checkHover)
      window.removeEventListener('mouseleave', leave)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <motion.div
        animate={{
          x: pos.x - (hovered ? 20 : 16),
          y: pos.y - (hovered ? 20 : 16),
          width: hovered ? 40 : 32,
          height: hovered ? 40 : 32,
          opacity: visible && !clicked ? 1 : 0,
          scale: clicked ? 0.7 : 1,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.5 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border border-caramel will-change-transform"
      />
      <motion.div
        animate={{
          x: pos.x - 3,
          y: pos.y - 3,
          opacity: visible ? 1 : 0,
          scale: clicked ? 1.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[6px] w-[6px] rounded-full bg-caramel will-change-transform"
      />
    </>
  )
}
