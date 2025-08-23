import type { FC } from 'react'
import Section from '../components/layout/Section'
import PrimaryButton from '../components/common/PrimaryButton/PrimaryButton'
import InlineSvg from '@/components/common/inlineSVG'
import { useAbout } from '@/hooks/useAbout'
import { mediaUrl } from '@/api/strapi'
import { downloadFile } from '@/utils/download'
import { useContact } from '@/hooks/useContact'

const THEME = {
  rose: {
    ring: 'ring-rose-200',
    grad: 'from-rose-50',
    icon: 'text-rose-600',
    btn: 'bg-rose-500',
    focus: 'focus-visible:ring-rose-300',
  },
  sky: {
    ring: 'ring-sky-200',
    grad: 'from-sky-50',
    icon: 'text-sky-600',
    btn: 'bg-sky-600',
    focus: 'focus-visible:ring-sky-300',
  },
  slate: {
    ring: 'ring-slate-300',
    grad: 'from-slate-50',
    icon: 'text-slate-700',
    btn: 'bg-slate-800',
    focus: 'focus-visible:ring-slate-400',
  },
  emerald: {
    ring: 'ring-emerald-200',
    grad: 'from-emerald-50',
    icon: 'text-emerald-600',
    btn: 'bg-emerald-600',
    focus: 'focus-visible:ring-emerald-300',
  },
  violet: {
    ring: 'ring-violet-200',
    grad: 'from-violet-50',
    icon: 'text-violet-600',
    btn: 'bg-violet-600',
    focus: 'focus-visible:ring-violet-300',
  },
  amber: {
    ring: 'ring-amber-200',
    grad: 'from-amber-50',
    icon: 'text-amber-600',
    btn: 'bg-amber-500',
    focus: 'focus-visible:ring-amber-300',
  },
  teal: {
    ring: 'ring-teal-200',
    grad: 'from-teal-50',
    icon: 'text-teal-600',
    btn: 'bg-teal-600',
    focus: 'focus-visible:ring-teal-300',
  },
} as const
type ThemeKey = keyof typeof THEME
const themeOf = (k?: string) => THEME[(k as ThemeKey) || 'teal']

const ContactSection: FC = () => {
  const { data: about } = useAbout()
  const { data: contact } = useContact()
  const links = (about?.socials ?? []).filter((l) => l.showInContact !== false)

  return (
    <Section
      id="contact"
      title={contact?.heading}
      background="gray"
      description={contact?.description}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((l, i) => {
          const t = themeOf(l.themes || undefined)
          const hasFile = !!l.file?.url
          const fileHref = hasFile ? mediaUrl(l.file!.url) : undefined
          const fileName = 'Aria_Sharifnia_Resume.pdf'
          const urlHref =
            l.url?.includes('@') && !l.url?.startsWith('http') ? `mailto:${l.url}` : l.url
          const href = fileHref ?? urlHref ?? '#'
          const isExternal = !hasFile && !!urlHref && !urlHref.startsWith('mailto:')

          return (
            <div
              key={i}
              className={`rounded-2xl p-6 shadow-sm ring-1 bg-gradient-to-b to-white ${t.ring} ${t.grad}`}
            >
              <div
                className={`mx-auto mb-4 grid size-12 place-items-center rounded-full ring-1 ${t.ring}`}
              >
                <InlineSvg src={mediaUrl(l.iconSVG?.url)} className="size-5" />
              </div>

              <h3 className="text-center font-semibold text-navy-800">{l.label}</h3>
              {l.description && (
                <p className="mt-1 text-center text-sm text-slate-500">{l.description}</p>
              )}

              <PrimaryButton
                href={href}
                download={hasFile || undefined}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
                onClick={async (e) => {
                  if (!hasFile || !fileHref) return
                  e.preventDefault()
                  try {
                    await downloadFile(fileHref, fileName)
                  } catch {
                    window.open(fileHref, '_blank', 'noopener,noreferrer')
                  }
                }}
                className={`mt-4 !flex w-full justify-center rounded-full px-5 py-3 font-semibold text-white shadow ${t.btn} ${t.focus}`}
              >
                {l.buttonText ||
                  (hasFile
                    ? 'Download'
                    : l.label?.toLowerCase() === 'email'
                      ? 'Send Message'
                      : 'Open')}
              </PrimaryButton>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

export default ContactSection
