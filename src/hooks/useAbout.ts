import { useQuery } from '@tanstack/react-query'
import { fetchAbout } from '../api/about'
export function useAbout() {
  return useQuery({ queryKey: ['about'], queryFn: fetchAbout })
}
