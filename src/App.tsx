import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { LandingPage } from '@/components/pages/LandingPage'
import { ProjectsPage } from '@/components/pages/ProjectsPage'
import { ProjectLearningPage } from '@/components/pages/ProjectLearningPage'
import { PracticePage } from '@/components/pages/PracticePage'
import { QuizPage } from '@/components/pages/QuizPage'
import { RoadmapperPage } from '@/components/pages/RoadmapperPage'
import { PortBanner } from '@/components/PortBanner'
import { getProjectById } from '@/lib/projects'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

type Page = 'landing' | 'projects' | 'learning' | 'practice' | 'quiz' | 'roadmapper'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('projects')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleNavigate = (page: 'landing' | 'projects' | 'practice' | 'quiz' | 'roadmapper') => {
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
    <div className="min-h-screen bg-background">
      <PortBanner />
      {currentPage !== 'learning' && (
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      )}

      {currentPage === 'landing' && (
        <LandingPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'projects' && (
        <ProjectsPage onSelectProject={handleSelectProject} />
      )}

      {currentPage === 'practice' && (
        <PracticePage />
      )}

      {currentPage === 'quiz' && (
        <QuizPage />
      )}

      {currentPage === 'roadmapper' && (
        <RoadmapperPage />
      )}

      {currentPage === 'learning' && selectedProject && (
        <ProjectLearningPage 
          project={selectedProject} 
          onBack={handleBackToProjects}
        />
      )}

      <Toaster position="top-center" />
    </div>
  )
}

export default App