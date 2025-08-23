import { get } from './strapi'

export type ContactContent = {
  heading: string
  description: string
}

type ContactResponse = { data: ContactContent }

export async function fetchContact(): Promise<ContactContent> {
  const json = await get<ContactResponse>('/api/contact')
  return json.data
}
