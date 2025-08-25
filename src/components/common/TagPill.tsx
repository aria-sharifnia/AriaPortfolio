import type { TagKind } from '@/utils/tags'
import { TAG_STYLES } from '@/theme/tagStyles'

const PILL_BASE =
  'inline-flex items-center h-6 px-3 rounded-full text-[13px] font-semibold leading-none ring-1 shadow-sm whitespace-nowrap shrink-0'

export default function TagPill({
  label,
  type = 'other',
  onDark = false,
}: {
  label: string
  type?: TagKind
  onDark?: boolean
}) {
  const theme = onDark ? TAG_STYLES[type].dark : TAG_STYLES[type].light
  return <span className={`${PILL_BASE} ${theme}`}>{label}</span>
}
