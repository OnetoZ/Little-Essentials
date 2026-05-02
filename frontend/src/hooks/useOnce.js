import { useCallback, useRef } from 'react'

export function useOnce(cooldown = 3000) {
  const submitted = useRef(false)

  const guard = useCallback(
    (fn) => {
      if (submitted.current) return

      submitted.current = true
      fn()

      window.setTimeout(() => {
        submitted.current = false
      }, cooldown)
    },
    [cooldown],
  )

  return { guard }
}
