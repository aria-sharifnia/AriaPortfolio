import { get } from './strapi'

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
  cover?: Media[] | null
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

const firstMedia = (arr?: Media[] | null): Media | null => (arr && arr.length > 0 ? arr[0] : null)

const mapBadge = (b: StrapiBadge) => ({
  label: b.label,
  type: b.type ?? 'other',
})

const mapProject = (p: StrapiProjectItem): Project => ({
  id: String(p.id),
  title: p.title,
  description: p.description,
  cover: firstMedia(p.cover),
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
