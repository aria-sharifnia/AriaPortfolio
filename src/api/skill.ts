import { get, mediaUrl } from './strapi'
import type { PaletteKey } from '../theme/palettes'

export type SkillItem = { text: string; level: number; icon: string | null }
export type SkillsCategory = { title: string; palette: PaletteKey; items: SkillItem[] }
export type SkillsContent = {
  title: string
  subtitle?: string | null
  categories: SkillsCategory[]
}

type StrapiMedia = { url?: string | null } | null | undefined
type StrapiSkillItem = { label: string; level?: number | null; icon?: StrapiMedia }
type StrapiCategory = { title: string; palette: PaletteKey; items: StrapiSkillItem[] }
type SkillResponse = {
  data: {
    heading: string
    description?: string | null
    categories: StrapiCategory[]
  }
}

const toUrl = (m?: StrapiMedia): string | null => {
  const u = (m ?? undefined)?.url
  return u ? (mediaUrl(u) ?? null) : null
}

const mapItem = (it: StrapiSkillItem): SkillItem => ({
  text: it.label,
  level: Number(it.level ?? 3),
  icon: toUrl(it.icon),
})

const mapCategory = (c: StrapiCategory): SkillsCategory => ({
  title: c.title,
  palette: c.palette ?? ('sky' as PaletteKey),
  items: (c.items ?? []).map(mapItem),
})

export async function fetchSkill(): Promise<SkillsContent> {
  const res = await get<SkillResponse>(
    '/api/skill?populate[categories][populate][items][populate]=icon'
  )
  const d = res.data
  return {
    title: d.heading,
    subtitle: d.description ?? null,
    categories: (d.categories ?? []).map(mapCategory),
  }
}
