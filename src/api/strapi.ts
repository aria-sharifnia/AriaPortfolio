export const STRAPI_BASE = (import.meta.env.VITE_STRAPI_URL as string | undefined)?.replace(
  /\/$/,
  ''
)

if (!STRAPI_BASE) {
  console.warn('Missing VITE_STRAPI_URL')
}

export async function get<T>(path: string): Promise<T> {
  const url = `${STRAPI_BASE}${path}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Strapi ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

export const mediaUrl = (p?: string) =>
  p?.startsWith('http') ? p : `${STRAPI_BASE ?? ''}${p ?? ''}`
