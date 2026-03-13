import { useState } from 'react'
import { LandingPage } from '@/components/pages/LandingPage'
import { ProjectsPage } from '@/components/pages/ProjectsPage'
import { ProjectLearningPage } from '@/components/pages/ProjectLearningPage'
import { PracticePage } from '@/components/pages/PracticePage'
import { QuizPage } from '@/components/pages/QuizPage'
import { CareerMapperPage } from '@/components/career-mapper'
import { AdminPage } from '@/components/pages/AdminPage'
import { LoginPage } from '@/components/pages/LoginPage'
import { StudentShell } from '@/components/shells/StudentShell'
import { AdminShell } from '@/components/shells/AdminShell'
import { PortBanner } from '@/components/PortBanner'
import { getProjectById } from '@/lib/projects'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { getStoredUser, type AuthUser } from '@/lib/auth'
import { DemoLimits } from '@/lib/demo-limits'

export type StudentPage = 'landing' | 'projects' | 'learning' | 'practice' | 'quiz' | 'roadmapper'

type AuthState = AuthUser | 'public' | null

function App() {
  const [authState, setAuthState] = useState<AuthState>(() => getStoredUser())
  const [studentPage, setStudentPage] = useState<StudentPage>('landing')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleAuthenticated = (user: AuthUser) => {
    setAuthState(user)
    if (user.role !== 'admin') {
      setStudentPage('landing')
    }
  }

  const handleLogout = () => {
    setAuthState(null)
    setStudentPage('landing')
    setSelectedProjectId(null)
    toast.success('Logged out successfully.')
  }

  const handleStudentNavigate = (page: StudentPage) => {
    setStudentPage(page)
    setSelectedProjectId(null)
  }

  const handleSelectProject = (projectId: string) => {
    if (!DemoLimits.isProjectUnlocked(projectId)) {
      DemoLimits.triggerProjectLockedError();
      return;
    }
    setSelectedProjectId(projectId)
    setStudentPage('learning')
    toast.success('Project loaded! Let\'s start learning.')
  }

  const handleBackToProjects = () => {
    setSelectedProjectId(null)
    setStudentPage('projects')
    toast.success('Great work! Ready for another project?')
  }

  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null
  const wrapperClass = 'min-h-screen bg-background'

  if (!authState) {
    return (
      <div className={wrapperClass}>
        <PortBanner />
        <LoginPage
          onAuthenticated={handleAuthenticated}
          onBrowsePublicly={() => setAuthState('public')}
        />
        <Toaster position="top-center" />
      </div>
    )
  }

  if (authState === 'public') {
    return (
      <div className={wrapperClass}>
        <PortBanner />
        <CareerMapperPage />
        <Toaster position="top-center" />
      </div>
    )
  }

  const user = authState as AuthUser

  if (user.role === 'admin') {
    return (
      <div className={wrapperClass}>
        <PortBanner />
        <AdminShell user={user} onLogout={handleLogout}>
          <AdminPage />
        </AdminShell>
        <Toaster position="top-center" />
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <PortBanner />
      <StudentShell
        currentPage={studentPage === 'learning' ? 'projects' : studentPage}
        user={user}
        onNavigate={handleStudentNavigate}
        onLogout={handleLogout}
      >
        {studentPage === 'landing' && (
          <LandingPage onNavigate={handleStudentNavigate} />
        )}

        {studentPage === 'projects' && (
          <ProjectsPage onSelectProject={handleSelectProject} />
        )}

        {studentPage === 'practice' && <PracticePage />}

        {studentPage === 'quiz' && <QuizPage />}

        {studentPage === 'roadmapper' && <CareerMapperPage />}

        {studentPage === 'learning' && selectedProject && (
          <ProjectLearningPage project={selectedProject} onBack={handleBackToProjects} />
        )}
      </StudentShell>
      <Toaster position="top-center" />
    </div>
  )
}

export default App
