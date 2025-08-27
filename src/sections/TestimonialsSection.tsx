import type { FC } from 'react'
import Section from '../components/layout/Section'
import { Quote, ExternalLink } from 'lucide-react'
import TagPill from '@/components/common/TagPill'
import { useTestimonials } from '@/hooks/useTestimonials'
import type { TestimonialItem } from '@/api/testimonials'
import { sortTagBadges } from '@/utils/tags'
import { mediaUrl } from '@/api/strapi'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

const TestimonialCard: FC<{ t: TestimonialItem }> = ({ t }) => {
  const initials = t.reviewer
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const badges = sortTagBadges(t.badges ?? [])

  const Identity = (
    <>
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200">
        {t.avatarUrl ? (
          <img
            src={mediaUrl(t.avatarUrl) ?? undefined}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-teal-50 text-sm font-bold text-teal-700">
            {initials}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-navy-900">{t.reviewer}</div>
        <div className="text-[13px] text-navy-600">
          {t.role}, {t.company}
        </div>
      </div>
      {t.profileUrl ? (
        <a
          href={t.profileUrl}
          target="_blank"
          rel="noreferrer noopener me"
          title="LinkedIn profile"
          aria-label={`Open ${t.reviewer}'s LinkedIn`}
          className="ml-2 inline-flex items-center text-[#0A66C2] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 rounded-sm"
        >
          {t.socialIconUrl ? (
            <img
              src={mediaUrl(t.socialIconUrl) ?? undefined}
              alt=""
              className="h-6 w-6 md:h-7 md:w-7"
            />
          ) : null}
        </a>
      ) : null}
    </>
  )

  return (
    <article
      className="relative flex h-full flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_16px_40px_rgba(2,24,43,.08)] ring-1 ring-gray-200"
      aria-label={`Testimonial from ${t.reviewer} at ${t.company}`}
    >
      <Quote aria-hidden className="absolute -top-3 left-6 h-7 w-7 text-teal-400 opacity-90" />
      <p className="mt-3 text-[15px] md:text-[16px] leading-7 md:leading-8 text-navy-700">
        {t.quote}
      </p>
      <div className="mt-1 text-[13px] text-navy-500">{fmtDate(t.date)}</div>

      {t.extraQuotes?.length ? (
        <div className="mt-4 space-y-4">
          {t.extraQuotes.map((x, i) => (
            <div key={i}>
              <p className="text-[15px] md:text-[16px] leading-7 md:leading-8 text-navy-700">
                {x.quote}
              </p>
              <div className="mt-1 text-[13px] text-navy-500">{fmtDate(x.date)}</div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center gap-3">{Identity}</div>

        {t.sourceUrl ? (
          <a
            href={t.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-[14px] text-navy-600 hover:text-navy-900"
          >
            Verified on Riipen <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
      {badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((b, i) => (
            <TagPill key={`${t.id}-${b.label}-${i}`} label={b.label} type={b.type} />
          ))}
        </div>
      )}
    </article>
  )
}

const TestimonialsSection: FC = () => {
  const { data } = useTestimonials()
  if (!data) return null

  return (
    <Section
      id="testimonials"
      title={data.title}
      description={data.subtitle ?? undefined}
      background="light"
    >
      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        {data.items.map((t) => (
          <TestimonialCard key={t.id} t={t} />
        ))}
      </div>
    </Section>
  )
}

export default TestimonialsSection
