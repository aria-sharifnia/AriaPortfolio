import type { TagKind } from '@/utils/tags'

export const TAG_STYLES: Record<TagKind, { light: string; dark: string }> = {
  frontend: {
    light: 'bg-sky-50 text-sky-700 ring-sky-200',
    dark: 'bg-sky-400/50 text-white ring-sky-200',
  },
  backend: {
    light: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    dark: 'bg-indigo-400/50 text-white ring-indigo-200',
  },
  tools: {
    light: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dark: 'bg-emerald-400/50 text-white ring-emerald-200',
  },
  other: {
    light: 'bg-slate-50 text-slate-700 ring-slate-200',
    dark: 'bg-slate-400/50 text-white ring-slate-200',
  },
}
