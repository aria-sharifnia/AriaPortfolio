import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'

type RippleEvt = ReactMouseEvent<HTMLElement> | ReactPointerEvent<HTMLElement>

export const useRipple = () => {
  const createRipple = (e: RippleEvt) => {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const isKeyboard = e.clientX === 0 && e.clientY === 0
    const clickX = isKeyboard ? rect.left + rect.width / 2 : e.clientX
    const clickY = isKeyboard ? rect.top + rect.height / 2 : e.clientY
    const x = clickX - rect.left - size / 2
    const y = clickY - rect.top - size / 2
    const span = document.createElement('span')
    span.className = 'ripple-span'
    span.style.width = span.style.height = `${size}px`
    span.style.left = `${x}px`
    span.style.top = `${y}px`

    const dur = getComputedStyle(target).getPropertyValue('--ripple-ms').trim()
    if (dur) span.style.animationDuration = dur

    const cleanup = () => {
      span.remove()
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVis)
    }

    const onBlur = () => cleanup()
    const onVis = () => {
      if (document.visibilityState === 'hidden') cleanup()
    }

    span.addEventListener('animationend', cleanup, { once: true })
    window.addEventListener('blur', onBlur, { once: true })
    document.addEventListener('visibilitychange', onVis)

    target.appendChild(span)
  }

  return createRipple
}
