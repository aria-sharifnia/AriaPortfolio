import { useQuery } from '@tanstack/react-query'
import { get } from '../api/strapi'
import { mediaUrl } from '../api/strapi'

type StrapiImage = {
  data?: { attributes?: { url?: string } } | null
}

type SocialLinkRaw = {
  id: number
  attributes: {
    name: string
    url: string
    color?: string | null
    show?: boolean
    order?: number | null
    icon?: StrapiImage | null
  }
}

type SocialsResponse = {
  data: SocialLinkRaw[]
}

export type SocialLink = {
  id: number
  name: string
  url: string
  color: string
  iconUrl?: string
}

export function useSocials() {
  return useQuery({
    queryKey: ['socials'],
    queryFn: async (): Promise<SocialLink[]> => {
      const res = await get<SocialsResponse>(
        '/api/social-links?sort=order:asc&filters[show][$eq]=true&populate=icon'
      )
      return (res.data || []).map((item) => {
        const att = item.attributes
        const rawUrl = att.icon?.data?.attributes?.url
        return {
          id: item.id,
          name: att.name,
          url: att.url,
          color: att.color || '#0b2945',
          iconUrl: rawUrl ? mediaUrl(rawUrl) : undefined,
        }
      })
    },
    staleTime: 5 * 60 * 1000,
  })
}