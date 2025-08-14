import CustomCursor from './components/common/CustomCursor/CustomCursor'
import Header from './components/layout/Header'
import AboutSection from './sections/AboutSection'
import ExperiencesSection from './sections/ExpriencesSection'
import HomeSection from './sections/HomeSection'
import SkillsSection from './sections/SkillsSection'

function App() {
  return (
    <div id="site-root" className="isolate">
      <Header />
      <main className="relative z-0 pt-[var(--header-h)]">
        <HomeSection />
        <AboutSection />
        <SkillsSection />
        <ExperiencesSection />
      </main>
      <CustomCursor />
    </div>
  )
}

export default App
