import type { FC } from 'react'
import Section from '../components/layout/Section'
import { useAbout } from '../hooks/useAbout'
import { mediaUrl } from '../api/strapi'
import InlineSvg from '../components/common/inlineSVG'

const AboutSection: FC = () => {
  const { data } = useAbout()
  const imgSrc = mediaUrl(data?.profileImage?.url)

  return (
    <Section id="about" title={data?.heading} background="light">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-5 md:items-center">
        <div className="md:col-span-2">
          <img src={imgSrc} alt="Profile" className="w-full rounded-xl shadow-xl object-cover" />
        </div>

        <div className="md:col-span-3">
          <h3 className="text-2xl font-bold text-navy-800">{data?.introTitle}</h3>

          {data?.introParagraph1 && (
            <p className="mt-4 text-gray-700 leading-8">{data.introParagraph1}</p>
          )}
          {data?.introParagraph2 && (
            <p className="mt-4 text-gray-700 leading-8">{data.introParagraph2}</p>
          )}

          {data?.bulletPoints?.length ? (
            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-gray-900">
              {data.bulletPoints.map((b, i) => (
                <span key={i} className="inline-flex items-center gap-2">
                  <InlineSvg
                    src={mediaUrl(b.iconSVG?.url ?? undefined)}
                    className="h-5 w-5 text-teal-500"
                    useCurrentColor
                  />
                  {b.text}
                </span>
              ))}
            </div>
          ) : null}

          {data?.socialMedias?.length ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {data.socialMedias.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  title={s.label}
                  aria-label={s.label}
                  className="inline-flex size-14 items-center justify-center transition-transform duration-400 ease-out hover:scale-125 focus:scale-125 focus:outline-none cursor-pointer"
                >
                  <InlineSvg src={mediaUrl(s.iconSVG?.url ?? undefined)} className="size-9" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

export default AboutSection
