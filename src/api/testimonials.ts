import { get } from './strapi'

export type TestimonialBadge = { label: string; type?: string | null }
export type TestimonialQuote = { quote: string; date: string }

export type TestimonialItem = {
  id: string
  reviewer: string
  role: string
  company: string
  profileUrl?: string | null
  sourceUrl?: string | null
  avatarUrl?: string | null
  socialIconUrl?: string | null
  quote: string
  date: string
  extraQuotes?: TestimonialQuote[]
  badges: TestimonialBadge[]
}

export type TestimonialsContent = {
  title: string
  subtitle?: string | null
  items: TestimonialItem[]
}

const API_ID = '/api/testimonial'

type StrapiBadge = { label: string; type?: string | null }
type StrapiQuote = { quote: string; date: string }
type StrapiMedia = { url: string }
type StrapiCard = {
  reviewerName: string
  role: string
  company: string
  profileUrl?: string | null
  sourceUrl?: string | null
  profilePicture?: StrapiMedia | null
  socialIcon?: StrapiMedia | null
  badge?: StrapiBadge[]
  quotes?: StrapiQuote[]
}
type TestimonialsResponse = {
  data: {
    heading: string
    description?: string | null
    testimonials: StrapiCard[]
  }
}

const mapCard = (c: StrapiCard): TestimonialItem | null => {
  const quotes = [...(c.quotes ?? [])]
    .filter((q) => q.quote?.trim())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  if (!quotes.length) return null

  const [main, ...extras] = quotes
  return {
    id: `${c.reviewerName}-${c.company}-${main.date}`,
    reviewer: c.reviewerName,
    role: c.role,
    company: c.company,
    profileUrl: c.profileUrl ?? null,
    sourceUrl: c.sourceUrl ?? null,
    avatarUrl: c.profilePicture?.url ?? null,
    socialIconUrl: c.socialIcon?.url ?? null,
    quote: main.quote,
    date: main.date,
    extraQuotes: extras,
    badges: (c.badge ?? []) as TestimonialBadge[],
  }
}

const POPULATE =
  '?populate[testimonials][populate][0]=badge' +
  '&populate[testimonials][populate][1]=quotes' +
  '&populate[testimonials][populate][2]=profilePicture' +
  '&populate[testimonials][populate][3]=socialIcon'

export async function fetchTestimonials(): Promise<TestimonialsContent> {
  const res = await get<TestimonialsResponse>(`${API_ID}${POPULATE}`)
  const d = res.data
  const items = (d.testimonials ?? []).map(mapCard).filter(Boolean) as TestimonialItem[]
  return { title: d.heading, subtitle: d.description ?? null, items }
}
