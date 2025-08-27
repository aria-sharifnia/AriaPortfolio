export type SectionKey = 'home' | 'about' | 'contact' | 'skills' | 'experience' | 'testimonials'

export type VersionManifest = {
  globalVersion: string
  sections: Record<SectionKey, string | null>
}

const VERSIONS_KEY = 'portfolioVersions'
const MANIFEST_COOLDOWN_MS = 5 * 60 * 1000
const MANIFEST_CACHE_KEY = 'manifestCache'

function shouldBypassCooldown(): boolean {
  try {
    return new URL(window.location.href).searchParams.get('forceVersionCheck') === '1'
  } catch {
    return false
  }
}

export function loadSavedManifest(): VersionManifest | null {
  try {
    return JSON.parse(localStorage.getItem(VERSIONS_KEY) || 'null')
  } catch {
    try {
      localStorage.removeItem(VERSIONS_KEY)
    } catch {
      void 0
    }
    return null
  }
}

export function saveManifest(v: VersionManifest): void {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(v))
}

export async function fetchManifest(): Promise<VersionManifest> {
  const force = shouldBypassCooldown()
  const now = Date.now()

  // --- DIAGNOSTIC: show we're in Production + what URL we'll use
  const raw = import.meta.env.VITE_STRAPI_URL as string | undefined
  if (!raw) {
    console.error(
      '[Manifest] VITE_STRAPI_URL is MISSING. ' +
        'On Vercel, make sure it is set for the **Production** environment.'
    )
    throw new Error('VITE_STRAPI_URL missing')
  }
  const base = raw.replace(/\/$/, '')
  const manifestUrl = `${base}/api/manifest?fields=globalVersion,homeVersion,aboutVersion,contactVersion,skillsVersion,experienceVersion,testimonialsVersion`
  if (new URL(window.location.href).searchParams.get('debug') === '1') {
    console.log('[Manifest] Using STRAPI URL:', base)
    console.log('[Manifest] GET', manifestUrl)
  }

  // cooldown (skipped when force=1)
  if (!force) {
    const cachedRaw = localStorage.getItem(MANIFEST_CACHE_KEY)
    if (cachedRaw) {
      try {
        const cached: { ts: number; data: VersionManifest } = JSON.parse(cachedRaw)
        if (now - cached.ts < MANIFEST_COOLDOWN_MS) {
          if (new URL(window.location.href).searchParams.get('debug') === '1') {
            console.log('[Manifest] Using cached manifest (cooldown)')
          }
          return cached.data
        }
      } catch {
        try {
          localStorage.removeItem(MANIFEST_CACHE_KEY)
        } catch {}
      }
    }
  }

  // network call
  let res: Response
  try {
    res = await fetch(manifestUrl, { cache: 'no-store', mode: 'cors' })
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

  if (new URL(window.location.href).searchParams.get('debug') === '1') {
    console.log('[Manifest] LIVE:', data)
  }

  try {
    localStorage.setItem(MANIFEST_CACHE_KEY, JSON.stringify({ ts: now, data }))
  } catch {}

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

function maybeClearCachesFromUrl() {
  const u = new URL(window.location.href)
  if (u.searchParams.get('clearCache') === '1') {
    try {
      localStorage.removeItem('portfolio-query-cache-v1')
      localStorage.removeItem('manifestCache')
      localStorage.removeItem('portfolioVersions')
      console.log('[Manifest] Cleared local caches (query param)')
    } catch {}
  }
}
