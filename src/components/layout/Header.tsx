import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from '../../constants/navigation'
import { useHome } from '../../hooks/useHome'

const Header: FC = () => {
  const { data } = useHome()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = open ? 'hidden' : prev
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const onNavClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false)
    if (href.startsWith('#')) {
      e.preventDefault()
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
      history.replaceState(null, '', href)
    }
  }

  return (
    <header
      className="fixed inset-x-0 top-0 z-[9998] h-[var(--header-h)] border-b border-black/5
                       bg-[#F3F7FB] supports-[backdrop-filter]:bg-[#F3F7FB]/90 backdrop-blur"
    >
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-8">
        <a
          href="#home"
          className="select-none bg-gradient-to-br from-[#164a7b] via-[#123f6b] to-[#0b2945] bg-clip-text
                     text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl"
        >
          {data?.nameLogo ?? 'Aria Sharifnia'}
        </a>

        <nav className="hidden lg:block">
          <ul className="flex gap-8">
            {NAV_ITEMS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="relative inline-block px-1 text-[18px] font-medium text-navy-500 transition-colors hover:text-navy-700
                             after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand-500
                             after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 hover:bg-white/70"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        onClick={() => setOpen(false)}
        className={`lg:hidden fixed left-0 right-0 bottom-0 top-[var(--header-h)] z-[9996] bg-black/20 transition-opacity
                    ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <div
        id="mobile-nav"
        className={`lg:hidden fixed left-0 right-0 top-[var(--header-h)] z-[9997] transform transition-all duration-200
                    ${open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'}`}
      >
        <div className="w-full rounded-b-2xl border-t border-gray-200 bg-white shadow-xl">
          <ul className="divide-y divide-gray-200">
            {NAV_ITEMS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  onClick={onNavClick(href)}
                  className="block px-6 py-4 text-[17px] font-medium text-navy-800 hover:bg-gray-50"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Header
