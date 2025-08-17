import type { FC } from 'react'
import { ArrowDown, Download, Code2 } from 'lucide-react'
import PrimaryButton from '../components/common/PrimaryButton/PrimaryButton'
import { useHome } from '../hooks/useHome'
import { useAbout } from '../hooks/useAbout'
import { mediaUrl } from '../api/strapi'
import { downloadFile } from '../utils/download'
import type { SocialMedia } from '../api/about'

const baseButton = 'rounded-full px-10 py-4 text-base font-semibold text-white shadow-md'
const primaryButton = `${baseButton} bg-teal-400`
const secondaryButton = `${baseButton} border border-white bg-white/10 backdrop-blur-sm`

const HomeSection: FC = () => {
  const { data: home } = useHome()
  const { data: about } = useAbout()
  const resumeSocial = about?.socials?.find((s: SocialMedia) => s.file?.url)
  const resumeHref = resumeSocial?.file?.url ? mediaUrl(resumeSocial.file.url) : undefined
  const resumeBtnText = home?.downloadResumeLabel
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
      <div className="relative mx-auto flex flex-col items-center justify-center min-h-screen w-full px-4 sm:w-5/6 lg:w-3/4 xl:w-2/3">
        <span className="mb-6 flex items-center justify-center w-22 h-22 rounded-full border border-white bg-white/10 backdrop-blur-sm">
          <Code2 className="w-10 h-10 text-white" strokeWidth={2} aria-hidden="true" />
        </span>

        <h1 className="text-6xl sm:text-8xl font-bold tracking-tight leading-tight text-center">
          {home?.greeting} <span className="text-teal-400">{home?.highlightedName}</span>
        </h1>

        <p className="mt-6 text-2xl sm:text-3xl font-semibold text-gray-200 text-center">
          {home?.jobTitle}
        </p>

        <p className="mt-8 max-w-4xl text-lg sm:text-xl text-gray-300 text-center">
          {home?.tagLine}
        </p>

        <div className="mt-14 flex flex-wrap justify-center gap-8">
          <PrimaryButton href="#projects" className={primaryButton}>
            {home?.viewMyWorkLabel}
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

      <div className="absolute bottom-6 flex justify-center w-full">
        <ArrowDown
          data-interactive
          className="h-8 w-8 text-white animate-bounce cursor-pointer"
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
