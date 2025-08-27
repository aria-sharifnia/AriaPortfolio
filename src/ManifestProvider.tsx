import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  fetchManifest,
  loadSavedManifest,
  saveManifest,
  diffSections,
  type VersionManifest,
  type SectionKey,
} from './versioning'

import { fetchHome } from './api/home'
import { fetchAbout } from './api/about'
import { fetchContact } from './api/contact'
import { fetchSkill } from './api/skill'
import { fetchExperience } from './api/experience'
import { fetchTestimonials } from './api/testimonials'

type Ctx = {
  ready: boolean
  ok: boolean
  manifest: VersionManifest | null
  error: Error | null
  /** Triggers a refresh of the manifest & reseeding. Returns true if OK. */
  refetch: () => Promise<boolean>
}

const ManifestContext = createContext<Ctx | null>(null)

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

export function ManifestProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient()
  const [ready, setReady] = useState(false)
  const [ok, setOk] = useState(false)
  const [manifest, setManifest] = useState<VersionManifest | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const inFlight = useRef(false)

  const run = async (): Promise<boolean> => {
    if (inFlight.current) return ok
    inFlight.current = true
    try {
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
      setManifest(live)
      setOk(true)
      setError(null)
      return true
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Manifest bootstrap failed')
      setError(err)
      setOk(false)
      return false
    } finally {
      setReady(true)
      inFlight.current = false
    }
  }

  useEffect(() => {
    void run()
  }, [])

  const value: Ctx = {
    ready,
    ok,
    manifest,
    error,
    refetch: run,
  }

  return <ManifestContext.Provider value={value}>{children}</ManifestContext.Provider>
}

export function useManifest() {
  const ctx = useContext(ManifestContext)
  if (!ctx) throw new Error('useManifest must be used within <ManifestProvider>')
  return ctx
}
