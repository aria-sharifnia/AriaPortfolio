import type { TagKind } from '@/api/experience'

export const TAG_STYLES: Record<TagKind, { light: string; dark: string }> = {
  frontend: {
    light: 'bg-sky-50 text-sky-700 ring-sky-200',
    dark: 'bg-sky-400/50 text-white ring-sky-200',
  },
  backend: {
    light: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    dark: 'bg-indigo-400/50 text-white ring-indigo-200',
  },
  tools: {
    light: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dark: 'bg-emerald-400/50 text-white ring-emerald-200',
  },
  other: {
    light: 'bg-slate-50 text-slate-700 ring-slate-200',
    dark: 'bg-slate-400/50 text-white ring-slate-200',
  },
}

const PILL_BASE =
  'inline-flex items-center h-6 px-3 rounded-full text-[13px] font-semibold leading-none ring-1 shadow-sm'

export default function TagPill({
  label,
  type = 'other',
  onDark = false,
}: {
  label: string
  type?: TagKind
  onDark?: boolean
}) {
  const theme = onDark ? TAG_STYLES[type].dark : TAG_STYLES[type].light
  return <span className={`${PILL_BASE} ${theme}`}>{label}</span>
}

export type BadgeInput = { label?: string | null; type?: string | null }

const TAG_ORDER: Record<TagKind, number> = { frontend: 1, backend: 2, tools: 3, other: 4 }
const VALID_TYPES = new Set<TagKind>(['frontend', 'backend', 'tools', 'other'])

export function normalizeBadge(b: BadgeInput): { label: string; type: TagKind } | null {
  const label = (b.label ?? '').trim()
  if (!label) return null
  const raw = (b.type ?? 'other').toLowerCase()
  const type: TagKind = (VALID_TYPES.has(raw as TagKind) ? raw : 'other') as TagKind
  return { label, type }
}

export function sortTagBadges(badges: BadgeInput[] = []): { label: string; type: TagKind }[] {
  return badges
    .map(normalizeBadge)
    .filter((v): v is { label: string; type: TagKind } => !!v)
    .sort((a, b) => {
      const oa = TAG_ORDER[a.type],
        ob = TAG_ORDER[b.type]
      return oa === ob ? a.label.localeCompare(b.label) : oa - ob
    })
}
