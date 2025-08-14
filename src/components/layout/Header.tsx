import type { FC } from 'react'
import { NAV_ITEMS } from '../../constants/navigation'
import { useHome } from '../../hooks/useHome'

const Header: FC = () => {
  const { data } = useHome()

  return (
    <header className="fixed inset-x-0 top-0 z-[9998] h-[var(--header-h)] bg-[#F3F7FB]/90 supports-[backdrop-filter]:bg-[#F3F7FB]/70 backdrop-blur border-b border-[#DDE5EE]">
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-8">
        <a
          href="#home"
          className="bg-gradient-to-br from-[#164a7b] via-[#123f6b] to-[#0b2945] bg-clip-text text-transparent select-none text-2xl sm:text-3xl font-extrabold tracking-tight"
        >
          {data?.nameLogo ?? 'Aria Sharifnia'}
        </a>

        <nav className="hidden md:block">
          <ul className="flex gap-8">
            {NAV_ITEMS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="relative inline-block px-1 text-[18px] font-medium text-navy-500 hover:text-navy-700 transition-colors
                             after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand-500
                             after:transition-transform after:duration-400 hover:after:scale-x-100"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
