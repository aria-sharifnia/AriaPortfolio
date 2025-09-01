export const STRAPI_BASE = (import.meta.env.VITE_STRAPI_URL as string | undefined)?.replace(
  /\/$/,
  ''
)

if (!STRAPI_BASE && import.meta.env.PROD) {
  throw new Error('VITE_STRAPI_URL is missing in production build')
}

function buildHeaders(method: string, hasBody: boolean, init?: HeadersInit) {
  const h = new Headers(init)

  h.set('Accept', 'application/json')
  if (hasBody && method !== 'GET') {
    h.set('Content-Type', 'application/json')
  }

  const token = import.meta.env.VITE_STRAPI_TOKEN as string | undefined
  if (token) h.set('Authorization', `Bearer ${token}`)

  return h
}

async function request<T>(path: string, init: RequestInit = {}) {
  const method = (init.method || 'GET').toUpperCase()
  const hasBody = init.body != null

  const res = await fetch(`${STRAPI_BASE}${path}`, {
    ...init,
    method,
    headers: buildHeaders(method, hasBody, init.headers),
    credentials: 'omit',
  })

  if (!res.ok) {
    throw new Error(`Strapi ${res.status} ${res.statusText} for ${path}`)
  }
  return (await res.json()) as T
}

export function get<T>(path: string, init?: RequestInit) {
  return request<T>(path, { ...(init || {}), method: 'GET' })
}

export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  return `${import.meta.env.VITE_STRAPI_URL}${path}`
}
