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

export function VersionGate({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const saved = loadSavedManifest()
      const live = await fetchManifest()
      const changed = diffSections(saved, live)

      if (changed.length > 0) {
        const results = await Promise.all(
          changed.map(async (key) => {
            const data = await FETCHERS[key]()
            return { key, data }
          })
        )
        results.forEach(({ key, data }) => {
          qc.setQueryData(KEYS[key], data)
        })
      }

      saveManifest(live)
      if (mounted) setReady(true)
    })().catch((err: unknown) => {
      console.error('[VersionGate] failed:', err)
      if (mounted) setReady(true)
    })

    return () => {
      mounted = false
    }
  }, [qc])

  if (!ready) return null
  return <>{children}</>
}
