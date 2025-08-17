import { get } from './strapi'

export type HomeContent = {
  greeting: string
  highlightedName: string
  jobTitle: string
  tagLine: string
  nameLogo: string
  viewMyWorkLabel: string
  downloadResumeLabel: string
}

type HomeResponse = { data: HomeContent }

export async function fetchHome(): Promise<HomeContent> {
  const json = await get<HomeResponse>('/api/home')
  return json.data
}
