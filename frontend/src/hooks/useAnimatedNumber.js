import { useEffect, useRef, useState } from 'react'

export function useAnimatedNumber(value, duration = 400) {
  const [display, setDisplay] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const start = from.current
    const end = value
    const startTime = performance.now()
    let frameId = null

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) ** 3

      setDisplay(Math.round(start + (end - start) * eased))

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      } else {
        from.current = value
      }
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [duration, value])

  return display
}
