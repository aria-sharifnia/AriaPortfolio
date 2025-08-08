import { get } from './strapi'

export type Media = { url?: string | null }

export type SocialMedia = {
  iconSVG?: Media | null
  label: string
  url: string
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
  socialMedias: SocialMedia[]
  bulletPoints: BulletPoint[]
}

type AboutResponse = { data: AboutContent }

export async function fetchAbout(): Promise<AboutContent> {
  const url =
    '/api/about?' +
    'populate[profileImage]=true&' +
    'populate[socialMedias][populate][iconSVG]=true&' +
    'populate[bulletPoints][populate][iconSVG]=true'

  const json = await get<AboutResponse>(url)
  return json.data
}
