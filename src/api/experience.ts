import { get } from './strapi'

export type ExperienceKind = 'work' | 'education'
export type WorkMode = 'remote' | 'hybrid' | 'onsite'

export type TagKind = 'frontend' | 'backend' | 'tools' | 'other'

export type ExperienceBadge = {
  label: string
  type?: TagKind | string | null
}

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
}

export type ExperienceItem = {
  kind: ExperienceKind
  role: string
  company: string
  location: string
  startDate: string
  endDate?: string | null
  mode?: WorkMode | null
  gpa?: number | string | null
  description?: string | null
  badges: ExperienceBadge[]
}

export type ExperienceContent = {
  title: string
  subtitle?: string | null
  items: ExperienceItem[]
}

type StrapiBadge = { label: string; type?: ExperienceBadge['type'] | null }
type StrapiItem = {
  experienceKind: ExperienceKind
  role: string
  company: string
  location: string
  startDate: string
  endDate?: string | null
  mode?: WorkMode | null
  gpa?: number | string | null
  description?: string | null
  badges?: StrapiBadge[]
}
type ExperienceResponse = {
  data: {
    heading: string
    description?: string | null
    items: StrapiItem[]
  }
}

const mapBadge = (b: StrapiBadge): ExperienceBadge => ({
  label: b.label,
  type: b.type ?? 'other',
})

const mapItem = (it: StrapiItem): ExperienceItem => ({
  kind: it.experienceKind,
  role: it.role,
  company: it.company,
  location: it.location,
  startDate: it.startDate,
  endDate: it.endDate ?? null,
  mode: it.mode ?? null,
  gpa: it.gpa ?? null,
  description: it.description ?? null,
  badges: (it.badges ?? []).map(mapBadge),
})

export async function fetchExperience(): Promise<ExperienceContent> {
  const res = await get<ExperienceResponse>('/api/experience?populate[items][populate]=badges')
  const d = res.data
  return {
    title: d.heading,
    subtitle: d.description ?? null,
    items: (d.items ?? []).map(mapItem),
  }
}
