import React, { type FC, useMemo } from 'react'
import Section from '../components/layout/Section'
import { Briefcase, GraduationCap } from 'lucide-react'
import { useExperience } from '../hooks/useExperience'
import type { ExperienceItem, WorkMode } from '../api/experience'
import { WORK_MODE_LABEL } from '../api/experience'
import TagPill, { sortTagBadges } from '@/components/common/TagPill'

type YearTheme = {
  bubble: string
  bar: string
  dotRing: string
  cardRing: string
  stripe: string
}

const THEME_CYCLE: YearTheme[] = [
  {
    bubble: 'from-indigo-600 to-indigo-400',
    bar: 'bg-indigo-500',
    dotRing: 'ring-amber-400',
    cardRing: 'ring-amber-200',
    stripe: 'bg-amber-400',
  },
  {
    bubble: 'from-amber-500 to-yellow-400',
    bar: 'bg-amber-400',
    dotRing: 'ring-indigo-500',
    cardRing: 'ring-indigo-200',
    stripe: 'bg-indigo-500',
  },
  {
    bubble: 'from-sky-600 to-cyan-500',
    bar: 'bg-sky-500',
    dotRing: 'ring-rose-500',
    cardRing: 'ring-rose-200',
    stripe: 'bg-rose-500',
  },
  {
    bubble: 'from-emerald-600 to-teal-500',
    bar: 'bg-emerald-500',
    dotRing: 'ring-fuchsia-500',
    cardRing: 'ring-fuchsia-200',
    stripe: 'bg-fuchsia-500',
  },
]
const THEME_ANCHOR_YEAR = 2022
const themeOfYear = (year: number): YearTheme => {
  const idx =
    (((year - THEME_ANCHOR_YEAR) % THEME_CYCLE.length) + THEME_CYCLE.length) % THEME_CYCLE.length
  return THEME_CYCLE[idx]
}

const isPresent = (end?: string | null) => !end || String(end).toLowerCase() === 'present'
const startMs = (e: ExperienceItem) => new Date(e.startDate).getTime()
const endMs = (e: ExperienceItem) =>
  isPresent(e.endDate) ? Number.POSITIVE_INFINITY : new Date(e.endDate as string).getTime()
const startYear = (e: ExperienceItem) => new Date(e.startDate).getFullYear()
const fmtRange = (startISO: string, endISO?: string | null) => {
  const s = new Date(startISO)
  const e = isPresent(endISO) ? undefined : endISO ? new Date(endISO) : undefined
  const f = (d: Date) => d.toLocaleString(undefined, { month: 'short', year: 'numeric' })
  return `${f(s)} – ${e ? f(e) : 'Present'}`
}
const distinctStartYears = (entries: ExperienceItem[]): number[] => {
  const set = new Set<number>()
  for (const it of entries) set.add(startYear(it))
  return Array.from(set).sort((a, b) => b - a)
}
const groupByStartYear = (entries: ExperienceItem[]): Record<string, ExperienceItem[]> => {
  const out: Record<string, ExperienceItem[]> = {}
  for (const it of entries) {
    const y = String(startYear(it))
    ;(out[y] ||= []).push(it)
  }
  for (const y of Object.keys(out)) {
    out[y].sort((a, b) => {
      const cmp = endMs(b) - endMs(a)
      return cmp !== 0 ? cmp : startMs(b) - startMs(a)
    })
  }
  return out
}

const PILL_BASE =
  'inline-flex items-center h-6 px-3 rounded-full text-[13px] font-semibold ring-1 shadow-sm'

const BasePill: FC<{ className?: string; children: React.ReactNode; ariaLabel?: string }> = ({
  className = '',
  children,
  ariaLabel,
}) => (
  <span className={`${PILL_BASE} ${className}`} aria-label={ariaLabel}>
    {children}
  </span>
)

const DatePill: FC<{ currentCard?: boolean; children: React.ReactNode }> = ({
  currentCard,
  children,
}) => {
  const cls = currentCard
    ? 'bg-white/15 text-white ring-white/25 backdrop-blur-[2px]'
    : 'bg-slate-100 text-slate-800 ring-slate-200'
  return <BasePill className={cls}>{children}</BasePill>
}

type StatusKind = 'current' | 'mode' | 'gpa'

const StatusPill: FC<{
  current?: boolean
  mode?: WorkMode | null
  gpa?: number | string | null
  inCurrentCard?: boolean
  only?: StatusKind[]
}> = ({ current, mode, gpa, inCurrentCard = false, only }) => {
  const want = (k: StatusKind) => !only || only.includes(k)
  const pills: React.ReactNode[] = []

  if (mode && want('mode')) {
    const cls = inCurrentCard ? MODE_STYLES[mode].dark : MODE_STYLES[mode].light
    pills.push(
      <BasePill key={`mode-${mode}`} className={cls}>
        {WORK_MODE_LABEL[mode]}
      </BasePill>
    )
  }

  if (gpa !== undefined && gpa !== null && gpa !== '' && want('gpa')) {
    const val =
      typeof gpa === 'number'
        ? Number.isInteger(gpa)
          ? gpa.toString()
          : gpa.toFixed(2).replace(/\.00$/, '')
        : gpa
    const light = 'bg-cyan-50 text-cyan-700 ring-cyan-200'
    const dark = 'bg-cyan-400/25 text-white ring-cyan-200/30'
    pills.push(
      <BasePill key="gpa" className={inCurrentCard ? dark : light}>{`GPA ${val}`}</BasePill>
    )
  }

  if (current && want('current')) {
    pills.push(
      <BasePill key="current" className="bg-emerald-500/90 text-white ring-emerald-600/30">
        Current
      </BasePill>
    )
  }

  return pills.length ? <>{pills}</> : null
}

const MODE_STYLES: Record<WorkMode, { light: string; dark: string }> = {
  remote: {
    light: 'bg-violet-50 text-violet-700 ring-violet-200',
    dark: 'bg-violet-400/25 text-white ring-violet-200/30',
  },
  hybrid: {
    light: 'bg-amber-50 text-amber-700 ring-amber-200',
    dark: 'bg-amber-400/25 text-white ring-amber-200/30',
  },
  onsite: {
    light: 'bg-teal-50 text-teal-700 ring-teal-200',
    dark: 'bg-teal-400/25 text-white ring-teal-200/30',
  },
}

const Dot: FC<{ year: number; current?: boolean }> = ({ year, current }) => {
  const th = themeOfYear(year)
  return (
    <span
      className={[
        'relative z-20 block h-3.5 w-3.5 rounded-full ring-4',
        current ? 'bg-emerald-500 ring-emerald-500' : `bg-white ${th.dotRing}`,
      ].join(' ')}
    />
  )
}
const YearPillInline: FC<{ year: number; label?: React.ReactNode; bubble?: string }> = ({
  year,
  label,
  bubble,
}) => {
  const th = themeOfYear(year)
  const bubbleCls = bubble ?? th.bubble
  return (
    <div
      className={[
        'relative z-10',
        'inline-flex items-center justify-center',
        'h-8 px-3 rounded-full text-white text-lg font-bold leading-none',
        'shadow ring-1 ring-black/10',
        'bg-gradient-to-r',
        bubbleCls,
      ].join(' ')}
    >
      {label ?? year}
    </div>
  )
}

const Card: FC<{ entry: ExperienceItem; side: 'left' | 'right' }> = ({ entry, side }) => {
  const current = isPresent(entry.endDate)
  const year = startYear(entry)
  const th = themeOfYear(year)

  const shell = current
    ? 'bg-gradient-to-tr from-indigo-500 to-sky-500 text-white ring-0 shadow-[0_20px_60px_rgba(2,24,43,.22)]'
    : `bg-white text-slate-900 ring-1 ${th.cardRing} shadow-[0_12px_36px_rgba(2,24,43,.08)]`

  const accent = !current ? (
    <span
      className={[
        'absolute',
        side === 'left' ? 'right-0' : 'left-0',
        'top-3 bottom-3 md:top-4 md:bottom-4',
        'w-1.5 rounded-full',
        th.stripe,
      ].join(' ')}
    />
  ) : null

  const badges = sortTagBadges(entry.badges ?? [])

  return (
    <article
      className={[
        'relative rounded-3xl p-5 md:p-6 backdrop-blur-sm',
        shell,
        side === 'left' ? 'ml-auto' : 'mr-auto',
        'max-w-[520px] w-full',
      ].join(' ')}
    >
      {accent}

      <div className="flex items-center justify-between gap-3">
        <DatePill currentCard={current}>{fmtRange(entry.startDate, entry.endDate)}</DatePill>
        <div className="flex items-center gap-2">
          <StatusPill
            mode={entry.kind === 'work' ? entry.mode : null}
            gpa={entry.kind === 'education' ? entry.gpa : null}
            inCurrentCard={current}
            only={entry.kind === 'work' ? ['mode'] : ['gpa']}
          />
          <StatusPill current={current} only={['current']} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {entry.kind === 'education' ? (
          <GraduationCap className={current ? 'h-5 w-5 opacity-90' : 'h-5 w-5 text-slate-500'} />
        ) : (
          <Briefcase className={current ? 'h-5 w-5 opacity-90' : 'h-5 w-5 text-slate-500'} />
        )}
        <h3 className="text-lg font-bold leading-tight">{entry.role}</h3>
      </div>

      <div className={current ? 'text-white/90 mt-1' : 'text-slate-600 mt-1'}>
        <span className="font-medium">{entry.company}</span>
        <span className="mx-1.5">•</span>
        <span>{entry.location}</span>
      </div>

      {entry.description && (
        <p
          className={['mt-3 text-sm leading-6', current ? 'text-white/90' : 'text-slate-700'].join(
            ' '
          )}
        >
          {entry.description}
        </p>
      )}

      {badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((b, i) => (
            <TagPill
              key={`${entry.role}-${b.label}-${i}`}
              label={b.label}
              type={b.type}
              onDark={current}
            />
          ))}
        </div>
      )}
    </article>
  )
}

const ExperienceSection: FC = () => {
  const { data } = useExperience()
  const items = data?.items ?? []

  const sorted: ExperienceItem[] = useMemo(() => {
    return [...items].sort((a, b) => {
      const yearA = startYear(a)
      const yearB = startYear(b)
      if (yearA !== yearB) return yearB - yearA
      const cmp = endMs(b) - endMs(a)
      return cmp !== 0 ? cmp : startMs(b) - startMs(a)
    })
  }, [items])

  const years = useMemo(() => distinctStartYears(sorted), [sorted])
  const byYear = useMemo(() => groupByStartYear(sorted), [sorted])

  return (
    <Section id="experiences" title={data?.title} description={data?.subtitle} background="light">
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-y-6 md:gap-y-8">
          {(() => {
            let globalIndex = 0
            return years.map((y, yearIndex) => {
              const entries = byYear[String(y)] || []
              const th = themeOfYear(y)
              const isLastYear = yearIndex === years.length - 1
              const isFirstYear = yearIndex === 0

              return (
                <div key={y} className={isLastYear ? 'relative' : 'relative pb-2 md:pb-3'}>
                  {isFirstYear && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                      <YearPillInline
                        year={y}
                        label="Present"
                        bubble="from-emerald-600 to-teal-500"
                      />
                    </div>
                  )}

                  <div
                    className={[
                      'grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] md:gap-x-12 gap-y-6 md:gap-y-8 pb-4',
                      isFirstYear ? 'pt-8 md:pt-12' : '',
                    ].join(' ')}
                  >
                    {entries.map((entry) => {
                      const side: 'left' | 'right' = globalIndex % 2 === 0 ? 'left' : 'right'
                      const current = isPresent(entry.endDate)
                      globalIndex++

                      return (
                        <React.Fragment
                          key={`${entry.role}-${entry.startDate}-${entry.endDate ?? 'present'}`}
                        >
                          <div className="md:col-start-1">
                            {side === 'left' ? (
                              <Card entry={entry} side="left" />
                            ) : (
                              <div className="hidden md:block" />
                            )}
                          </div>

                          <div className="relative flex items-center justify-center md:col-start-2 z-20">
                            <Dot year={startYear(entry)} current={current} />
                            <div
                              className={[
                                'hidden md:block absolute top-1/2 -translate-y-1/2 h-[2px] pointer-events-none',
                                side === 'left'
                                  ? 'right-[calc(50%+11px)] w-11 -mr-px'
                                  : 'left-[calc(50%+11px)] w-11 -ml-px',
                                current ? 'bg-emerald-500' : th.stripe,
                              ].join(' ')}
                            />
                          </div>

                          <div className="md:col-start-3">
                            {side === 'right' ? (
                              <Card entry={entry} side="right" />
                            ) : (
                              <div className="hidden md:block" />
                            )}
                          </div>
                        </React.Fragment>
                      )
                    })}
                  </div>

                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <YearPillInline year={y} />
                  </div>
                  <div
                    className={[
                      'absolute left-1/2 -translate-x-1/2 w-[2px] rounded-full z-0',
                      th.bar,
                      '-top-4',
                      '-bottom-4',
                    ].join(' ')}
                  />
                </div>
              )
            })
          })()}
        </div>
      </div>
    </Section>
  )
}

export default ExperienceSection
