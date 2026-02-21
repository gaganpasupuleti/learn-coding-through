import { useEffect, useMemo, useState } from 'react'
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
import { LoginPage } from '@/components/pages/LoginPage'
import { StudentShell } from '@/components/shells/StudentShell'
import { AdminShell } from '@/components/shells/AdminShell'
import { PortBanner } from '@/components/PortBanner'
import { getProjectById } from '@/lib/projects'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { getStoredUser, type AuthUser } from '@/lib/auth'

type StudentPage = 'landing' | 'projects' | 'learning' | 'practice' | 'quiz' | 'roadmapper'
type ExperienceVersion = 'v1' | 'v2'
type V2Palette = 'executive' | 'sapphire' | 'royal'

/** App-level auth state: null = unauthenticated, 'public' = browsing Career Mapper without login */
type AuthState = AuthUser | 'public' | null

const EXPERIENCE_VERSION_KEY = 'app-experience-version'
const V2_PALETTE_KEY = 'app-v2-palette'

function App() {
  // ---------- auth ----------
  const [authState, setAuthState] = useState<AuthState>(() => getStoredUser())

  // ---------- routing ----------
  const [studentPage, setStudentPage] = useState<StudentPage>('landing')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  // ---------- experience version / palette (preserved from V1/V2 toggle) ----------
  const [experienceVersion, setExperienceVersion] = useState<ExperienceVersion>(() => {
    const params = new URLSearchParams(window.location.search)
    const queryVersion = params.get('experience')
    const legacyLandingVersion = params.get('landing')

    if (queryVersion === 'v1' || queryVersion === 'v2') return queryVersion
    if (legacyLandingVersion === 'v1' || legacyLandingVersion === 'v2') return legacyLandingVersion

    const stored = window.localStorage.getItem(EXPERIENCE_VERSION_KEY)
    if (stored === 'v1' || stored === 'v2') return stored
    return 'v2'
  })

  const [v2Palette, setV2Palette] = useState<V2Palette>(() => {
    const queryPalette = new URLSearchParams(window.location.search).get('palette')
    if (queryPalette === 'executive' || queryPalette === 'sapphire' || queryPalette === 'royal') return queryPalette
    const stored = window.localStorage.getItem(V2_PALETTE_KEY)
    if (stored === 'executive' || stored === 'sapphire' || stored === 'royal') return stored
    return 'executive'
  })

  const isV2Experience = useMemo(() => experienceVersion === 'v2', [experienceVersion])

  useEffect(() => { window.localStorage.setItem(EXPERIENCE_VERSION_KEY, experienceVersion) }, [experienceVersion])
  useEffect(() => { window.localStorage.setItem(V2_PALETTE_KEY, v2Palette) }, [v2Palette])

  // ---------- handlers ----------

  const handleAuthenticated = (user: AuthUser) => {
    setAuthState(user)
    // Admins go to admin portal; students/demo go to student portal landing
    if (user.role !== 'admin') setStudentPage('landing')
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

  // ---------- render ----------

  const wrapperClass = `min-h-screen bg-background ${isV2Experience ? 'app-v2' : ''}`

  // Unauthenticated → show Login (with public browse option for Career Mapper)
  if (!authState) {
    return (
      <div className={wrapperClass} data-v2-palette={v2Palette} data-experience-version={experienceVersion}>
        <PortBanner />
        <LoginPage
          onAuthenticated={handleAuthenticated}
          onBrowsePublicly={() => setAuthState('public')}
        />
        <Toaster position="top-center" />
      </div>
    )
  }

  // Public browse mode → Career Mapper only, no shell nav
  if (authState === 'public') {
    return (
      <div className={wrapperClass} data-v2-palette={v2Palette} data-experience-version={experienceVersion}>
        <PortBanner />
        {isV2Experience ? (
          <RoadmapperPageV2
            onSignUp={() => setAuthState(null)}
          />
        ) : (
          <RoadmapperPage />
        )}
        <Toaster position="top-center" />
      </div>
    )
  }

  const user = authState as AuthUser

  // Admin portal
  if (user.role === 'admin') {
    return (
      <div className={wrapperClass} data-v2-palette={v2Palette} data-experience-version={experienceVersion}>
        <PortBanner />
        <AdminShell user={user} onLogout={handleLogout}>
          {isV2Experience ? <AdminPageV2 /> : <AdminPage />}
        </AdminShell>
        <Toaster position="top-center" />
      </div>
    )
  }

  // Student / Demo portal
  return (
    <div className={wrapperClass} data-v2-palette={v2Palette} data-experience-version={experienceVersion}>
      <PortBanner />
      <StudentShell
        currentPage={studentPage === 'learning' ? 'projects' : studentPage}
        user={user}
        onNavigate={handleStudentNavigate}
        onLogout={handleLogout}
      >
        {studentPage === 'landing' && (
          isV2Experience ? (
            <LandingPageV2
              onNavigate={handleStudentNavigate}
              experienceVersion={experienceVersion}
              onChangeExperienceVersion={setExperienceVersion}
              selectedPalette={v2Palette}
              onChangePalette={setV2Palette}
            />
          ) : (
            <LandingPage
              onNavigate={handleStudentNavigate}
              experienceVersion={experienceVersion}
              onChangeExperienceVersion={setExperienceVersion}
              selectedPalette={v2Palette}
              onChangePalette={setV2Palette}
            />
          )
        )}

        {studentPage === 'projects' && (
          isV2Experience ? (
            <ProjectsPageV2 onSelectProject={handleSelectProject} />
          ) : (
            <ProjectsPage onSelectProject={handleSelectProject} />
          )
        )}

        {studentPage === 'practice' && (
          isV2Experience ? <PracticePageV2 /> : <PracticePage />
        )}

        {studentPage === 'quiz' && (
          isV2Experience ? <QuizPageV2 /> : <QuizPage />
        )}

        {studentPage === 'roadmapper' && (
          isV2Experience ? <RoadmapperPageV2 /> : <RoadmapperPage />
        )}

        {studentPage === 'learning' && selectedProject && (
          isV2Experience ? (
            <ProjectLearningPageV2 project={selectedProject} onBack={handleBackToProjects} />
          ) : (
            <ProjectLearningPage project={selectedProject} onBack={handleBackToProjects} />
          )
        )}
      </StudentShell>
      <Toaster position="top-center" />
    </div>
  )
}

export default App