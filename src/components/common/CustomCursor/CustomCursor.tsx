import { useEffect, useRef } from 'react'
import './CustomCursor.css'

const CustomCursor = () => {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e
      target.current.x = x
      target.current.y = y
      dot.current!.style.transform = `translate(${x - 4}px, ${y - 4}px)`
      const el = e.target as HTMLElement
      const isInteractive =
        el.tagName === 'A' || el.tagName === 'BUTTON' || el.closest('nav') !== null

      dot.current!.classList.toggle('cursor-hover', isInteractive)
      ring.current!.classList.toggle('ring-hover', isInteractive)
    }

    document.addEventListener('mousemove', handleMove, { passive: true })

    let raf = 0
    const animate = () => {
      ringPos.current.x += (target.current.x - ringPos.current.x) * 0.2
      ringPos.current.y += (target.current.y - ringPos.current.y) * 0.2

      const { x, y } = ringPos.current
      ring.current!.style.transform = `translate(${x - 12}px, ${y - 12}px)`

      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}

export default CustomCursor
