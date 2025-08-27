export type SectionKey = 'home' | 'about' | 'contact' | 'skills' | 'experience' | 'testimonials'

export type VersionManifest = {
  globalVersion: string
  sections: Record<SectionKey, string | null>
}

const VERSIONS_KEY = 'portfolioVersions'

type ManifestRecord = {
  id: number
  documentId?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  globalVersion?: string
  homeVersion?: string | null
  aboutVersion?: string | null
  contactVersion?: string | null
  skillsVersion?: string | null
  experienceVersion?: string | null
  testimonialsVersion?: string | null
}
type StrapiV5SingleTypeResponse<T> = { data: T | null; meta?: Record<string, unknown> }

let storageHealthy = true
let memManifest: VersionManifest | null = null

export function loadSavedManifest(): VersionManifest | null {
  if (!storageHealthy) return memManifest
  try {
    const raw = localStorage.getItem(VERSIONS_KEY)
    return raw ? (JSON.parse(raw) as VersionManifest) : memManifest
  } catch {
    // try to clear the corrupt key; if that fails, keep going
    try {
      localStorage.removeItem(VERSIONS_KEY)
    } catch {
      /* intentionally empty */
    }
    storageHealthy = false
    return memManifest
  }
}

export function saveManifest(v: VersionManifest): void {
  memManifest = v
  if (!storageHealthy) return
  try {
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(v))
  } catch {
    storageHealthy = false
  }
}

export async function fetchManifest(): Promise<VersionManifest> {
  const res = await fetch('/api/manifest', { cache: 'no-store' })
  if (!res.ok) throw new Error(`manifest fetch failed: ${res.status}`)

  const json = (await res.json()) as StrapiV5SingleTypeResponse<ManifestRecord>
  const m = (json.data ?? {}) as Partial<ManifestRecord>

  const vm: VersionManifest = {
    globalVersion: m.globalVersion ?? '',
    sections: {
      home: m.homeVersion ?? null,
      about: m.aboutVersion ?? null,
      contact: m.contactVersion ?? null,
      skills: m.skillsVersion ?? null,
      experience: m.experienceVersion ?? null,
      testimonials: m.testimonialsVersion ?? null,
    },
  }
  return vm
}

export function diffSections(a: VersionManifest | null, b: VersionManifest): SectionKey[] {
  if (!a) return Object.keys(b.sections) as SectionKey[]
  const changed: SectionKey[] = []
  ;(Object.keys(b.sections) as SectionKey[]).forEach((k) => {
    if (a.sections[k] !== b.sections[k]) changed.push(k)
  })
  return changed
}
