import { useEffect, useState } from 'react'
import { fetchExperience, type ExperienceContent } from '../api/experience'

export function useExperience() {
  const [data, setData] = useState<ExperienceContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let on = true
    fetchExperience()
      .then((d) => on && setData(d))
      .catch((e) => on && setError(e))
      .finally(() => on && setLoading(false))
    return () => {
      on = false
    }
  }, [])

  return { data, loading, error }
}
