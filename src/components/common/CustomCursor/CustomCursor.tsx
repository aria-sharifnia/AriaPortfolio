import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './CustomCursor.css'

const isInteractive = (el: Element | null) =>
  !!el &&
  !!el.closest('a,button,[role="button"],input,textarea,select,summary,.btn,.cursor-pointer')

function useCursorEnabled() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mqFine = window.matchMedia('(pointer: fine)')
    const mqHover = window.matchMedia('(hover: hover)')
    const mqWide = window.matchMedia('(min-width: 1024px)')

    const update = () => {
      setEnabled(mqFine.matches && mqHover.matches && mqWide.matches)
    }
    update()

    const onChange = () => update()
    mqFine.addEventListener('change', onChange)
    mqHover.addEventListener('change', onChange)
    mqWide.addEventListener('change', onChange)
    window.addEventListener('resize', update)

    return () => {
      mqFine.removeEventListener('change', onChange)
      mqHover.removeEventListener('change', onChange)
      mqWide.removeEventListener('change', onChange)
      window.removeEventListener('resize', update)
    }
  }, [])

  return enabled
}

const CustomCursor = () => {
  const enabled = useCursorEnabled()
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      if (container) {
        container.remove()
        setContainer(null)
      }
      return
    }
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
  }, [enabled])

  useEffect(() => {
    if (!container) return

    const handleMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e
      target.current.x = x
      target.current.y = y
      if (dot.current) {
        dot.current.style.left = `${x}px`
        dot.current.style.top = `${y}px`
      }
    }

    const animate = () => {
      ringPos.current.x += (target.current.x - ringPos.current.x) * 0.18
      ringPos.current.y += (target.current.y - ringPos.current.y) * 0.18
      if (ring.current) {
        ring.current.style.left = `${ringPos.current.x}px`
        ring.current.style.top = `${ringPos.current.y}px`
      }
      const under = document.elementFromPoint(target.current.x, target.current.y)
      const active = isInteractive(under as Element | null)
      dot.current?.classList.toggle('cursor-hover', active)
      ring.current?.classList.toggle('ring-hover', active)
      raf.current = requestAnimationFrame(animate)
    }

    const clearHover = () => {
      dot.current?.classList.remove('cursor-hover')
      ring.current?.classList.remove('ring-hover')
    }
    const onVis = () => {
      if (document.visibilityState === 'hidden') clearHover()
    }

    document.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('blur', clearHover)
    document.addEventListener('visibilitychange', onVis)
    raf.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      window.removeEventListener('blur', clearHover)
      document.removeEventListener('visibilitychange', onVis)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [container])

  if (!enabled || !container) return null

  return createPortal(
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>,
    container
  )
}

export default CustomCursor
