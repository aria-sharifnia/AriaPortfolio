import { fetchContact } from '@/api/contact'
import { useQuery } from '@tanstack/react-query'

export function useContact() {
  const { data } = useQuery({ queryKey: ['contact'], queryFn: fetchContact })
  return { data }
}
