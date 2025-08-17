import { useEffect, useState } from 'react'
import { fetchTestimonials, type TestimonialsContent } from '@/api/testimonials'

export function useTestimonials() {
  const [data, setData] = useState<TestimonialsContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let on = true
    fetchTestimonials()
      .then((d) => on && setData(d))
      .catch((e) => on && setError(e))
      .finally(() => on && setLoading(false))
    return () => {
      on = false
    }
  }, [])

  return { data, loading, error }
}
