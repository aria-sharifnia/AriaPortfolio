import { useQuery, queryOptions } from '@tanstack/react-query'
import { fetchHome, type HomeContent } from '../api/home'

export const homeQuery = queryOptions<HomeContent>({
  queryKey: ['home'],
  queryFn: fetchHome,
})

export function useHome() {
  const { data, error, isLoading } = useQuery(homeQuery)
  return { data, error: error ? (error as Error).message : null, loading: isLoading }
}
