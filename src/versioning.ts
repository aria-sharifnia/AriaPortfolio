export type SectionKey =
  | 'home'
  | 'about'
  | 'contact'
  | 'skills'
  | 'experience'
  | 'testimonials'

export type VersionManifest = {
  globalVersion: string
  sections: Record<SectionKey, string | null>
}

const VERSIONS_KEY = 'portfolioVersions' // only used to remember the last LIVE manifest we saw (for diffs)

function isDebug(): boolean {
  try { return new URL(window.location.href).searchParams.get('debug') === '1' } catch { return false }
}

export function loadSavedManifest(): VersionManifest | null {
  try {
    return JSON.parse(localStorage.getItem(VERSIONS_KEY) || 'null')
  } catch {
    try { localStorage.removeItem(VERSIONS_KEY) } catch {}
    return null
  }
}

export function saveManifest(v: VersionManifest): void {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(v))
}

/**
 * Always fetch the LIVE manifest from Strapi (no local cooldown, no cached copy).
 * One tiny request per visit.
 */
export async function fetchManifest(): Promise<VersionManifest> {
  const raw = import.meta.env.VITE_STRAPI_URL as string | undefined
  if (!raw) {
    console.error('[Manifest] VITE_STRAPI_URL is MISSING. Set it in Vercel Production.')
    throw new Error('VITE_STRAPI_URL missing')
  }
  const base = raw.replace(/\/$/, '')
  const url = `${base}/api/manifest`

  const debug = (() => {
    try { return new URL(window.location.href).searchParams.get('debug') === '1' } catch { return false }
  })()
  if (debug) {
    console.log('[Manifest] Using STRAPI URL:', base)
    console.log('[Manifest] GET', url)
  }

  let res: Response
  try {
    res = await fetch(url, { cache: 'no-store', mode: 'cors' })
  } catch (e) {
    console.error('[Manifest] Network error calling manifest:', e)
    throw e
  }
  if (!res.ok) {
    console.error('[Manifest] HTTP', res.status, 'while fetching manifest')
    throw new Error(`manifest fetch failed: ${res.status}`)
  }

  // v5: fields are on data.* (no attributes)
  // v4: fields are on data.attributes.*
  const json: any = await res.json()
  if (debug) console.log('[Manifest] RAW JSON:', json)

  const root = json?.data ?? {}
  const a: Record<string, unknown> =
    root && typeof root === 'object' && 'attributes' in root && root.attributes
      ? (root.attributes as Record<string, unknown>) // v4
      : (root as Record<string, unknown>)            // v5

  const data: VersionManifest = {
    globalVersion: (a.globalVersion as string) ?? '',
    sections: {
      home: (a.homeVersion as string) ?? null,
      about: (a.aboutVersion as string) ?? null,
      contact: (a.contactVersion as string) ?? null,
      skills: (a.skillsVersion as string) ?? null,
      experience: (a.experienceVersion as string) ?? null,
      testimonials: (a.testimonialsVersion as string) ?? null,
    },
  }

  if (debug) console.log('[Manifest] LIVE:', data)
  return data
}

export function diffSections(a: VersionManifest | null, b: VersionManifest): SectionKey[] {
  if (!a) return Object.keys(b.sections) as SectionKey[]
  const changed: SectionKey[] = []
  ;(Object.keys(b.sections) as SectionKey[]).forEach((k) => {
    if (a.sections[k] !== b.sections[k]) changed.push(k)
  })
  return changed
}