import type { MouseEvent } from 'react'

export const useRipple = () => {
  const createRipple = (e: MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const span = document.createElement('span')
    span.className = 'ripple-span'
    span.style.width = span.style.height = `${size}px`
    span.style.left = `${x}px`
    span.style.top = `${y}px`

    target.appendChild(span)
    span.addEventListener('animationend', () => span.remove())
  }

  return createRipple
}
