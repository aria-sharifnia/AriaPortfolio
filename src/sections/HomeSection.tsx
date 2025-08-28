import type { FC } from 'react'
import { ArrowDown, Download, Code2 } from 'lucide-react'
import PrimaryButton from '../components/common/PrimaryButton/PrimaryButton'
import { useHome } from '../hooks/useHome'
import { useAbout } from '../hooks/useAbout'
import { mediaUrl } from '../api/strapi'
import { downloadFile } from '../utils/download'
import type { SocialMedia } from '../api/about'

const baseButton = 'rounded-full px-10 py-4 text-base font-semibold shadow-md'
const primaryButton = `${baseButton} bg-teal-400 text-slate-900`
const secondaryButton = `${baseButton} border border-white/40 bg-white/5 sm:bg-white/10 sm:backdrop-blur-sm`

const HomeSection: FC = () => {
  const { data: home } = useHome()
  const { data: about } = useAbout()
  const resumeSocial = about?.socials?.find((s: SocialMedia) => s.file?.url)
  const resumeHref = resumeSocial?.file?.url ? mediaUrl(resumeSocial.file.url) : undefined
  const resumeBtnText = home?.downloadResumeLabel ?? 'Download My Resume'
  const resumeAria = resumeSocial?.label

  async function handleResumeClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!resumeHref) return
    e.preventDefault()
    try {
      await downloadFile(resumeHref, 'Aria_Sharifnia_Resume.pdf')
    } catch (err) {
      console.error(err)
      window.open(resumeHref, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section
      id="home"
      className="relative isolate w-full min-h-screen overflow-hidden text-gray-100
                 bg-gradient-to-br from-[#164a7b] via-[#123f6b] to-[#0b2945]"
    >
      <div
        className="relative mx-auto flex flex-col items-center justify-center
                   w-full px-4 sm:w-5/6 lg:w-3/4 xl:w-2/3
                   min-h-[calc(100svh-var(--header-h))] pb-16 sm:pb-20"
        style={{
          paddingTop: 'calc(var(--header-h) + 10px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 64px)',
        }}
      >
        <span className="mb-6 mt-2 flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/5 sm:bg-white/10 sm:backdrop-blur-sm">
          <Code2 className="h-10 w-10 text-white" strokeWidth={2} aria-hidden="true" />
        </span>

        <h1 className="text-center text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
          {home?.greeting ?? "Hi, I'm"}{' '}
          <span className="text-teal-400">{home?.highlightedName ?? 'Aria'}</span>
        </h1>

        <p className="mt-6 text-center text-2xl font-semibold text-gray-200 sm:text-3xl">
          {home?.jobTitle ?? 'Computer Science Student & Full-Stack Developer'}
        </p>

        <p
          className="mt-8 max-w-4xl text-center text-lg text-gray-300 sm:text-xl"
          style={{ minHeight: '3.25rem' }}
        >
          {home?.tagLine ??
            'I build thoughtful, reliable software—turning ideas into useful technology that makes life easier, because crafting elegant solutions is what I enjoy most.'}
        </p>

        <div className="mt-14 flex flex-wrap justify-center gap-8">
          <PrimaryButton href="#projects" className={primaryButton}>
            {home?.viewMyWorkLabel ?? 'View My Projects'}
            <ArrowDown className="h-5 w-5 -mt-0.5" strokeWidth={2} />
          </PrimaryButton>

          <PrimaryButton
            href={resumeHref || '#'}
            onClick={handleResumeClick}
            download
            aria-label={resumeAria}
            className={secondaryButton}
          >
            {resumeBtnText}
            <Download className="h-5 w-5 -mt-0.5" strokeWidth={2} />
          </PrimaryButton>
        </div>
      </div>

      <div className="absolute bottom-6 hidden w-full justify-center sm:flex md:bottom-8">
        <ArrowDown
          data-interactive
          className="h-8 w-8 cursor-pointer md:animate-bounce text-white"
          strokeWidth={2}
          onClick={() => {
            document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      </div>
    </section>
  )
}

export default HomeSection
