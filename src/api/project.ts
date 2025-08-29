import { get, mediaUrl as toAbsUrl } from './strapi'

export type Media = { url?: string | null }

export type BlogSection = { heading?: string; body: string }

export type TagKind = 'frontend' | 'backend' | 'tools' | 'other'

export type Project = {
  id: string
  title: string
  description: string
  cover?: Media | null
  startDate?: string | null
  endDate?: string | null
  badges?: { label: string; type?: TagKind | string | null }[]
  highlights?: string[]
  demoUrl?: string
  repoUrl?: string
  blogTitle?: string
  blog?: BlogSection[]
}

export type ProjectsContent = {
  title: string
  subtitle?: string | null
  items: Project[]
}

type StrapiBadge = { label: string; type?: TagKind | string | null }
type StrapiHighlight = { text: string }
type StrapiBlogSection = { heading?: string | null; body: string }

type StrapiProjectItem = {
  id: number
  title: string
  description: string
  cover?: Media | Media[] | null
  startDate?: string | null
  endDate?: string | null
  demoUrl?: string | null
  repoUrl?: string | null
  badges?: StrapiBadge[] | null
  highlights?: StrapiHighlight[] | null
  blogTitle?: string | null
  blogSection?: StrapiBlogSection[] | null
}

type ProjectsResponse = {
  data: {
    heading: string
    description?: string | null
    projects: StrapiProjectItem[] | null
  }
}

const firstMedia = (input?: Media | Media[] | null): Media | null => {
  if (!input) return null
  return Array.isArray(input) ? (input.length > 0 ? input[0] : null) : input
}

const mapBadge = (b: StrapiBadge) => ({
  label: b.label,
  type: b.type ?? 'other',
})

const pickBestUrl = (m?: any | null): string | null => {
  if (!m) return null
  const candidates = [
    m?.formats?.large?.url,
    m?.formats?.medium?.url,
    m?.formats?.small?.url,
    m?.url,
  ]
  const u = candidates.find((x) => typeof x === 'string' && x.length > 0) as
    | string
    | undefined
  return u ? toAbsUrl(u) ?? null : null
}

const mapProject = (p: StrapiProjectItem): Project => ({
  id: String(p.id),
  title: p.title,
  description: p.description,
  cover: (() => {
    const m = firstMedia(p.cover)
    const url = pickBestUrl(m)
    return url ? { url } : null
  })(),
  startDate: p.startDate ?? null,
  endDate: p.endDate ?? null,
  demoUrl: p.demoUrl ?? undefined,
  repoUrl: p.repoUrl ?? undefined,
  badges: (p.badges ?? []).map(mapBadge),
  highlights: (p.highlights ?? []).map((h) => h.text),
  blogTitle: p.blogTitle ?? undefined,
  blog: (p.blogSection ?? []).map((s) => ({
    heading: s.heading ?? undefined,
    body: s.body,
  })),
})

export async function fetchProjects(): Promise<ProjectsContent> {
  const res = await get<ProjectsResponse>(
    [
      '/api/project',
      'populate[projects][populate][cover]=true',
      'populate[projects][populate][badges]=true',
      'populate[projects][populate][highlights]=true',
      'populate[projects][populate][blogSection]=true',
    ].join('?')
  )

  const d = res.data
  return {
    title: d.heading,
    subtitle: d.description ?? null,
    items: (d.projects ?? []).map(mapProject),
  }
}
