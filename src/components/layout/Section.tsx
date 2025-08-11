import type { FC, ReactNode, CSSProperties } from 'react'

type SectionProps = {
  id: string
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  align?: 'center' | 'left'
  background?: 'light' | 'gray'
  containerClassName?: string
  contentClassName?: string
  showUnderline?: boolean
}

const bgStyleFor = (kind: NonNullable<SectionProps['background']>): CSSProperties => {
  switch (kind) {
    case 'gray':
      return {
        background:
          'radial-gradient(900px 300px at -10% 6%, rgba(18,63,107,.05), transparent 60%),' +
          'radial-gradient(800px 260px at 110% 2%, rgba(11,41,69,.04), transparent 60%),' +
          'linear-gradient(180deg, #F3F7FB 0%, #E8EEF5 100%)',
      }
    case 'light':
    default:
      return {
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFDFE 100%)',
      }
  }
}

const Section: FC<SectionProps> = ({
  id,
  title,
  description,
  children,
  align = 'center',
  background = 'light',
  containerClassName = '',
  contentClassName = '',
  showUnderline = true,
}) => {
  const headingAlign = align === 'center' ? 'text-center' : 'text-left'
  const underlineAlign = align === 'center' ? 'mx-auto' : ''

  return (
    <section id={id} className="w-full" style={bgStyleFor(background)}>
      <div className={`mx-auto max-w-6xl px-6 py-20 ${containerClassName}`}>
        <div className={headingAlign}>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-navy-700">{title}</h2>
          {showUnderline && (
            <div className={`${underlineAlign} mt-3 h-1 w-30 rounded bg-teal-400`} />
          )}
          {description ? (
            <p className={`mt-3 text-lg text-gray-600 ${align === 'center' ? '' : 'max-w-2xl'}`}>
              {description}
            </p>
          ) : null}
        </div>
        <div className={`mt-12 ${contentClassName}`}>{children}</div>
      </div>
    </section>
  )
}

export default Section
