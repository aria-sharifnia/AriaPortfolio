import { get, mediaUrl } from './strapi'
import type { TagKind } from './experience'
import type { Media } from './about'

export type BlogSection = { heading?: string; body: string }

export type Project = {
  id: string
  title: string
  description: string
  coverUrl?: string | null  // Changed from cover to coverUrl
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

const mapProject = (p: StrapiProjectItem): Project => {
  // Debug logging to see what we're getting
  console.log('Raw project data:', {
    id: p.id,
    title: p.title,
    cover: p.cover
  })
  
  // Process cover URL like testimonials do
  const coverUrl = mediaUrl(p.cover?.url ?? undefined) ?? null
  console.log('Processed cover URL:', coverUrl)
  
  return {
    id: String(p.id),
    title: p.title,
    description: p.description,
    coverUrl, // Use processed URL
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
  }
}

// Use the exact same populate pattern as testimonials
const POPULATE =
  '?populate[projects][populate][0]=badges' +
  '&populate[projects][populate][1]=highlights' +
  '&populate[projects][populate][2]=blogSection' +
  '&populate[projects][populate][3]=cover'

export async function fetchProjects(): Promise<ProjectsContent> {
  const res = await get<ProjectsResponse>(`/api/project${POPULATE}`)
  console.log('Full API response:', JSON.stringify(res, null, 2))
  const d = res.data
  const result = {
    title: d.heading,
    subtitle: d.description ?? null,
    items: (d.projects ?? []).map(mapProject),
  }
  return result
}