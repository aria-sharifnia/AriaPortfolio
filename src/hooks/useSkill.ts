import { useEffect, useState } from 'react'
import { fetchSkill, type SkillsContent } from '../api/skill'

export function useSkill() {
  const [data, setData] = useState<SkillsContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let on = true
    fetchSkill()
      .then((d) => on && setData(d))
      .catch((e) => on && setError(e))
      .finally(() => on && setLoading(false))
    return () => {
      on = false
    }
  }, [])

  return { data, loading, error }
}
