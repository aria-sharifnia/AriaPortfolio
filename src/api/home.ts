import { get } from './strapi'

export type HomeContent = {
  greeting: string
  highlightedName: string
  jobTitle: string
  tagLine: string
  nameLogo: string
  viewMyWorkLabel: string
  downloadResumeLabel: string
  resume?: { url?: string } | null
}

type HomeResponse = { data: HomeContent }

export async function fetchHome(): Promise<HomeContent> {
  const json = await get<HomeResponse>('/api/home?populate=resume')
  return json.data
}
