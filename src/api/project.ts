import { get } from './strapi'
import type { TagKind } from './experience'
import type { Media } from './about'

export type BlogSection = { heading?: string; body: string }

export type Project = {
  id: string
  title: string
  description: string
  cover?: Media | null
  startDate?: string | null
  endDate?: string | null
  badges?: { label: string; type?: TagKind }[]
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
  cover?: Media | null
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

const mapBadge = (b: StrapiBadge) => ({
  label: b.label,
  type: (b.type as TagKind | undefined) ?? 'other',
})

const mapProject = (p: StrapiProjectItem): Project => ({
  id: String(p.id),
  title: p.title,
  description: p.description,
  cover: p.cover ?? null,
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
  const url =
    '/api/project?' +
    'populate[projects][populate][cover]=true&' +
    'populate[projects][populate][badges]=true&' +
    'populate[projects][populate][highlights]=true&' +
    'populate[projects][populate][blogSection]=true'

  const res = await get<ProjectsResponse>(url)

  const d = res.data
  return {
    title: d.heading,
    subtitle: d.description ?? null,
    items: (d.projects ?? []).map(mapProject),
  }
}
