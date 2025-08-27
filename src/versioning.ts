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
    console.error(
      '[Manifest] VITE_STRAPI_URL is MISSING. ' +
      'On Vercel, make sure it is set for the **Production** environment.'
    )
    throw new Error('VITE_STRAPI_URL missing')
  }
  const base = raw.replace(/\/$/, '')
  const url =
    `${base}/api/manifest?fields=` +
    [
      'globalVersion',
      'homeVersion',
      'aboutVersion',
      'contactVersion',
      'skillsVersion',
      'experienceVersion',
      'testimonialsVersion',
    ].join(',')

  if (isDebug()) {
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

  const json: { data?: { attributes?: Record<string, unknown> } } = await res.json()
  const a = (json.data?.attributes || {}) as Record<string, unknown>

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

  if (isDebug()) console.log('[Manifest] LIVE:', data)
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