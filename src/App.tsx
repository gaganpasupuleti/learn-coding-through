import { useState } from 'react'
import { LandingPage } from '@/components/pages/LandingPage'
import { ProjectsPage } from '@/components/pages/ProjectsPage'
import { ProjectLearningPage } from '@/components/pages/ProjectLearningPage'
import { PracticePage } from '@/components/pages/PracticePage'
import { TypingTrainerPage } from '@/components/pages/TypingTrainerPage'
import { QuizPage } from '@/components/pages/QuizPage'
import { CareerMapperPage } from '@/components/career-mapper'
import { AdminPage } from '@/components/pages/AdminPage'
import { LoginPage } from '@/components/pages/LoginPage'
import { ResumeModuleGatewayPage } from '@/components/pages/ResumeModuleGatewayPage'
import { StudentShell } from '@/components/shells/StudentShell'
import { AdminShell } from '@/components/shells/AdminShell'
import { PortBanner } from '@/components/PortBanner'
import { getStoredUser, isDemoUser, type AuthUser } from '@/lib/auth'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import {
  canAttemptDemoQuiz,
  canStartDemoProject,
  recordDemoProjectStart,
  recordDemoQuizAttempt,
  triggerProjectLockedError,
  triggerQuizLockedError,
} from '@/lib/demo-limits'

export type StudentPage = 'landing' | 'projects' | 'learning' | 'practice' | 'typing' | 'quiz' | 'roadmapper' | 'resume'

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
    if (isDemoUser() && !canStartDemoProject(projectId)) {
      triggerProjectLockedError()
      return
    }

    if (isDemoUser()) {
      recordDemoProjectStart(projectId)
    }

    setSelectedProjectId(projectId)
    setStudentPage('learning')
    toast.success('Project loaded! Let\'s start learning.')
  }

  const handleBeforeSelectQuiz = (quizId: string) => {
    if (!isDemoUser()) {
      return true
    }

    if (!canAttemptDemoQuiz(quizId)) {
      triggerQuizLockedError()
      return false
    }

    recordDemoQuizAttempt(quizId)
    return true
  }

  const handleBackToProjects = () => {
    setSelectedProjectId(null)
    setStudentPage('projects')
    toast.success('Great work! Ready for another project?')
  }

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

        {studentPage === 'typing' && <TypingTrainerPage />}

        {studentPage === 'quiz' && <QuizPage onBeforeSelect={handleBeforeSelectQuiz} />}

        {studentPage === 'roadmapper' && <CareerMapperPage />}

        {studentPage === 'resume' && <ResumeModuleGatewayPage user={user} />}

        {studentPage === 'learning' && selectedProjectId && (
          <ProjectLearningPage projectId={selectedProjectId} onBack={handleBackToProjects} />
        )}
      </StudentShell>
      <Toaster position="top-center" />
    </div>
  )
}

export default App
