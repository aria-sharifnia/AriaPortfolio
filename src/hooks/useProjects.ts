import { useQuery } from '@tanstack/react-query'
import { fetchProjects } from '../api/project'

export function useProjects() {
  const { data } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects })
  return { data }
}
