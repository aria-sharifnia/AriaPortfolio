import { lazy, Suspense, useEffect, useState } from 'react'
import Header from './components/layout/Header'
import HomeSection from './sections/HomeSection'
import BootStrapiGuard from './components/system/BootStrapiGuard'
import { VersionGate } from './VersionGate'
import { ManifestProvider } from './ManifestProvider'

function InView({
  children,
  rootMargin = '200px',
}: {
  children: React.ReactNode
  rootMargin?: string
}) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = document.getElementById('__inview-anchor-' + (Math.random() + '').slice(2))
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <>
      <div id="__inview-anchor" style={{ position: 'relative', height: 1 }} />
      {show ? children : null}
    </>
  )
}

const AboutSection = lazy(() => import('./sections/AboutSection'))
const SkillsSection = lazy(() => import('./sections/SkillsSection'))
const ExperiencesSection = lazy(() => import('./sections/ExpriencesSection'))
const ProjectsSection = lazy(() => import('./sections/ProjectsSection'))
const TestimonialsSection = lazy(() => import('./sections/TestimonialsSection'))
const ContactSection = lazy(() => import('./sections/ContactSection'))

export default function App() {
  useEffect(() => {
    const onFirstInteract = () => {
      import('./components/common/CustomCursor/CustomCursor').then(({ default: CC }) => {
        const n = document.createElement('div')
        n.id = 'cursor-root'
        document.body.appendChild(n)
        import('react-dom/client').then(({ createRoot }) => {
          createRoot(n).render(<CC />)
        })
      })
      window.removeEventListener('pointerdown', onFirstInteract)
      window.removeEventListener('keydown', onFirstInteract)
    }
    window.addEventListener('pointerdown', onFirstInteract, { once: true })
    window.addEventListener('keydown', onFirstInteract, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onFirstInteract)
      window.removeEventListener('keydown', onFirstInteract)
    }
  }, [])

  return (
    <div id="site-root">
      <ManifestProvider>
        <BootStrapiGuard>
          <VersionGate>
            <Header />
            <main>
              <HomeSection />

              <Suspense fallback={null}>
                <InView>
                  <AboutSection />
                </InView>
                <InView>
                  <SkillsSection />
                </InView>
                <InView>
                  <ExperiencesSection />
                </InView>
                <InView>
                  <ProjectsSection />
                </InView>
                <InView>
                  <TestimonialsSection />
                </InView>
                <InView>
                  <ContactSection />
                </InView>
              </Suspense>
            </main>
          </VersionGate>
        </BootStrapiGuard>
      </ManifestProvider>
    </div>
  )
}
