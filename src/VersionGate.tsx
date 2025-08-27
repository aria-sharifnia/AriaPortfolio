import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  fetchManifest,
  loadSavedManifest,
  saveManifest,
  diffSections,
  type SectionKey,
} from './versioning'

import { fetchHome } from './api/home'
import { fetchAbout } from './api/about'
import { fetchContact } from './api/contact'
import { fetchSkill } from './api/skill'
import { fetchExperience } from './api/experience'
import { fetchTestimonials } from './api/testimonials'

const FETCHERS: Record<SectionKey, () => Promise<unknown>> = {
  home: fetchHome,
  about: fetchAbout,
  contact: fetchContact,
  skills: fetchSkill,
  experience: fetchExperience,
  testimonials: fetchTestimonials,
}

const KEYS: Record<SectionKey, readonly [string]> = {
  home: ['home'],
  about: ['about'],
  contact: ['contact'],
  skills: ['skills'],
  experience: ['experience'],
  testimonials: ['testimonials'],
}

// --- helpers (inline so you don't have to edit versioning.ts) ---
function isDebug(): boolean {
  try {
    return new URL(window.location.href).searchParams.get('debug') === '1'
  } catch {
    return false
  }
}
function maybeClearCachesFromUrl() {
  try {
    const u = new URL(window.location.href)
    if (u.searchParams.get('clearCache') === '1') {
      localStorage.removeItem('portfolio-query-cache-v1')
      localStorage.removeItem('manifestCache')
      localStorage.removeItem('portfolioVersions')
      if (isDebug()) console.log('[Gate] Cleared local caches via ?clearCache=1')
    }
  } catch {}
}

export function VersionGate({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      maybeClearCachesFromUrl()

      const saved = loadSavedManifest()
      if (isDebug()) console.log('[Gate] SAVED manifest:', saved)

      const live = await fetchManifest()
      if (isDebug()) console.log('[Gate] LIVE manifest:', live)

      const changed = diffSections(saved, live)
      if (isDebug()) console.log('[Gate] CHANGED sections:', changed)

      if (changed.length > 0) {
        const results = await Promise.all(
          changed.map(async (key) => {
            if (isDebug()) console.log(`[Gate] Fetching changed section: ${key}`)
            const data = await FETCHERS[key]()
            return { key, data }
          })
        )
        results.forEach(({ key, data }) => {
          qc.setQueryData(KEYS[key], data)
          if (isDebug()) console.log(`[Gate] Seeded cache for: ${key}`, { key, data })
        })
      }

      saveManifest(live)
      if (mounted) setReady(true)
    })().catch((err: unknown) => {
      console.error('[Gate] VersionGate failed', err)
      if (mounted) setReady(true) // fail-open so site still renders
    })
    return () => {
      mounted = false
    }
  }, [qc])

  if (!ready) return null
  return <>{children}</>
}
