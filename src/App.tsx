import { useEffect, useRef, useState } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
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
import { AssessmentGuard } from '@/components/assessment/AssessmentGuard'
import { FlowRoadmapPage } from '@/components/pages/FlowRoadmapPage'
import { StudentDashboardPage } from '@/components/pages/StudentDashboardPage'
import { StudentHubPage } from '@/components/pages/StudentHubPage'
import { StudentJobsPage } from '@/components/pages/StudentJobsPage'
import { PasswordSetupGate } from '@/components/auth/PasswordSetupGate'
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

export type StudentPage =
  | 'landing'
  | 'dashboard'
  | 'projects'
  | 'learning'
  | 'practice'
  | 'typing'
  | 'quiz'
  | 'roadmapper'
  | 'flow-roadmap'
  | 'hub'
  | 'jobs'

type AuthState = AuthUser | null

function PracticeRouteErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-slate-800 font-medium mb-1">Practice couldn&apos;t load</p>
        <p className="text-sm text-slate-500 mb-4">
          Something went wrong in the playground. Try again without reloading the whole app.
        </p>
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
        >
          Reload practice
        </button>
      </div>
    </div>
  )
}

function App() {
  const [authState, setAuthState] = useState<AuthState>(() => getStoredUser())
  const [studentPage, setStudentPage] = useState<StudentPage>('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const routeStartRef = useRef<{ route: string; startedAt: number } | null>(null)

  // ── Dev-only auto-login (disabled — use login form to test as student/admin)
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleAuthenticated = (user: AuthUser) => {
    setAuthState(user)
    if (user.role !== 'admin') {
      setStudentPage('dashboard')
    }
  }

  const handleLogout = () => {
    setAuthState(null)
    setStudentPage('dashboard')
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
      <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-background">
        <AdminPage user={user} onLogout={handleLogout} />
        <Toaster position="top-center" />
      </div>
    )
  }

  const needsPasswordSetup = Boolean(user.password_setup_required)

  return (
    <div className={wrapperClass}>
      {needsPasswordSetup && (
        <PasswordSetupGate
          user={user}
          onSuccess={(u) => {
            setAuthState(u)
          }}
        />
      )}
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

        {studentPage === 'dashboard' && (
          <StudentDashboardPage user={user} onNavigate={handleStudentNavigate} />
        )}

        {studentPage === 'hub' && (
          <StudentHubPage onOpenJobBoard={() => handleStudentNavigate('jobs')} />
        )}

        {studentPage === 'jobs' && <StudentJobsPage />}

        {studentPage === 'projects' && (
          <ProjectsPage onSelectProject={handleSelectProject} />
        )}

        {studentPage === 'practice' && (
          <ErrorBoundary FallbackComponent={PracticeRouteErrorFallback}>
            <PracticePage />
          </ErrorBoundary>
        )}

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
