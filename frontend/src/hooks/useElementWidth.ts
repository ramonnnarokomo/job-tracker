import { useEffect, useRef, useState } from 'react'

/**
 * Tracks the rendered width of an element, so an SVG can be drawn at its real
 * pixel size (text stays readable instead of shrinking with a viewBox).
 */
export function useElementWidth<T extends HTMLElement>(initialWidth: number) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(initialWidth)

  useEffect(() => {
    const element = ref.current
    // ResizeObserver is missing in some test environments: keep the initial width.
    if (!element || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}
