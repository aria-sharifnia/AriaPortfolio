import React, { useEffect, useMemo, useRef, useState } from 'react'
import Section from '../components/layout/Section'
import { ChevronRight, ExternalLink, Github, X } from 'lucide-react'
import TagPill from '@/components/common/TagPill'
import PrimaryButton from '@/components/common/PrimaryButton/PrimaryButton'
import type { TagKind } from '@/api/experience'
import { sortTagBadges } from '@/utils/tags'
import { TAG_STYLES } from '@/theme/tagStyles'

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
    'A fast, content-driven React + TypeScript portfolio with Vite build, Strapi-ready backend, custom animations, and a clean tag system. Built from scratch to be fast, scalable, and expressive.',
  description:
    'A personal portfolio website built to showcase my career and journey as a developer. It brings together my skills, education, work experience, personal projects, testimonials, résumé, and social links in one place. Designed to be both professional and fast, it is a Vite + React application styled with Tailwind CSS, hosted on Vercel with a custom domain, and powered by a Strapi Cloud CMS backend. An efficient caching strategy ensures that content updates are fresh while keeping API calls minimal, making the site smooth and scalable across all devices.',
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
    'Iterative design process inspired by UX Pilot, evolved section by section',
    'Custom cursor built after many iterations to balance uniqueness & usability',
    'Skills “bubbles” visualization with dynamic sizing & animations',
    'Shared-element modal (card → dialog) using FLIP + clip-path',
    'Caching strategy with Strapi manifest check: only changed sections re-fetch',
    'Responsive across devices with adjusted layouts for small screens',
    'Near-perfect Lighthouse scores (performance, accessibility, SEO)',
    'Hosted on Vercel with Strapi Cloud backend & Vercel Analytics',
  ],
  demoUrl: '/',
  repoUrl: '#',
  blogTitle: 'Designing a portfolio that feels fast, focused, and future-proof',
  blog: [
    {
      heading: 'Starting Out',
      body: 'Before writing a line of code, I researched how other Computer Science portfolios were built. I also used UX Pilot as a design springboard. It gave me a solid structure to start from, but as I iterated the site evolved into something much more personal — new colors, layouts, and ideas emerged section by section.',
    },
    {
      heading: 'Design Iterations',
      body: 'The design was never static. My early versions looked very different: colors felt mismatched, typography didn’t feel professional, and the layout was too rigid. As I built each section, I experimented and let the design drift. Over time, this iterative process created a more cohesive and polished look than I originally planned.',
    },
    {
      heading: 'Tools & Tech Choices',
      body: 'I chose React because I was already comfortable with it and it let me build composable primitives like Section and Pill. Vite became my build tool because of its blazing-fast HMR and lean production bundles, which helped me keep the feedback loop short. Tailwind CSS was new to me at the time — the learning curve was slow at first, but I quickly saw why it’s widely adopted in the industry. It enforces consistent design tokens, makes responsive design natural, and speeds up iteration.',
    },
    {
      heading: 'Custom Cursor',
      body: 'One of the most experimental parts of the site was the custom cursor. I went through many iterations to strike the right balance: unique and noticeable, but not distracting. Early versions were laggy and felt gimmicky, but after experimenting with different rendering strategies I finally achieved a smooth, performant result.',
    },
    {
      heading: 'Skills Visualization',
      body: 'For the skills section, I wanted something more than a list of technologies. The bubble system shows my stronger skills as larger and fuller circles, with animation to make it feel alive. At first the animations were glitchy and the colors clashed, but I kept refining until the motion felt natural and the palette matched the rest of the site. I also decided that every tab should persist in the DOM so switching feels like peeking into another environment instead of loading a new one.',
    },
    {
      heading: 'Experiences & Projects',
      body: 'The experiences timeline was by far the hardest section to design. I wanted it to be clear, engaging, and easy to scan without overwhelming the user. It went through multiple redesigns before I found a structure I was happy with. For projects, I built a shared-element modal using FLIP animations so cards morph smoothly into detailed views. This created a strong storytelling flow: quick overviews in the grid, and deeper dives inside the modal.',
    },
    {
      heading: 'Backend & Hosting',
      body: 'I hosted the frontend on Vercel for simplicity, speed, and scalability. For the backend, I used Strapi Cloud for the first time. This taught me how to model content types, secure API calls, and integrate a headless CMS into a React app. To keep things efficient, I built a caching layer: the site first checks a manifest file — if nothing has changed, no new API calls are made; if only one section has changed, only that section is re-fetched. This keeps the experience fast without losing freshness.',
    },
    {
      heading: 'Performance & SEO',
      body: 'Performance was a top priority. I tested the site with Lighthouse and achieved near-perfect scores for performance, accessibility, and SEO. For SEO, I added a sitemap, OG images for social sharing, and registered the site with Google Search Console. I also integrated Vercel Analytics to monitor speed and real-world usage. Responsiveness was carefully tuned: some components scale down naturally, while others change design entirely to work better on smaller screens.',
    },
    {
      heading: 'Challenges',
      body: 'Not everything went smoothly. The custom cursor was laggy for weeks until I found the right rendering approach. The skills bubbles kept overlapping in awkward ways, which required tuning the physics and animation pacing. And the experiences timeline took the longest to design — I had to balance information density with readability. Each of these challenges forced me to dig deeper into performance, animation, and UX best practices.',
    },
    {
      heading: 'What I Learned',
      body: 'This project reinforced the value of iteration: my final portfolio looks nothing like my first sketches, but it represents me much better. I gained hands-on experience with Tailwind CSS and Strapi Cloud, and I deepened my understanding of performance as part of design. Most importantly, I learned that personal projects are living experiments — every new idea is a chance to try something, learn, and improve.',
    },
    {
      heading: 'Future Plans',
      body: 'I plan to keep expanding this site as both a portfolio and a blog. Every new project I build will come with its own blog entry describing the process and lessons learned. I also want to add more technical deep dives, experiment with visual storytelling, refine SEO further, and improve accessibility even more. The site will evolve with me, both as a developer and a designer.',
    },
  ],
}

type TabKey = 'overview' | 'blog'
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

        <p className="mt-2 text-slate-600 line-clamp-3">{project.description ?? project.summary}</p>

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
                <TabButton active={tab === 'blog'} onClick={() => setTab('blog')}>
                  {derivedReadMins ? `Blog · ${derivedReadMins} min` : 'Blog'}
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

              {tab === 'blog' && (
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
      description="Showcasing key projects that demonstrate design, development, and innovation"
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
