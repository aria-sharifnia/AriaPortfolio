export type TagKind = 'frontend' | 'backend' | 'tools' | 'other'
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
