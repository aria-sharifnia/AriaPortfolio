import { useQuery } from '@tanstack/react-query'
import { fetchSkill } from '../api/skill'

export function useSkill() {
  const { data } = useQuery({ queryKey: ['skills'], queryFn: fetchSkill })
  return { data }
}
