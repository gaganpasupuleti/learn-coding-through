import { useEffect, useMemo, useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { LandingPage } from '@/components/pages/LandingPage'
import { LandingPageV2 } from '@/components/pages/LandingPageV2'
import { ProjectsPage } from '@/components/pages/ProjectsPage'
import { ProjectsPageV2 } from '@/components/pages/ProjectsPageV2'
import { ProjectLearningPage } from '@/components/pages/ProjectLearningPage'
import { ProjectLearningPageV2 } from '@/components/pages/ProjectLearningPageV2'
import { PracticePage } from '@/components/pages/PracticePage'
import { PracticePageV2 } from '@/components/pages/PracticePageV2'
import { QuizPage } from '@/components/pages/QuizPage'
import { QuizPageV2 } from '@/components/pages/QuizPageV2'
import { RoadmapperPage } from '@/components/pages/RoadmapperPage'
import { RoadmapperPageV2 } from '@/components/pages/RoadmapperPageV2'
import { AdminPage } from '@/components/pages/AdminPage'
import { AdminPageV2 } from '@/components/pages/AdminPageV2'
import { PortBanner } from '@/components/PortBanner'
import { getProjectById } from '@/lib/projects'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

type Page = 'landing' | 'projects' | 'learning' | 'practice' | 'quiz' | 'roadmapper' | 'admin'
type ExperienceVersion = 'v1' | 'v2'
type V2Palette = 'executive' | 'sapphire' | 'royal'

const EXPERIENCE_VERSION_KEY = 'app-experience-version'
const V2_PALETTE_KEY = 'app-v2-palette'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [experienceVersion, setExperienceVersion] = useState<ExperienceVersion>(() => {
    const params = new URLSearchParams(window.location.search)
    const queryVersion = params.get('experience')
    const legacyLandingVersion = params.get('landing')

    if (queryVersion === 'v1' || queryVersion === 'v2') {
      return queryVersion
    }

    if (legacyLandingVersion === 'v1' || legacyLandingVersion === 'v2') {
      return legacyLandingVersion
    }

    const storedVersion = window.localStorage.getItem(EXPERIENCE_VERSION_KEY)
    if (storedVersion === 'v1' || storedVersion === 'v2') {
      return storedVersion
    }

    return 'v2'
  })
  const [v2Palette, setV2Palette] = useState<V2Palette>(() => {
    const queryPalette = new URLSearchParams(window.location.search).get('palette')
    if (queryPalette === 'executive' || queryPalette === 'sapphire' || queryPalette === 'royal') {
      return queryPalette
    }

    const storedPalette = window.localStorage.getItem(V2_PALETTE_KEY)
    if (storedPalette === 'executive' || storedPalette === 'sapphire' || storedPalette === 'royal') {
      return storedPalette
    }

    return 'executive'
  })

  const isV2Experience = useMemo(() => experienceVersion === 'v2', [experienceVersion])

  useEffect(() => {
    window.localStorage.setItem(EXPERIENCE_VERSION_KEY, experienceVersion)
  }, [experienceVersion])

  useEffect(() => {
    window.localStorage.setItem(V2_PALETTE_KEY, v2Palette)
  }, [v2Palette])

  const handleNavigate = (page: 'landing' | 'projects' | 'practice' | 'quiz' | 'roadmapper' | 'admin') => {
    setCurrentPage(page)
    setSelectedProjectId(null)
  }

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId)
    setCurrentPage('learning')
    toast.success('Project loaded! Let\'s start learning.')
  }

  const handleBackToProjects = () => {
    setSelectedProjectId(null)
    setCurrentPage('projects')
    toast.success('Great work! Ready for another project?')
  }

  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null

  return (
    <div
      className={`min-h-screen bg-background ${isV2Experience ? 'app-v2' : ''}`}
      data-v2-palette={v2Palette}
      data-experience-version={experienceVersion}
    >
      <PortBanner />
      {currentPage !== 'learning' && (
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      )}

      {currentPage === 'landing' && (
        isV2Experience ? (
          <LandingPageV2
            onNavigate={handleNavigate}
            experienceVersion={experienceVersion}
            onChangeExperienceVersion={setExperienceVersion}
            selectedPalette={v2Palette}
            onChangePalette={setV2Palette}
          />
        ) : (
          <LandingPage
            onNavigate={handleNavigate}
            experienceVersion={experienceVersion}
            onChangeExperienceVersion={setExperienceVersion}
            selectedPalette={v2Palette}
            onChangePalette={setV2Palette}
          />
        )
      )}

      {currentPage === 'projects' && (
        isV2Experience ? (
          <ProjectsPageV2 onSelectProject={handleSelectProject} />
        ) : (
          <ProjectsPage onSelectProject={handleSelectProject} />
        )
      )}

      {currentPage === 'practice' && (
        isV2Experience ? <PracticePageV2 /> : <PracticePage />
      )}

      {currentPage === 'quiz' && (
        isV2Experience ? <QuizPageV2 /> : <QuizPage />
      )}

      {currentPage === 'roadmapper' && (
        isV2Experience ? <RoadmapperPageV2 /> : <RoadmapperPage />
      )}

      {currentPage === 'admin' && (
        isV2Experience ? <AdminPageV2 /> : <AdminPage />
      )}

      {currentPage === 'learning' && selectedProject && (
        isV2Experience ? (
          <ProjectLearningPageV2
            project={selectedProject}
            onBack={handleBackToProjects}
          />
        ) : (
          <ProjectLearningPage
            project={selectedProject}
            onBack={handleBackToProjects}
          />
        )
      )}

      <Toaster position="top-center" />
    </div>
  )
}

export default App