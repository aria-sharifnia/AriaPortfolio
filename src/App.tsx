import CustomCursor from './components/common/CustomCursor/CustomCursor'
import Header from './components/layout/Header'
import AboutSection from './sections/AboutSection'
import ExperiencesSection from './sections/ExpriencesSection'
import HomeSection from './sections/HomeSection'
import ProjectsSection from './sections/ProjectsSection'
import SkillsSection from './sections/SkillsSection'
import TestimonialsSection from './sections/TestimonialsSection'

function App() {
  return (
    <div id="site-root" className="isolate">
      <Header />
      <main className="relative z-0 pt-[var(--header-h)]">
        <HomeSection />
        <AboutSection />
        <SkillsSection />
        <ExperiencesSection />
        <ProjectsSection />
        <TestimonialsSection />
      </main>
      <CustomCursor />
    </div>
  )
}

export default App
