import type { FC } from 'react'
import { memo, useMemo, useCallback, lazy, Suspense } from 'react'
import PrimaryButton from '../components/common/PrimaryButton/PrimaryButton'
import { useHome } from '../hooks/useHome'
import { useAbout } from '../hooks/useAbout'
import { mediaUrl } from '../api/strapi'
import { downloadFile } from '../utils/download'
import type { SocialMedia } from '../api/about'
import { ArrowDown, Code2, Download } from 'lucide-react'

const BUTTON_STYLES = {
  primary: 'rounded-full px-10 py-4 text-base font-semibold shadow-md bg-teal-400 text-slate-900',
  secondary:
    'rounded-full px-10 py-4 text-base font-semibold shadow-md border border-white/40 bg-white/5 sm:bg-white/10 sm:backdrop-blur-sm',
} as const

const LazyScrollArrow = lazy(() =>
  Promise.resolve({
    default: memo(() => (
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
    )),
  })
)

const HomeSection: FC = memo(() => {
  const { data: home } = useHome()
  const { data: about } = useAbout()
  const resumeData = useMemo(() => {
    if (!about?.socials) return { href: undefined, btnText: 'Download My Resume', aria: undefined }

    const resumeSocial = about.socials.find((s: SocialMedia) => s.file?.url)
    return {
      href: resumeSocial?.file?.url ? mediaUrl(resumeSocial.file.url) : undefined,
      btnText: home?.downloadResumeLabel ?? 'Download My Resume',
      aria: resumeSocial?.label,
    }
  }, [about?.socials, home?.downloadResumeLabel])

  const textContent = useMemo(
    () => ({
      greeting: home?.greeting ?? "Hi, I'm",
      name: home?.highlightedName ?? 'Aria',
      jobTitle: home?.jobTitle ?? 'Computer Science Student & Full-Stack Developer',
      tagLine:
        home?.tagLine ??
        'I build thoughtful, reliable software—turning ideas into useful technology that makes life easier, because crafting elegant solutions is what I enjoy most.',
      workLabel: home?.viewMyWorkLabel ?? 'View My Projects',
    }),
    [home?.greeting, home?.highlightedName, home?.jobTitle, home?.tagLine, home?.viewMyWorkLabel]
  )

  const handleResumeClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!resumeData.href) return
      e.preventDefault()
      try {
        await downloadFile(resumeData.href, 'Aria_Sharifnia_Resume.pdf')
      } catch (err) {
        console.error(err)
        window.open(resumeData.href, '_blank', 'noopener,noreferrer')
      }
    },
    [resumeData.href]
  )

  return (
    <section
      id="home"
      className="relative isolate w-full min-h-screen overflow-hidden text-gray-100"
      style={{
        background: 'linear-gradient(to bottom right, #164a7b, #123f6b, #0b2945)',
        willChange: 'auto',
        contain: 'layout style paint',
      }}
    >
      <div
        className="relative mx-auto flex flex-col items-center justify-center w-full px-4 sm:w-5/6 lg:w-3/4 xl:w-2/3 min-h-[calc(100svh-var(--header-h))] pb-16 sm:pb-20"
        style={{
          paddingTop: 'calc(var(--header-h) + 10px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 64px)',
        }}
      >
        <span
          className="mb-6 mt-2 flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/5 sm:bg-white/10 sm:backdrop-blur-sm"
          style={{ contain: 'layout style' }}
        >
          <Code2 className="h-10 w-10 text-white" strokeWidth={2} aria-hidden="true" />
        </span>
        <h1
          className="text-center text-5xl font-bold leading-tight tracking-tight sm:text-7xl"
          style={{ contain: 'layout style' }}
        >
          {textContent.greeting} <span className="text-teal-400">{textContent.name}</span>
        </h1>
        <p
          className="mt-6 text-center text-2xl font-semibold text-gray-200 sm:text-3xl"
          style={{ contain: 'layout style' }}
        >
          {textContent.jobTitle}
        </p>
        <p
          className="mt-8 max-w-4xl text-center text-lg text-gray-300 sm:text-xl"
          style={{
            minHeight: '3.25rem',
            transform: 'translate3d(0,0,0)',
            textRendering: 'optimizeSpeed',
            WebkitFontSmoothing: 'antialiased',
            containIntrinsicSize: '896px 52px',
          }}
        >
          {textContent.tagLine}
        </p>
        <div className="mt-14 flex flex-wrap justify-center gap-8" style={{ contain: 'layout' }}>
          <PrimaryButton href="#projects" className={BUTTON_STYLES.primary}>
            {textContent.workLabel}
            <ArrowDown className="h-5 w-5 -mt-0.5" strokeWidth={2} />
          </PrimaryButton>

          <PrimaryButton
            href={resumeData.href || '#'}
            onClick={handleResumeClick}
            download={!!resumeData.href}
            aria-label={resumeData.aria}
            className={BUTTON_STYLES.secondary}
          >
            {resumeData.btnText}
            <Download className="h-5 w-5 -mt-0.5" strokeWidth={2} />
          </PrimaryButton>
        </div>
      </div>
      <Suspense fallback={null}>
        <LazyScrollArrow />
      </Suspense>
    </section>
  )
})

HomeSection.displayName = 'HomeSection'

export default HomeSection
