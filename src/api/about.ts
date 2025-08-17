import { get } from './strapi'

export type Media = { url?: string | null }

export type SocialMedia = {
  iconSVG?: Media | null
  label: string
  url: string
  description?: string | null
  buttonText?: string | null
  themes?: 'rose' | 'sky' | 'slate' | 'emerald' | 'violet' | 'amber' | 'teal' | null
  showInContact?: boolean | null
  file?: Media | null
  showInAbout?: boolean | null
}

export type BulletPoint = {
  iconSVG?: Media | null
  text: string
}

export type AboutContent = {
  heading?: string
  introTitle?: string
  introParagraph1?: string
  introParagraph2?: string | null
  profileImage?: Media | null
  socials: SocialMedia[]
  bulletPoints: BulletPoint[]
}

type AboutResponse = { data: AboutContent }

export async function fetchAbout(): Promise<AboutContent> {
  const url =
    '/api/about?' +
    'populate[profileImage]=true&' +
    'populate[socials][populate][iconSVG]=true&' +
    'populate[socials][populate][file]=true&' +
    'populate[bulletPoints][populate][iconSVG]=true'

  const json = await get<AboutResponse>(url)
  return json.data
}
