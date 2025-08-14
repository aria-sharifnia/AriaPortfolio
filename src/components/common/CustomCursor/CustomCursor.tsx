import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './CustomCursor.css'

const CustomCursor = () => {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.id = 'cursor-layer'
    Object.assign(el.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '2147483647',
    } as Partial<CSSStyleDeclaration>)
    document.body.appendChild(el)
    setContainer(el)
    return () => el.remove()
  }, [])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e
      target.current.x = x
      target.current.y = y
      if (dot.current) {
        dot.current.style.left = `${x}px`
        dot.current.style.top = `${y}px`
      }
    }
    document.addEventListener('mousemove', handleMove, { passive: true })

    let raf = 0
    const animate = () => {
      ringPos.current.x += (target.current.x - ringPos.current.x) * 0.2
      ringPos.current.y += (target.current.y - ringPos.current.y) * 0.2
      if (ring.current) {
        ring.current.style.left = `${ringPos.current.x}px`
        ring.current.style.top = `${ringPos.current.y}px`
      }
      const under = document.elementFromPoint(target.current.x, target.current.y)
      const interactive =
        !!under &&
        !!(under as Element).closest(
          'a,button,nav,[role="button"],[data-interactive],.cursor-pointer'
        )
      dot.current?.classList.toggle('cursor-hover', interactive)
      ring.current?.classList.toggle('ring-hover', interactive)

      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (!container) return null

  return createPortal(
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>,
    container
  )
}

export default CustomCursor
