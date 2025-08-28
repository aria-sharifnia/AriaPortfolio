import type { FC, CSSProperties } from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Section from '../components/layout/Section'
import InlineSvg from '../components/common/inlineSVG'
import { useSkill } from '../hooks/useSkill'
import { colorsFor } from '../theme/skillsPalettes'

type Bubble = {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  level: number
}

const TAB_BASE = 'rounded-full px-4 py-2 text-sm font-semibold transition-colors'
const INACTIVE_TAB = 'text-navy-600 hover:bg-gray-50'
const MAX_SPEED_BASE = 1.2
const MIN_SPEED_BASE = 0.6
const COLLISION_DAMPING = 0.85
const COLLISION_SPEED_BOOST = 1.15
const FRICTION = 0.9985

const SKILLS_BG =
  'radial-gradient(1200px 400px at -10% -20%, rgba(20,184,166,.10), transparent 60%), radial-gradient(800px 300px at 120% 0%, rgba(56,189,248,.10), transparent 60%), linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)'

const SIZE_MIN_BASE = 70
const SIZE_MAX_BASE = 150
const DESIGN_BASE_W = 1024
const MIN_DIAMETER_HARD = 44

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const level01 = (lvl: number) => clamp(lvl, 0, 5) / 5

const seedFrom = (s: string) => {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
const mulberry32 = (a: number) => () => {
  let t = (a += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function computeSizeRange(W: number, H: number) {
  const baseScale = clamp(W / DESIGN_BASE_W, 0.65, 1.25)
  let min = Math.round(SIZE_MIN_BASE * baseScale)
  let max = Math.round(SIZE_MAX_BASE * baseScale)

  const maxAllowed = Math.max(MIN_DIAMETER_HARD, Math.min(W, H))
  if (max > maxAllowed) max = Math.max(MIN_DIAMETER_HARD, Math.floor(maxAllowed))
  if (min > max) min = Math.max(MIN_DIAMETER_HARD, Math.floor(max * 0.65))
  min = Math.max(min, MIN_DIAMETER_HARD)
  return { min, max }
}

const sizeForLevel = (lvl: number, range: { min: number; max: number }) =>
  range.min + (range.max - range.min) * level01(lvl)

function computeSpeedRange(W: number, H: number) {
  const containerArea = W * H
  const baseArea = DESIGN_BASE_W * (DESIGN_BASE_W * 0.6)
  const areaScale = Math.sqrt(containerArea / baseArea)
  const speedScale = clamp(areaScale, 0.4, 2.0)

  return {
    max: MAX_SPEED_BASE * speedScale,
    min: MIN_SPEED_BASE * speedScale,
  }
}

function clampInsideBox(x: number, y: number, r: number, W: number, H: number) {
  return {
    x: clamp(x, r, W - r),
    y: clamp(y, r, H - r),
  }
}

function generateSafePosition(
  rnd: () => number,
  radius: number,
  W: number,
  H: number,
  attempts: number = 20
): { x: number; y: number } {
  const minX = radius
  const maxX = W - radius
  const minY = radius
  const maxY = H - radius

  if (minX >= maxX || minY >= maxY || W <= 0 || H <= 0) {
    return { x: W / 2, y: H / 2 }
  }

  for (let i = 0; i < attempts; i++) {
    const x = minX + rnd() * (maxX - minX)
    const y = minY + rnd() * (maxY - minY)

    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      const leftEdge = x - radius
      const rightEdge = x + radius
      const topEdge = y - radius
      const bottomEdge = y + radius

      if (leftEdge >= 0 && rightEdge <= W && topEdge >= 0 && bottomEdge <= H) {
        return { x, y }
      }
    }
  }

  const safeX = (minX + maxX) / 2
  const safeY = (minY + maxY) / 2

  return { x: safeX, y: safeY }
}

const SkillsSection: FC = () => {
  const { data } = useSkill()
  const [active, setActive] = useState(0)
  const categories = data?.categories ?? []
  const activeCat = categories[active]
  const palette = useMemo(() => colorsFor(activeCat?.palette ?? 'sky'), [activeCat?.palette])

  const boxRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const bubblesRef = useRef<Bubble[]>([])
  const nodesRef = useRef<HTMLDivElement[]>([])
  const layoutsRef = useRef<Map<string, Bubble[]>>(new Map())

  const [sizeRange, setSizeRange] = useState<{ min: number; max: number }>({
    min: SIZE_MIN_BASE,
    max: SIZE_MAX_BASE,
  })

  const [speedRange, setSpeedRange] = useState<{ min: number; max: number }>({
    min: MIN_SPEED_BASE,
    max: MAX_SPEED_BASE,
  })

  const [ready, setReady] = useState(false)
  const firstPaintRef = useRef(true)
  const tablistRef = useRef<HTMLDivElement | null>(null)
  const tabBtnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [thumb, setThumb] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const setTabRef = (i: number) => (el: HTMLButtonElement | null) => {
    tabBtnRefs.current[i] = el
  }
  const recalcThumb = () => {
    const el = tabBtnRefs.current[active]
    const list = tablistRef.current
    if (!el || !list) return
    const { left } = el.getBoundingClientRect()
    const { left: parentLeft } = list.getBoundingClientRect()
    setThumb({ left: left - parentLeft, width: el.offsetWidth })
  }

  useEffect(() => {
    const urls = new Set<string>()
    for (const c of categories)
      for (const it of c.items) {
        if (it.icon) urls.add(it.icon)
      }

    const promises = Array.from(urls).map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = url
      })
    })

    Promise.all(promises).catch(() => {})
  }, [categories])

  useLayoutEffect(() => {
    recalcThumb()
    const list = tablistRef.current
    let ro: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined' && list) {
      ro = new ResizeObserver(() => recalcThumb())
      ro.observe(list)
    }
    window.addEventListener('resize', recalcThumb)
    return () => {
      window.removeEventListener('resize', recalcThumb)
      ro?.disconnect()
    }
  }, [active, categories.length])

  useLayoutEffect(() => {
    const el = tabBtnRefs.current[active]
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => recalcThumb())
    ro.observe(el)
    return () => ro.disconnect()
  }, [active, categories.length])

  const reduceMotion = useMemo(prefersReducedMotion, [])

  useLayoutEffect(() => {
    const box = boxRef.current
    if (!activeCat?.items?.length || !box) {
      if (firstPaintRef.current) setReady(true)
      return
    }

    const key = `${active}-${activeCat.title}`
    const cache = layoutsRef.current
    const W = box.clientWidth
    const H = box.clientHeight

    if (W <= 0 || H <= 0) {
      if (firstPaintRef.current) setReady(true)
      return
    }

    const range = computeSizeRange(W, H)
    setSizeRange(range)
    const speeds = computeSpeedRange(W, H)
    setSpeedRange(speeds)

    let arr = cache.get(key)
    if (!arr) {
      arr = activeCat.items.map((it, index) => {
        let size = sizeForLevel(it.level, range)

        const maxPossibleSize = Math.min(W, H)
        size = clamp(size, MIN_DIAMETER_HARD, maxPossibleSize)

        const r = size / 2

        const indexedRnd = mulberry32(seedFrom(key + index.toString()))
        const { x, y } = generateSafePosition(indexedRnd, r, W, H)

        const finalX = clamp(x, r, W - r)
        const finalY = clamp(y, r, H - r)

        return {
          id: `${key}-${it.text}-${index}`,
          x: finalX,
          y: finalY,
          vx: indexedRnd() * (speeds.max * 2) - speeds.max,
          vy: indexedRnd() * (speeds.max * 2) - speeds.max,
          size,
          level: it.level,
        }
      })
      cache.set(key, arr)
    } else {
      for (const b of arr) {
        let newSize = sizeForLevel(b.level, range)
        const maxPossibleSize = Math.min(W, H)
        newSize = clamp(newSize, MIN_DIAMETER_HARD, maxPossibleSize)
        b.size = newSize

        const r = b.size / 2
        const p = clampInsideBox(b.x, b.y, r, W, H)
        b.x = p.x
        b.y = p.y
      }
    }

    bubblesRef.current = arr

    for (let i = 0; i < arr.length; i++) {
      const el = nodesRef.current[i]
      const b = arr[i]
      if (!el) continue
      el.style.transform = `translate3d(${b.x - b.size / 2}px, ${b.y - b.size / 2}px, 0)`
      el.style.setProperty('--fill', `${level01(b.level) * 100}%`)
    }
    if (firstPaintRef.current) {
      setReady(true)
      firstPaintRef.current = false
    }
  }, [active, activeCat?.title, activeCat?.items?.length])

  useEffect(() => {
    const box = boxRef.current
    if (!box || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const W = box.clientWidth
      const H = box.clientHeight
      if (W <= 0 || H <= 0) return

      const range = computeSizeRange(W, H)
      setSizeRange(range)
      const speeds = computeSpeedRange(W, H)
      setSpeedRange(speeds)
      const bubbles = bubblesRef.current

      for (const b of bubbles) {
        let newSize = sizeForLevel(b.level, range)
        const maxPossibleSize = Math.min(W, H)
        newSize = clamp(newSize, MIN_DIAMETER_HARD, maxPossibleSize)
        b.size = newSize

        const r = b.size / 2
        const p = clampInsideBox(b.x, b.y, r, W, H)
        b.x = p.x
        b.y = p.y
      }
    })
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!activeCat?.items?.length || reduceMotion) return

    const step = () => {
      const box = boxRef.current
      const nodes = nodesRef.current
      const bubbles = bubblesRef.current
      if (!box || !bubbles.length || !nodes.length) {
        frameRef.current = requestAnimationFrame(step)
        return
      }

      const W = box.clientWidth
      const H = box.clientHeight

      for (const b of bubbles) {
        b.x += b.vx
        b.y += b.vy

        const r = b.size / 2

        if (b.x - r <= 0 && b.vx < 0) {
          b.vx *= -COLLISION_SPEED_BOOST
          b.x = r
        }
        if (b.x + r >= W && b.vx > 0) {
          b.vx *= -COLLISION_SPEED_BOOST
          b.x = W - r
        }
        if (b.y - r <= 0 && b.vy < 0) {
          b.vy *= -COLLISION_SPEED_BOOST
          b.y = r
        }
        if (b.y + r >= H && b.vy > 0) {
          b.vy *= -COLLISION_SPEED_BOOST
          b.y = H - r
        }

        b.vx *= FRICTION
        b.vy *= FRICTION

        const sp = Math.hypot(b.vx, b.vy)
        if (sp < speedRange.min) {
          const a = Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * 0.6
          const s = speedRange.min + Math.random() * (speedRange.max - speedRange.min) * 0.3
          b.vx = Math.cos(a) * s
          b.vy = Math.sin(a) * s
        } else if (sp > speedRange.max) {
          const k = speedRange.max / sp
          b.vx *= k
          b.vy *= k
        }
      }

      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i]
          const b = bubbles[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const minDist = (a.size + b.size) / 2
          if (Math.abs(dx) > minDist || Math.abs(dy) > minDist) continue
          const dist = Math.hypot(dx, dy)
          if (dist < minDist && dist > 0.0001) {
            const nx = dx / dist
            const ny = dy / dist
            const overlap = (minDist - dist) / 2
            a.x -= nx * overlap
            a.y -= ny * overlap
            b.x += nx * overlap
            b.y += ny * overlap

            const av = a.vx * nx + a.vy * ny
            const bv = b.vx * nx + b.vy * ny
            const diff = (bv - av) * COLLISION_SPEED_BOOST

            a.vx += diff * nx * COLLISION_DAMPING
            a.vy += diff * ny * COLLISION_DAMPING
            b.vx -= diff * nx * COLLISION_DAMPING
            b.vy -= diff * ny * COLLISION_DAMPING
          }
        }
      }

      for (let i = 0; i < bubbles.length; i++) {
        const el = nodes[i]
        const b = bubbles[i]
        if (!el) continue
        el.style.transform = `translate3d(${b.x - b.size / 2}px, ${b.y - b.size / 2}px, 0)`
        el.style.setProperty('--fill', `${level01(b.level) * 100}%`)
      }

      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)
    const onVis = () => {
      if (document.hidden) {
        if (frameRef.current) cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      } else {
        if (!frameRef.current) frameRef.current = requestAnimationFrame(step)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [activeCat?.items, active, reduceMotion, speedRange.min, speedRange.max])

  nodesRef.current = []

  const activePaletteKey = categories[active]?.palette ?? 'sky'
  const thumbStyle: CSSProperties = {
    left: thumb.left + 4,
    width: thumb.width - 8,
    background: colorsFor(activePaletteKey).liquid,
    boxShadow: colorsFor(activePaletteKey).shadow,
    transitionDuration: prefersReducedMotion() ? '0ms' : '280ms',
  }

  return (
    <Section id="skills" title={data?.title} description={data?.subtitle} background="gray">
      {categories.length > 0 && (
        <div className="flex justify-center">
          <div
            ref={tablistRef}
            role="tablist"
            aria-label="Skill categories"
            onKeyDown={(e) => {
              const last = categories.length - 1
              if (e.key === 'ArrowRight') setActive((i) => (i === last ? 0 : i + 1))
              else if (e.key === 'ArrowLeft') setActive((i) => (i === 0 ? last : i - 1))
              else if (e.key === 'Home') setActive(0)
              else if (e.key === 'End') setActive(last)
            }}
            className="relative inline-flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-md ring-1 ring-gray-200 backdrop-blur"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-1 bottom-1 rounded-full transition-all"
              style={thumbStyle}
            />
            {categories.map((c, idx) => {
              const isActive = idx === active
              return (
                <button
                  key={`${c.title}-${idx}`}
                  ref={setTabRef(idx)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`skills-panel-${idx}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(idx)}
                  className={[
                    'relative z-10 inline-flex items-center gap-2 whitespace-nowrap',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60',
                    TAB_BASE,
                    isActive ? 'text-white font-bold text-base' : INACTIVE_TAB,
                  ].join(' ')}
                >
                  <span className="leading-none">{c.title}</span>
                  <span
                    className={[
                      'inline-flex h-6 min-w-[1.35rem] items-center justify-center rounded-full px-2',
                      'text-[11px] font-semibold tabular-nums leading-none transition-colors backdrop-blur',
                      isActive
                        ? 'bg-white text-navy-700 ring-1 ring-black/10 shadow-sm'
                        : 'bg-black/5 text-navy-700',
                    ].join(' ')}
                  >
                    {c.items.length}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div
        id={`skills-panel-${active}`}
        className="mt-8 rounded-3xl bg-white shadow-[0_20px_60px_rgba(2,24,43,.08)] ring-1 ring-gray-200"
      >
        <div
          ref={boxRef}
          className="relative h-[340px] sm:h-[400px] md:h-[460px] lg:h-[520px] overflow-hidden rounded-3xl"
          style={{ background: SKILLS_BG, visibility: ready ? 'visible' : 'hidden' }}
        >
          {(activeCat?.items ?? []).map((item, i) => {
            const diameter = sizeForLevel(item.level, sizeRange)
            return (
              <div
                key={`${active}-${activeCat?.title}-${i}`}
                ref={(el) => {
                  if (el) nodesRef.current[i] = el
                }}
                className="bubble absolute select-none rounded-full shadow-[0_8px_24px_rgba(3,20,40,.25)] flex items-center justify-center"
                style={{
                  background: palette.shell,
                  border: '1px solid rgba(255,255,255,.25)',
                  boxShadow:
                    'inset 0 1px 3px rgba(255,255,255,.18), inset 0 -2px 6px rgba(0,0,0,.25), 0 18px 38px rgba(2,25,45,.18)',
                  willChange: 'transform, background, box-shadow',
                  transition: 'background 220ms ease, box-shadow 220ms ease',
                  width: `${diameter}px`,
                  height: `${diameter}px`,
                }}
              >
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div
                    className="absolute left-0 right-0 bottom-0"
                    style={{
                      height: 'var(--fill)',
                      background: palette.liquid,
                      filter: 'saturate(112%)',
                      transition: 'height 420ms ease, background 220ms ease',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      background:
                        'linear-gradient(145deg, rgba(255,255,255,.38) 0%, rgba(255,255,255,0) 60%)',
                    }}
                  />
                </div>
                <div
                  className="relative z-10 flex flex-col items-center justify-center px-2 text-center"
                  style={{
                    color: palette.textLight,
                    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.28))',
                    transition: 'color 180ms ease',
                  }}
                >
                  {item.icon ? (
                    <InlineSvg src={item.icon} className="h-8 w-8 text-current" useCurrentColor />
                  ) : null}
                  <span className="mt-1 text-sm font-semibold leading-4">{item.text}</span>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-full ring-0 hover:ring-4 hover:ring-white/10 transition-[ring-width] duration-300" />
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

export default SkillsSection
