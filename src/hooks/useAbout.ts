import { useQuery } from '@tanstack/react-query'
import { fetchAbout } from '../api/about'

export function useAbout() {
  const { data } = useQuery({ queryKey: ['about'], queryFn: fetchAbout })
  return { data }
}
