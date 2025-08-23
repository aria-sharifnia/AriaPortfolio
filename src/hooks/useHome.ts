import { useQuery } from '@tanstack/react-query'
import { fetchHome } from '../api/home'

export function useHome() {
  const { data } = useQuery({ queryKey: ['home'], queryFn: fetchHome })
  return { data }
}
