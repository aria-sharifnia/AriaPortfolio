import { useQuery } from '@tanstack/react-query'
import { fetchTestimonials } from '@/api/testimonials'

export function useTestimonials() {
  const { data } = useQuery({ queryKey: ['testimonials'], queryFn: fetchTestimonials })
  return { data }
}
