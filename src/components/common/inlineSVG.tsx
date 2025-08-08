import { useEffect, useState } from 'react'

type Props = { src?: string; className?: string; useCurrentColor?: boolean }

export default function InlineSvg({ src, className, useCurrentColor = false }: Props) {
  const [markup, setMarkup] = useState<string>('')

  useEffect(() => {
    let alive = true
    async function run() {
      if (!src) return setMarkup('')
      try {
        const res = await fetch(src)
        const raw = await res.text()
        let base = raw.replace(/<svg([^>]*)>/i, (_m, attrs) => {
          let a = attrs
            .replace(/\swidth="[^"]*"/gi, '')
            .replace(/\sheight="[^"]*"/gi, '')
            .replace(/\sstyle="[^"]*"/gi, '')
          a = /class=/.test(a)
            ? a.replace(/class="([^"]*)"/, `class="$1 ${className ?? ''}"`)
            : `${a} class="${className ?? ''}"`
          return `<svg${a}>`
        })
        if (useCurrentColor) {
          base = base
            .replace(/\sfill="[^"]*"/gi, ' fill="currentColor"')
            .replace(/\sstroke="[^"]*"/gi, ' stroke="currentColor"')
            .replace(/<svg([^>]*)>/i, (_m, attrs) => `<svg${attrs} fill="currentColor" stroke="currentColor">`)
        }

        if (alive) setMarkup(base)
      } catch {
        if (alive) setMarkup('')
      }
    }
    run()
    return () => { alive = false }
  }, [src, className, useCurrentColor])

  return <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />
}