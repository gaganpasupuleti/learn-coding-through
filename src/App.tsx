import { useEffect, useRef, useState } from 'react'

import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

import { LandingPage, type LandingNavTarget } from '@/components/pages/LandingPage'

import { ProjectsPage } from '@/components/pages/ProjectsPage'

import { ProjectLearningPage } from '@/components/pages/ProjectLearningPage'

import { QuizPage } from '@/components/pages/QuizPage'

import { TypingTrainerPage } from '@/components/pages/TypingTrainerPage'

import { CareerFlowPage } from '@/components/career-flow/CareerFlowPage'

import { AdminPage } from '@/components/pages/AdminPage'

import { LoginPage } from '@/components/pages/LoginPage'

import { StudentShell } from '@/components/shells/StudentShell'

import { AssessmentGuard } from '@/components/assessment/AssessmentGuard'

import { FlowRoadmapPage } from '@/components/pages/FlowRoadmapPage'

import { LearningPlannerPage } from '@/components/pages/LearningPlannerPage'

import { StudentDashboardPage } from '@/components/pages/StudentDashboardPage'

import { StudentCalendarPage } from '@/components/pages/StudentCalendarPage'

import { StudentProgressPage } from '@/components/pages/StudentProgressPage'

import { ResumeBuilderPage } from '@/components/pages/ResumeBuilderPage'

import { StudentHubPage } from '@/components/pages/StudentHubPage'

import { JobSpyPage } from '@/components/pages/JobSpyPage'

import { StudyMaterialsPage } from '@/components/pages/StudyMaterialsPage'

import { CodePracticePage } from '@/features/code-practice/components/CodePracticePage'

import { CODE_PRACTICE_ROUTE } from '@/features/code-practice/types/codePractice.types'

import { SqlPracticePage } from '@/features/sql-practice/components/SqlPracticePage'

import { SQL_PRACTICE_ROUTE } from '@/features/sql-practice/types/sqlPractice.types'

import { PowerBiPracticePage } from '@/features/powerbi-practice/components/PowerBiPracticePage'

import { POWERBI_PRACTICE_ROUTE, DAX_PRACTICE_ROUTE } from '@/features/powerbi-practice/types/powerbiPractice.types'

import { PasswordSetupGate } from '@/components/auth/PasswordSetupGate'

import {

  getStoredUser,

  getAuthToken,

  clearAuth,

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



const TYPING_PRACTICE_ROUTE = '/practice/typing'



const PRACTICE_PATH_TO_PAGE: Record<string, StudentPage> = {

  [CODE_PRACTICE_ROUTE]: 'practice-code',

  [SQL_PRACTICE_ROUTE]: 'practice-sql',

  [TYPING_PRACTICE_ROUTE]: 'practice-typing',

  [POWERBI_PRACTICE_ROUTE]: 'practice-powerbi',

  [DAX_PRACTICE_ROUTE]: 'practice-powerbi',

}



export type StudentPage =

  | 'landing'

  | 'dashboard'

  | 'projects'

  | 'learning'

  | 'practice-code'

  | 'practice-sql'

  | 'practice-typing'

  | 'practice-powerbi'

  | 'quiz'

  | 'roadmapper'

  | 'flow-roadmap'

  | 'hub'

  | 'jobspy'

  | 'study-materials'

  | 'learning-planner'

  | 'calendar'

  | 'progress'

  | 'resume'



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

  const [authChecked, setAuthChecked] = useState(() => getStoredUser() === null)

  const [studentPage, setStudentPage] = useState<StudentPage>('dashboard')

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const routeStartRef = useRef<{ route: string; startedAt: number } | null>(null)



  const handleAuthenticated = (user: AuthUser) => {

    setAuthState(user)

    if (user.role !== 'admin') {

      setStudentPage('dashboard')

    }

  }



  const handleLogout = () => {

    clearAuth()

    setAuthState(null)

    setStudentPage('dashboard')

    setSelectedProjectId(null)

    toast.success('Logged out successfully.')

  }



  useEffect(() => {

    const storedUser = getStoredUser()

    if (!storedUser) {

      setAuthChecked(true)

      return

    }

    const token = getAuthToken()

    if (!token) {

      clearAuth()

      setAuthState(null)

      setAuthChecked(true)

      return

    }

    let cancelled = false

    void fetchCurrentUser(token).then((currentUser) => {

      if (cancelled) return

      if (!currentUser) {

        clearAuth()

        setAuthState(null)

        toast.error('Your session expired. Please sign in again.')

      } else {

        storeUser(currentUser)

        setAuthState(currentUser)

      }

      setAuthChecked(true)

    })

    return () => {

      cancelled = true

    }

  }, [])



  const syncPracticePath = (page: StudentPage) => {

    if (typeof window === 'undefined') return

    const pathForPage = Object.entries(PRACTICE_PATH_TO_PAGE).find(([, p]) => p === page)?.[0]

    if (pathForPage) {

      window.history.replaceState(null, '', pathForPage)

      return

    }

    const current = window.location.pathname

    const onPowerBiSubRoute = current.startsWith(`${POWERBI_PRACTICE_ROUTE}/`)

    if (Object.keys(PRACTICE_PATH_TO_PAGE).includes(current) || onPowerBiSubRoute) {

      window.history.replaceState(null, '', '/')

    }

  }



  useEffect(() => {

    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)

    const pageParam = params.get('page') as StudentPage | null

  const DEEP_LINK_PAGES: StudentPage[] = [
    'dashboard', 'calendar', 'progress', 'learning-planner', 'projects', 'hub',
    'quiz', 'flow-roadmap', 'jobspy', 'study-materials', 'roadmapper', 'resume', 'practice-code',
    'practice-sql', 'practice-typing', 'practice-powerbi',
  ]

    if (pageParam && DEEP_LINK_PAGES.includes(pageParam)) {

      setStudentPage(pageParam)

      return

    }

    const page = PRACTICE_PATH_TO_PAGE[window.location.pathname]

    if (page) {

      setStudentPage(page)

    }

  }, [])



  const handleStudentNavigate = (
    page: StudentPage | 'practice' | 'practice-ground' | 'typing' | LandingNavTarget,
  ) => {

    if (page === 'practice' || page === 'practice-ground') {

      setStudentPage('practice-code')

      setSelectedProjectId(null)

      syncPracticePath('practice-code')

      return

    }

    if (page === 'typing') {

      setStudentPage('practice-typing')

      setSelectedProjectId(null)

      syncPracticePath('practice-typing')

      return

    }



    setStudentPage(page)

    setSelectedProjectId(null)

    syncPracticePath(page)

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



  if (!authChecked) {

    return (

      <div className={wrapperClass}>

        <div className="flex min-h-screen items-center justify-center bg-[#050807] px-6 text-center text-sm font-medium text-[#FAF3E0]/70">

          Checking your CodeQuest session…

        </div>

      </div>

    )

  }



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

  const isAssessmentPage = studentPage === 'quiz' || studentPage === 'practice-typing'



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

        canvasVariant={studentPage === 'dashboard' ? 'mission-control' : 'default'}

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



        {studentPage === 'calendar' && <StudentCalendarPage user={user} />}



        {studentPage === 'progress' && (

          <StudentProgressPage user={user} onNavigate={handleStudentNavigate} />

        )}



        {studentPage === 'resume' && <ResumeBuilderPage user={user} />}



        {studentPage === 'hub' && (

          <StudentHubPage onOpenJobBoard={() => handleStudentNavigate('jobspy')} />

        )}



        {studentPage === 'jobspy' && <JobSpyPage />}



        {studentPage === 'study-materials' && <StudyMaterialsPage />}



        {studentPage === 'learning-planner' && (

          <LearningPlannerPage user={user} onNavigate={handleStudentNavigate} />

        )}



        {studentPage === 'projects' && (

          <ProjectsPage onSelectProject={handleSelectProject} />

        )}



        {studentPage === 'practice-code' && (

          <ErrorBoundary FallbackComponent={PracticeRouteErrorFallback}>

            <CodePracticePage />

          </ErrorBoundary>

        )}



        {studentPage === 'practice-sql' && (

          <ErrorBoundary FallbackComponent={PracticeRouteErrorFallback}>

            <SqlPracticePage />

          </ErrorBoundary>

        )}



        {studentPage === 'practice-typing' && <TypingTrainerPage />}



        {studentPage === 'practice-powerbi' && (

          <ErrorBoundary FallbackComponent={PracticeRouteErrorFallback}>

            <PowerBiPracticePage />

          </ErrorBoundary>

        )}



        {studentPage === 'quiz' && <QuizPage onBeforeSelect={handleBeforeSelectQuiz} />}



        {studentPage === 'roadmapper' && <CareerFlowPage />}



        {studentPage === 'flow-roadmap' && <FlowRoadmapPage />}



        {studentPage === 'learning' && selectedProjectId && (

          <ProjectLearningPage projectId={selectedProjectId} onBack={handleBackToProjects} />

        )}

      </StudentShell>

      <Toaster position="top-center" />

    </div>

  )

}



export default App


