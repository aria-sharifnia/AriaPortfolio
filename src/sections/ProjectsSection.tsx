import React, { useEffect, useMemo, useRef, useState } from 'react'
import Section from '../components/layout/Section'
import { ChevronRight, ExternalLink, Github, X } from 'lucide-react'
import TagPill, { sortTagBadges, TAG_STYLES } from '@/components/common/TagPill'
import PrimaryButton from '@/components/common/PrimaryButton/PrimaryButton'
import type { TagKind } from '@/api/experience'

type BlogSection = { heading?: string; body: string }
type Project = {
  id: string
  title: string
  summary: string
  description?: string
  period?: string
  badges?: { label: string; type?: TagKind }[]
  highlights?: string[]
  demoUrl?: string
  repoUrl?: string
  cover?: string
  blogTitle?: string
  blog?: BlogSection[]
}

const estimateReadMins = (sections: BlogSection[] | undefined, wpm = 225) => {
  if (!sections?.length) return undefined
  const text = sections.map((s) => `${s.heading ?? ''} ${s.body ?? ''}`).join(' ')
  const words = (text.match(/\w+/g) || []).length
  return Math.max(1, Math.round(words / wpm))
}

const PILL =
  'inline-flex items-center h-6 px-3 rounded-full text-[13px] font-semibold leading-none ring-1 shadow-sm'

const BasePill: React.FC<{ className?: string; children: React.ReactNode; ariaLabel?: string }> = ({
  className = '',
  children,
  ariaLabel,
}) => (
  <span className={`${PILL} ${className}`} aria-label={ariaLabel}>
    {children}
  </span>
)

const DatePill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BasePill className="bg-slate-100 text-slate-800 ring-slate-200">{children}</BasePill>
)

const TagRow: React.FC<{ badges?: Array<{ label?: string | null; type?: string | null }> }> = ({
  badges = [],
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(badges.length)
  const raf = useRef<number | null>(null)

  const sorted = useMemo(() => sortTagBadges(badges), [badges])

  const measure = () => {
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const host = ref.current
      if (!host) return
      const rowWidth = host.clientWidth
      if (rowWidth <= 0) return

      const box = document.createElement('div')
      box.style.cssText = [
        'position:absolute',
        'visibility:hidden',
        'pointer-events:none',
        'inset:auto',
        'left:-99999px',
        'top:0',
        'display:flex',
        'flex-wrap:nowrap',
        'gap:8px',
      ].join(';')
      document.body.appendChild(box)

      const pillEls: HTMLSpanElement[] = []
      for (const b of sorted) {
        const span = document.createElement('span')
        span.className = `${PILL} ${TAG_STYLES[b.type].light}`
        span.textContent = b.label
        box.appendChild(span)
        pillEls.push(span)
      }

      const plusPill = document.createElement('span')
      plusPill.className = `${PILL} ${TAG_STYLES.other.light}`
      plusPill.textContent = '+9'

      const GAP = 8
      const plusWidth =
        plusPill.offsetWidth ||
        (() => {
          box.appendChild(plusPill)
          const w = plusPill.offsetWidth
          plusPill.remove()
          return w
        })()

      let used = 0,
        count = 0
      for (let i = 0; i < pillEls.length; i++) {
        const w = pillEls[i].offsetWidth
        const next = count === 0 ? w : used + GAP + w
        if (next <= rowWidth) {
          used = next
          count++
        } else break
      }

      if (count === pillEls.length) {
        document.body.removeChild(box)
        if (count !== visibleCount) setVisibleCount(count)
        raf.current = null
        return
      }

      used = 0
      count = 0
      const reserve = plusWidth + (pillEls.length > 0 ? GAP : 0)
      const limit = Math.max(0, rowWidth - reserve)
      for (let i = 0; i < pillEls.length; i++) {
        const w = pillEls[i].offsetWidth
        const next = count === 0 ? w : used + GAP + w
        if (next <= limit) {
          used = next
          count++
        } else break
      }

      document.body.removeChild(box)
      if (count !== visibleCount) setVisibleCount(count)
      raf.current = null
    })
  }

  useEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (ref.current) ro.observe(ref.current)
    window.addEventListener('resize', measure)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [sorted.map((b) => `${b.type}:${b.label}`).join('|')])

  const hidden = Math.max(0, sorted.length - visibleCount)

  return (
    <div ref={ref} className="flex flex-wrap items-center gap-2 py-0.5">
      {sorted.map((b, i) => (
        <span key={`tag-${i}`} style={{ display: i < visibleCount ? 'inline-flex' : 'none' }}>
          <TagPill label={b.label} type={b.type} />
        </span>
      ))}
      {hidden > 0 && <TagPill label={`+${hidden}`} />}
    </div>
  )
}

const ACCENT = 'from-teal-500 to-cyan-500'

const PORTFOLIO_PROJECT: Project = {
  id: 'portfolio',
  title: 'Aria’s Portfolio (This site)',
  period: '2025',
  cover:
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop',
  summary:
    'Content-driven React + TypeScript portfolio. Fast Vite build, Strapi-ready content slots, animated timeline, smooth shared-element modal, and a clean tag system.',
  description:
    'A from-scratch portfolio focused on speed, clarity, and maintainability. It uses tiny composable layout primitives (Section, Pill), a FLIP-style shared-element modal for project details, and Strapi-ready content mapping so I can move to a headless CMS without touching the UI layer. The design system stays intentionally small to keep everything consistent and easy to evolve.',
  badges: [
    { label: 'React', type: 'frontend' },
    { label: 'TypeScript', type: 'frontend' },
    { label: 'Vite', type: 'tools' },
    { label: 'Tailwind CSS', type: 'frontend' },
    { label: 'Accessibility', type: 'tools' },
    { label: 'FLIP animation', type: 'other' },
    { label: 'MDX/Strapi-ready', type: 'tools' },
    { label: 'Lucide Icons', type: 'tools' },
  ],
  highlights: [
    'Shared-element modal (card → dialog) using FLIP + clip-path',
    'Measured tag row: collapses overflow to “+N” for perfect one-line fit',
    'Summary clamped for even card heights',
    'Hover pacing tuned with intent delay + reduced-motion support',
    'Keyboard friendly: true buttons/roles, focus-visible rings, ESC to close',
    'Layout primitives (Section, TagPill, TabButton) keep UI consistent',
    'Strapi-ready content models (portable, no UI rewrites later)',
    'Fast dev/build via Vite; lazy images; minimal JS on idle',
  ],
  demoUrl: '/',
  repoUrl: '#',
  blogTitle: 'Designing a portfolio that feels fast, focused, and future-proof',
  blog: [
    {
      heading: 'Goals',
      body: 'Be unmistakably fast, keep content first, and avoid design entropy. The previous iteration mixed data and UI. This rebuild separates concerns so I can evolve copy and projects without breaking layouts.',
    },
    {
      heading: 'System & Architecture',
      body: 'I kept the system tiny: Section for page scaffolding, TagPill for taxonomy, and a shared Project modal. Content is plain objects now but maps 1:1 to what Strapi/MDX will return later. Tailwind provides tokens (spacing, radius, ring).',
    },
    {
      heading: 'Animation approach',
      body: 'Animations are additive, never required. The project modal uses a FLIP approach: measure the card, morph the dialog with a transform+clip-path combo, and fade content after the transition. Hover effects use intent delay and respect prefers-reduced-motion.',
    },
    {
      heading: 'Accessibility',
      body: 'Cards behave like buttons with keyboard activation (Enter/Space), focus-visible rings, ESC to close, inert background via body scroll lock, and ARIA labels for dialog controls. The tag row stays readable at any width.',
    },
    {
      heading: 'Performance choices',
      body: 'Vite for quick HMR and lean bundles, lazy images, and minimal third-party deps. The timeline and modal avoid layout thrash: transforms on GPU, no animating border radius directly (clip-path instead).',
    },
    {
      heading: 'Challenges',
      body: 'Keeping the reverse-morph clean when users scroll after opening the modal. I solved it by reading the live anchor rect on close and delaying the card content reveal until the reverse FLIP is essentially done.',
    },
    {
      heading: 'What I learned',
      body: 'A tiny design system beats a big one for a solo site. Animation polish matters most at state changes (open/close), not everywhere. Building CMS-ready mapping early saves rework later.',
    },
    {
      heading: 'Next steps',
      body: 'Swap local objects for Strapi/MDX, add visual diff screenshots for UI PRs, and expand interaction tests around the modal and timeline.',
    },
  ],
}

type TabKey = 'overview' | 'case-study'
const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    className={[
      'h-9 rounded-full px-3 text-sm font-semibold transition',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500',
      active
        ? 'bg-teal-500 text-white shadow ring-1 ring-teal-500/40'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    ].join(' ')}
  >
    {children}
  </button>
)

const REAPPEAR_MS = 320
const REAPPEAR_DELAY = 80
const EASE = 'cubic-bezier(0.2,0.8,0.2,1)'

const HOVER_IN_DELAY = 140
const HOVER_OUT_DELAY = 0
const IMG_HOVER_MS = 500
const OVERLAY_HOVER_MS = 500

const BTN_BASE =
  'btn inline-flex items-center rounded-full px-3.5 py-2 text-sm font-semibold leading-none ring-1 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer select-none'
const BTN_LG = 'h-11 px-4 text-base tracking-tight gap-2'
const DEMO_BTN = `${BTN_BASE} ${BTN_LG} bg-emerald-600 text-slate-900 ring-emerald-700/50`
const GITHUB_BTN = `${BTN_BASE} ${BTN_LG} bg-slate-900 text-white ring-black/10`

const ProjectCard: React.FC<{
  project: Project
  accent: string
  setRef: (el: HTMLDivElement | null) => void
  onOpen: (p: Project) => void
  recovering?: boolean
}> = ({ project, accent, setRef, onOpen, recovering }) => {
  const handleCardActivate = () => onOpen(project)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardActivate()
    }
  }
  const [reduceMotion, setReduceMotion] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(m.matches)
    apply()
    m.addEventListener('change', apply)
    return () => m.removeEventListener('change', apply)
  }, [])
  const [revealed, setRevealed] = React.useState(!recovering)
  useEffect(() => {
    if (recovering) {
      setRevealed(false)
      return
    }
    const raf = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(raf)
  }, [recovering])
  const [hovered, setHovered] = React.useState(false)
  const inTimer = React.useRef<number | null>(null)
  const outTimer = React.useRef<number | null>(null)
  const clearTimers = () => {
    if (inTimer.current) {
      clearTimeout(inTimer.current)
      inTimer.current = null
    }
    if (outTimer.current) {
      clearTimeout(outTimer.current)
      outTimer.current = null
    }
  }
  const onEnter = () => {
    clearTimers()
    inTimer.current = window.setTimeout(() => setHovered(true), HOVER_IN_DELAY)
  }
  const onLeave = () => {
    clearTimers()
    outTimer.current = window.setTimeout(() => setHovered(false), HOVER_OUT_DELAY)
  }
  useEffect(() => clearTimers, [])

  return (
    <article
      ref={setRef}
      tabIndex={0}
      onClick={handleCardActivate}
      onKeyDown={onKeyDown}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_12px_36px_rgba(2,24,43,.08)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 flex flex-col h-full"
      aria-label={`Open details for ${project.title}`}
      style={{ contain: 'paint' }}
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
      {project.cover && (
        <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0">
          {recovering ? (
            <div className="absolute inset-0 bg-slate-200/40" />
          ) : (
            <>
              <div
                className="absolute inset-0 will-change-transform transform-gpu"
                style={{
                  transform: reduceMotion ? 'none' : hovered ? 'scale(1.04)' : 'scale(1)',
                  transition: reduceMotion ? 'none' : `transform ${IMG_HOVER_MS}ms ${EASE}`,
                  backfaceVisibility: 'hidden',
                }}
              >
                <img
                  src={project.cover}
                  alt=""
                  className="h-full w-full object-cover select-none pointer-events-none"
                  loading="lazy"
                  draggable={false}
                />
              </div>
              <div
                className="absolute inset-0 grid place-items-center"
                style={{
                  opacity: hovered ? 1 : 0,
                  transition: reduceMotion ? 'none' : `opacity ${OVERLAY_HOVER_MS}ms ${EASE}`,
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 shadow">
                  View details <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <div
        className="p-5 md:p-6 flex flex-col gap-4 flex-1 min-h-0"
        style={{
          opacity: revealed ? 1 : 0,
          transition: `opacity ${REAPPEAR_MS}ms ${EASE} ${REAPPEAR_DELAY}ms`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-tight">{project.title}</h3>
          {project.period && <DatePill>{project.period}</DatePill>}
        </div>

        <p className="mt-2 text-slate-600 line-clamp-3">{project.summary}</p>

        {!!project.badges?.length && (
          <div>
            <TagRow badges={project.badges} />
          </div>
        )}

        {(project.demoUrl || project.repoUrl) && (
          <div className="mt-auto pt-3 border-t border-slate-200/70 flex items-center justify-between gap-3">
            {project.demoUrl ? (
              <PrimaryButton
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={DEMO_BTN}
                aria-label={`Open live demo for ${project.title}`}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="ml-1">Live Demo</span>
              </PrimaryButton>
            ) : (
              <span />
            )}

            {project.repoUrl && (
              <PrimaryButton
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={GITHUB_BTN}
                aria-label={`Open GitHub repository for ${project.title}`}
              >
                <Github className="h-4 w-4 shrink-0 align-middle" />
                <span className="ml-1">GitHub</span>
              </PrimaryButton>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

type ModalProps = {
  project: Project
  accent: string
  anchorRect: DOMRect
  getAnchorRect: () => DOMRect | null
  onAboutToClose: () => void
  onClose: () => void
}

const R_START = 16
const R_END = 24

const ProjectModal: React.FC<ModalProps> = ({
  project,
  accent,
  anchorRect,
  getAnchorRect,
  onAboutToClose,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [contentVisible, setContentVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [backdrop, setBackdrop] = useState(0)
  const [tab, setTab] = useState<TabKey>('overview')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const panel = panelRef.current!
    panel.style.setProperty('--r', `${R_START}px`)
    const to = panel.getBoundingClientRect()
    const dx = anchorRect.left - to.left
    const dy = anchorRect.top - to.top
    const sx = anchorRect.width / to.width
    const sy = anchorRect.height / to.height

    panel.style.transformOrigin = 'top left'
    panel.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
    panel.getBoundingClientRect()

    requestAnimationFrame(() => {
      panel.style.transition = `transform 360ms cubic-bezier(0.2,0.8,0.2,1),
         clip-path 360ms cubic-bezier(0.2,0.8,0.2,1)`
      panel.style.transform = 'translate(0px, 0px) scale(1, 1)'
      panel.style.setProperty('--r', `${R_END}px`)
      setBackdrop(1)
    })

    const onEnd = () => {
      setContentVisible(true)
      panel.removeEventListener('transitionend', onEnd)
    }
    panel.addEventListener('transitionend', onEnd)
  }, [anchorRect])

  const handleClose = () => {
    if (closing) return
    setClosing(true)
    setContentVisible(false)
    onAboutToClose()

    const panel = panelRef.current!
    const live = getAnchorRect() || anchorRect
    const to = panel.getBoundingClientRect()
    const dx = live.left - to.left
    const dy = live.top - to.top
    const sx = live.width / to.width
    const sy = live.height / to.height

    panel.style.transition = `transform 360ms cubic-bezier(0.2,0.8,0.2,1),
       clip-path 360ms cubic-bezier(0.2,0.8,0.2,1)`
    panel.style.transformOrigin = 'top left'
    panel.style.setProperty('--r', `${R_START}px`)
    panel.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
    setBackdrop(0)

    const onEnd = () => {
      panel.removeEventListener('transitionend', onEnd)
      onClose()
    }
    panel.addEventListener('transitionend', onEnd)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const derivedReadMins = useMemo(() => estimateReadMins(project.blog), [project.blog])
  const sortedBadges = useMemo(() => sortTagBadges(project.badges), [project.badges])

  return (
    <div
      className="fixed inset-0 z-[10000]"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        const panel = panelRef.current
        if (panel && !panel.contains(e.target as Node)) handleClose()
      }}
    >
      <div
        className="absolute inset-0 bg-slate-900"
        style={{ opacity: backdrop * 0.4, transition: 'opacity 360ms cubic-bezier(0.2,0.8,0.2,1)' }}
      />

      <div className="pointer-events-none absolute inset-0 flex items-start justify-center md:items-center">
        <div
          ref={panelRef}
          onMouseDown={(e) => e.stopPropagation()}
          className="pointer-events-auto w-[min(92vw,1000px)] rounded-3xl bg-white shadow-[0_24px_80px_rgba(2,24,43,.16)] ring-1 ring-slate-200 max-h-[85vh] overflow-hidden"
          style={{
            marginTop: '8vh',
            clipPath: 'inset(0 round var(--r))',
            borderRadius: 'var(--r)',
            willChange: 'transform, clip-path',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="relative overflow-hidden rounded-t-3xl">
            <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
            <button
              onClick={handleClose}
              className="absolute right-4 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            className="grid md:grid-cols-[320px,1fr] md:gap-x-6 md:gap-y-0 overflow-y-auto"
            style={{
              opacity: contentVisible ? 1 : 0,
              transition: 'opacity 180ms ease 80ms',
              maxHeight: 'calc(85vh - 2px)',
              scrollbarGutter: 'stable both-edges',
            }}
          >
            {/* Left rail */}
            <div className="p-6 md:p-6">
              {project.cover && (
                <div
                  className="relative w-full overflow-hidden rounded-2xl ring-1 ring-slate-200 h-[clamp(160px,28vh,240px)]"
                  style={{ clipPath: 'inset(0 round 16px)' }}
                >
                  <img
                    src={project.cover}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="text-2xl font-bold leading-tight">{project.title}</h3>
                {project.period && (
                  <span className="inline-flex h-7 items-center rounded-full bg-slate-100 px-3 text-sm font-semibold ring-1 ring-slate-200">
                    {project.period}
                  </span>
                )}
              </div>

              {(project.demoUrl || project.repoUrl) && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {project.demoUrl && (
                    <PrimaryButton
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn h-11 px-4 text-base tracking-tight gap-2 bg-emerald-600 text-slate-900 ring-1 ring-emerald-700/50"
                    >
                      <span className="btn__content">
                        <ExternalLink className="h-4 w-4 shrink-0 align-middle" />
                        <span className="ml-1">Live Demo</span>
                      </span>
                    </PrimaryButton>
                  )}
                  {project.repoUrl && (
                    <PrimaryButton
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn h-11 px-4 text-base tracking-tight gap-2 bg-slate-900 text-white ring-1 ring-black/10"
                    >
                      <span className="btn__content">
                        <Github className="h-4 w-4 shrink-0 align-middle" />
                        <span className="ml-1">GitHub</span>
                      </span>
                    </PrimaryButton>
                  )}
                </div>
              )}
            </div>

            {/* Tabs row */}
            <div className="px-6 md:px-6 md:col-span-2">
              <div className="flex items-center gap-2">
                <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
                  Overview
                </TabButton>
                <TabButton active={tab === 'case-study'} onClick={() => setTab('case-study')}>
                  {derivedReadMins ? `Case Study · ${derivedReadMins} min` : 'Case Study'}
                </TabButton>
              </div>
            </div>

            {/* Right content */}
            <div className="p-6 md:p-6">
              {tab === 'overview' && (
                <div className="space-y-5">
                  <section className="space-y-3">
                    <p className="text-slate-700">{project.description ?? project.summary}</p>

                    {sortedBadges.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {sortedBadges.map((b, i) => (
                          <TagPill key={`${project.id}-pill-${i}`} label={b.label} type={b.type} />
                        ))}
                      </div>
                    )}
                  </section>

                  {!!project.highlights?.length && (
                    <>
                      <h4 className="text-base font-semibold text-slate-900">Highlights</h4>
                      <ul className="grid list-disc gap-2 pl-5 text-slate-700 marker:text-emerald-500">
                        {project.highlights.map((h, i) => (
                          <li key={i} className="leading-6">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {tab === 'case-study' && (
                <article className="max-w-none text-[15px] leading-7 text-slate-700">
                  {project.blogTitle && (
                    <h2 className="mt-0 mb-3 text-xl md:text-2xl font-bold text-slate-900">
                      {project.blogTitle}
                    </h2>
                  )}

                  {(project.blog ?? []).map((sec, i) => (
                    <section key={i} className="mb-4">
                      {sec.heading && (
                        <h3 className="mt-6 mb-2 text-lg md:text-xl font-semibold text-slate-900 leading-tight">
                          {sec.heading}
                        </h3>
                      )}
                      <p className="mb-3">{sec.body}</p>
                    </section>
                  ))}

                  {(!project.blog || project.blog.length === 0) && (
                    <p className="text-slate-600">
                      Case study coming soon. For now, see the Overview tab for key details.
                    </p>
                  )}
                </article>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CLOSE_MS = 360
const CARD_FADE_OFFSET = 60
const RECOVER_EXTRA = 120

const ProjectsSection: React.FC = () => {
  const [open, setOpen] = useState<Project | null>(null)
  const [fromRect, setFromRect] = useState<DOMRect | null>(null)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [recoveringCardId, setRecoveringCardId] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const setCardRef = (id: string) => (el: HTMLDivElement | null) => {
    cardRefs.current[id] = el
  }

  const setCardHidden = (id: string, hidden: boolean) => {
    const el = cardRefs.current[id]
    if (!el) return
    el.style.transition = 'opacity 160ms ease'
    el.style.opacity = hidden ? '0' : '1'
    el.style.pointerEvents = hidden ? 'none' : 'auto'
  }

  const onOpen = (p: Project) => {
    const el = cardRefs.current[p.id]
    if (!el) return
    const rect = el.getBoundingClientRect()
    setFromRect(rect)
    setActiveCardId(p.id)
    setCardHidden(p.id, true)
    setOpen(p)
  }

  const getActiveRect = () => {
    if (!activeCardId) return null
    const el = cardRefs.current[activeCardId]
    return el ? el.getBoundingClientRect() : null
  }

  const data = useMemo(() => [PORTFOLIO_PROJECT], [])

  return (
    <Section
      id="projects"
      title="Projects"
      description="Selected work—click the card to morph into a full view with overview + a short case study."
      background="gray"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
          {data.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              accent={ACCENT}
              setRef={setCardRef(p.id)}
              onOpen={onOpen}
              recovering={recoveringCardId === p.id}
            />
          ))}
        </div>
      </div>

      {open && fromRect && (
        <ProjectModal
          project={open}
          accent={ACCENT}
          anchorRect={fromRect}
          getAnchorRect={getActiveRect}
          onAboutToClose={() => {
            if (!activeCardId) return
            setTimeout(() => setCardHidden(activeCardId, false), CARD_FADE_OFFSET)
            setRecoveringCardId(activeCardId)
            setTimeout(
              () => setRecoveringCardId((id) => (id === activeCardId ? null : id)),
              CARD_FADE_OFFSET + CLOSE_MS + RECOVER_EXTRA
            )
          }}
          onClose={() => {
            if (activeCardId) {
              const el = cardRefs.current[activeCardId]
              if (el) {
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
              }
            }
            setActiveCardId(null)
            setOpen(null)
            setFromRect(null)
          }}
        />
      )}
    </Section>
  )
}

export default ProjectsSection
