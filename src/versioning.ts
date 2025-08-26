export type SectionKey = 'home' | 'about' | 'contact' | 'skills' | 'experience' | 'testimonials'

export type VersionManifest = {
  globalVersion: string
  sections: Record<SectionKey, string | null>
}

const VERSIONS_KEY = 'portfolioVersions'

export function loadSavedManifest(): VersionManifest | null {
  try {
    return JSON.parse(localStorage.getItem(VERSIONS_KEY) || 'null')
  } catch {
    return null
  }
}
export function saveManifest(v: VersionManifest) {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(v))
}

export async function fetchManifest(): Promise<VersionManifest> {
  const base = (import.meta.env.VITE_STRAPI_URL as string).replace(/\/$/, '')
  const res = await fetch(
    `${base}/api/manifest?fields=globalVersion,homeVersion,aboutVersion,contactVersion,skillsVersion,experienceVersion,testimonialsVersion`,
    { cache: 'no-store' }
  )
  if (!res.ok) throw new Error(`manifest fetch failed: ${res.status}`)
  const json = await res.json()
  const a = json?.data?.attributes || {}

  const sections = {
    home: a.homeVersion ?? null,
    about: a.aboutVersion ?? null,
    contact: a.contactVersion ?? null,
    skills: a.skillsVersion ?? null,
    experience: a.experienceVersion ?? null,
    testimonials: a.testimonialsVersion ?? null,
  } as VersionManifest['sections']

  return {
    globalVersion: a.globalVersion ?? '',
    sections,
  }
}

export function diffSections(a: VersionManifest | null, b: VersionManifest): SectionKey[] {
  if (!a) return Object.keys(b.sections) as SectionKey[]
  const changed: SectionKey[] = []
  ;(Object.keys(b.sections) as SectionKey[]).forEach((k) => {
    if (a.sections[k] !== b.sections[k]) changed.push(k)
  })
  return changed
}
