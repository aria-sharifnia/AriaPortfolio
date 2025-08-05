import type { FC } from 'react'
import { ArrowDown, Download, Code2 } from 'lucide-react'
import PrimaryButton from '../components/common/PrimaryButton/PrimaryButton'
import { NAV_ITEMS } from '../constants/navigation'

const baseButton =
  'rounded-full px-10 py-4 text-base font-semibold text-white shadow-md transition-transform duration-300 hover:scale-110'
const primaryButton = `${baseButton} bg-teal-400`
const secondaryButton = `${baseButton} border border-white bg-white/10 backdrop-blur-sm`
const HomeSection: FC = () => (
  <header
    id="home"
    className="relative isolate w-screen min-h-screen overflow-hidden text-gray-100
               bg-gradient-to-br from-[#164a7b] via-[#123f6b] to-[#0b2945]"
  >
    <nav
      className="fixed inset-x-0 top-0 z-50 h-16 flex items-center
             justify-between
             bg-gray-100/95 backdrop-blur-sm border-b border-gray-200 px-8"
    >
      <a
        href="#home"
        className="
    bg-gradient-to-br from-[#164a7b] via-[#123f6b] to-[#0b2945]
    bg-clip-text text-transparent select-none
    text-2xl sm:text-3xl font-extrabold
    leading-none tracking-tight
  "
      >
        Aria Sharifnia
      </a>
      <ul className="flex gap-8">
        {NAV_ITEMS.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="relative inline-block px-1 text-[15px] font-medium text-navy-500
                         transition-transform duration-300 ease-out hover:scale-105
                         after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5
                         after:origin-left after:scale-x-0 after:bg-brand-500
                         after:transition-transform after:duration-300 hover:after:scale-x-100
                         hover:text-navy-700"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
    <div
      className="relative mx-auto flex flex-col items-center justify-center
                 min-h-screen w-full px-4
                 sm:w-5/6 lg:w-3/4 xl:w-2/3"
    >
      <span
        className="mb-6 flex items-center justify-center
             w-22 h-22 rounded-full
             border border-white
             bg-white/10 backdrop-blur-sm
"
      >
        <Code2 className="w-10 h-10 text-white" strokeWidth={2} />
      </span>
      <h1
        className="text-6xl sm:text-8xl font-bold tracking-tight leading-tight
                   text-center"
      >
        {"Hi, I'm "} <span className="text-teal-400">Aria</span>
      </h1>

      <p className="mt-6 text-2xl sm:text-3xl font-semibold text-gray-200 text-center">
        Full-Stack Developer
      </p>

      <p className="mt-8 max-w-4xl text-lg sm:text-xl text-gray-300 text-center">
        Building beautiful, functional, and scalable web applications that solve real problems and
        create exceptional user experiences
      </p>
      <div className="mt-14 flex flex-wrap justify-center gap-8">
        <PrimaryButton href="#projects" className={primaryButton}>
          View My Work
          <ArrowDown className="h-5 w-5 -mt-0.5" strokeWidth={2} />
        </PrimaryButton>

        <PrimaryButton href="/Alex-Resume.pdf" download className={secondaryButton}>
          Download My Resume
          <Download className="h-5 w-5 -mt-0.5" strokeWidth={2} />
        </PrimaryButton>
      </div>
    </div>
  </header>
)

export default HomeSection
