import CustomCursor from './components/common/CustomCursor/CustomCursor'
import Header from './components/layout/Header'
import AboutSection from './sections/AboutSection'
import ExperiencesSection from './sections/ExpriencesSection'
import HomeSection from './sections/HomeSection'
import ProjectsSection from './sections/ProjectsSection'
import SkillsSection from './sections/SkillsSection'
import TestimonialsSection from './sections/TestimonialsSection'
import ContactSection from './sections/ContactSection'
import BootStrapiGuard from './components/system/BootStrapiGuard'
import { VersionGate } from './VersionGate'

function App() {
  return (
    <div id="site-root">
      <CustomCursor />
      <BootStrapiGuard>
        <VersionGate>
          <Header />
          <main>
            <HomeSection />
            <AboutSection />
            <SkillsSection />
            <ExperiencesSection />
            <ProjectsSection />
            <TestimonialsSection />
            <ContactSection />
          </main>
        </VersionGate>
      </BootStrapiGuard>
    </div>
  )
}
export default App
