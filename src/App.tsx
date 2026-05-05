import { useEffect, useRef, useState } from 'react'
import { LandingPage } from '@/components/pages/LandingPage'
import { ProjectsPage } from '@/components/pages/ProjectsPage'
import { ProjectLearningPage } from '@/components/pages/ProjectLearningPage'
import { PracticePage } from '@/components/pages/PracticePage'
import { TypingTrainerPage } from '@/components/pages/TypingTrainerPage'
import { QuizPage } from '@/components/pages/QuizPage'
import { CareerMapperPage } from '@/components/career-mapper'
import { AdminPage } from '@/components/pages/AdminPage'
import { LoginPage } from '@/components/pages/LoginPage'
import { StudentShell } from '@/components/shells/StudentShell'
import { AdminShell } from '@/components/shells/AdminShell'
import { AssessmentGuard } from '@/components/assessment/AssessmentGuard'
import { FlowRoadmapPage } from '@/components/pages/FlowRoadmapPage'
import {
  getStoredUser,
  isDemoUser,
  type AuthUser,
  loginWithBackend,
  fetchCurrentUser,
  storeAuthToken,
  storeUser,
} from '@/lib/auth'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { isRailwayPublicHost } from '@/lib/host-env'
import { recordRouteVisit } from '@/lib/activity'
import {
  canAttemptDemoQuiz,
  canStartDemoProject,
  recordDemoProjectStart,
  recordDemoQuizAttempt,
  triggerProjectLockedError,
  triggerQuizLockedError,
} from '@/lib/demo-limits'

export type StudentPage = 'landing' | 'projects' | 'learning' | 'practice' | 'typing' | 'quiz' | 'roadmapper' | 'flow-roadmap'

type AuthState = AuthUser | null

function App() {
  const [authState, setAuthState] = useState<AuthState>(() => getStoredUser())
  const [studentPage, setStudentPage] = useState<StudentPage>('landing')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const routeStartRef = useRef<{ route: string; startedAt: number } | null>(null)

  // ── Dev-only auto-login (disabled — use login form to test as student/admin)
  // eslint-disable-next-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    if (!authState) {
      routeStartRef.current = null
      return
    }

    const user = authState as AuthUser
    const route = user.role === 'admin'
      ? 'admin'
      : studentPage === 'learning' && selectedProjectId
        ? `learning:${selectedProjectId}`
        : studentPage

    const now = Date.now()
    const previous = routeStartRef.current
    if (previous && previous.route !== route) {
      void recordRouteVisit(previous.route, now - previous.startedAt)
    }
    routeStartRef.current = { route, startedAt: now }
  }, [authState, studentPage, selectedProjectId])

  if (!authState) {
    return (
      <div className={wrapperClass}>
        <LoginPage onAuthenticated={handleAuthenticated} />
        <Toaster position="top-center" />
      </div>
    )
  }

  const user = authState as AuthUser
  const assessmentGuardEnabled = false
  const isAssessmentPage = studentPage === 'quiz' || studentPage === 'typing'

  if (user.role === 'admin') {
    return (
      <div className={wrapperClass}>
        <AdminShell user={user} onLogout={handleLogout}>
          <AdminPage />
        </AdminShell>
        <Toaster position="top-center" />
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <AssessmentGuard enabled={assessmentGuardEnabled && isAssessmentPage} user={user} page={studentPage} />
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

        {studentPage === 'flow-roadmap' && <FlowRoadmapPage />}

        {/* Resume module removed from this build */}

        {studentPage === 'learning' && selectedProjectId && (
          <ProjectLearningPage projectId={selectedProjectId} onBack={handleBackToProjects} />
        )}
      </StudentShell>
      <Toaster position="top-center" />
    </div>
  )
}

export default App
