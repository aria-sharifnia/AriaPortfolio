import { useQuery } from '@tanstack/react-query'
import { fetchExperience } from '../api/experience'

export function useExperience() {
  const { data } = useQuery({ queryKey: ['experience'], queryFn: fetchExperience })
  return { data }
}
