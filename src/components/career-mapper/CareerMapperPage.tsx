import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Brain,
  Briefcase,
  ChartLine,
  CurrencyDollar,
  Lightning,
  MagnifyingGlass,
  MapTrifold,
  Sparkle,
  Timer,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { fetchCareerRoles } from '@/lib/api'
import { useCareerProgress } from '@/hooks/use-career-progress'
import { useSkillAssessments } from '@/hooks/use-skill-assessments'
import { useMLRecommendations } from '@/hooks/use-ml-recommendations'
import type { CareerRole } from '@/types/career'

import { LearningRoadmap } from './LearningRoadmap'
import { SkillGapAnalyzer } from './SkillGapAnalyzer'
import { MLCareerRecommendationCard } from './MLRecommendationCard'
import { RoleCardSelector } from './RoleCardSelector'
import { QuizPage } from '@/components/pages/QuizPage'
import { ProjectLearningPage } from '@/components/pages/ProjectLearningPage'

const SELECTED_ROLE_KEY = 'career-mapper-selected-role'

// ── Design tokens ──────────────────────────────────────────────────────────
const STYLE = {
  bg:      'var(--background)',
  surface: 'var(--card)',
  border:  'var(--border)',
  txt:     'var(--foreground)',
  sub:     'var(--muted-foreground)',
  accent:  '#818cf8',
} as const

const DOMAIN_ICON: Record<string, React.ReactNode> = {
  Data:   <ChartLine size={16} />,
  AI:     <Brain size={16} />,
  Web:    <Lightning size={16} />,
  DevOps: <Sparkle size={16} />,
}

const DIFF_COLOR: Record<string, string> = {
  Beginner:     '#4ade80',
  Intermediate: '#fbbf24',
  Advanced:     '#f87171',
}

export function CareerMapperPage() {
  const [roles, setRoles]               = useState<CareerRole[]>([])
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(() => {
    try {
      const s = localStorage.getItem(SELECTED_ROLE_KEY)
      return s ? (JSON.parse(s) as CareerRole) : null
    } catch { return null }
  })

  const [insightsPanelOpen, setInsightsPanelOpen] = useState(false)
  const [analyzerOpen, setAnalyzerOpen]           = useState(false)
  const [isLoading, setIsLoading]                 = useState(true)

  // Sub-view routing (quiz / project) inside the mapper frame
  type MapperSubView = 'roadmap' | 'quiz' | 'project'
  const [subView, setSubView]                         = useState<MapperSubView>('roadmap')
  const [activeQuizId, setActiveQuizId]               = useState<string | null>(null)
  const [activeProjectId, setActiveProjectId]         = useState<string | null>(null)
  const [pendingCompleteItemId, setPendingCompleteItemId] = useState<string | null>(null)

  const { progress, toggleItem, markComplete } = useCareerProgress(selectedRole?.id ?? 'none')
  const { skillReports, getReport } = useSkillAssessments()
  const { generateAllCareerRecommendations, getTopCareerRecommendations } = useMLRecommendations()

  const completedSet = useMemo(
    () => new Set<string>(Object.entries(progress.completedItems).filter(([,v]) => v).map(([k]) => k)),
    [progress]
  )

  const currentReport = selectedRole ? getReport(selectedRole.id) : undefined
  const topRecos      = getTopCareerRecommendations(3)

  // Derived counts from assessments
  const profCount  = currentReport?.assessments.filter(a => a.level === 'proficient').length ?? 0
  const partCount  = currentReport?.assessments.filter(a => a.level === 'partial').length ?? 0
  const noneCount  = currentReport?.assessments.filter(a => a.level === 'none').length ?? 0

  useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const loaded = await fetchCareerRoles()
        setRoles(loaded)
        if (selectedRole) {
          const fresh = loaded.find(r => r.id === selectedRole.id)
          if (fresh) setSelectedRole(fresh)
        }
      } catch {
        toast.error('Failed to load career roles. Using local data.')
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chooseRole = (role: CareerRole) => {
    setSelectedRole(role)
    localStorage.setItem(SELECTED_ROLE_KEY, JSON.stringify(role))
    setInsightsPanelOpen(false)
    setSubView('roadmap')
    setActiveQuizId(null)
    setActiveProjectId(null)
  }

  const clearRole = () => {
    setSelectedRole(null)
    localStorage.removeItem(SELECTED_ROLE_KEY)
    setSubView('roadmap')
  }

  const handleAnalyzerClose = (open: boolean) => {
    setAnalyzerOpen(open)
    if (!open && selectedRole) {
      const report = getReport(selectedRole.id)
      if (report) generateAllCareerRecommendations(roles, Object.values(skillReports))
    }
  }

  const openQuiz = (quizId: string, itemId?: string) => {
    setActiveQuizId(quizId)
    setPendingCompleteItemId(itemId ?? null)
    setSubView('quiz')
  }

  const openProject = (projectId: string, itemId?: string) => {
    setActiveProjectId(projectId)
    setPendingCompleteItemId(itemId ?? null)
    setSubView('project')
  }

  const handleSubViewBack = () => {
    setSubView('roadmap')
    setActiveQuizId(null)
    setActiveProjectId(null)
    setPendingCompleteItemId(null)
  }

  const handleSubViewComplete = (passed?: boolean) => {
    if (pendingCompleteItemId) markComplete(pendingCompleteItemId)
    if (passed !== undefined) {
      toast.success(passed ? 'Quiz passed! Item marked complete.' : 'Quiz finished. Keep practising!')
    } else {
      toast.success('Project complete! Item marked complete.')
    }
    handleSubViewBack()
  }

  // ── Role grid ──────────────────────────────────────────────────────────────
  if (!selectedRole) {
    return (
      <div style={{ minHeight: '100vh', background: STYLE.bg, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Page header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: STYLE.txt, marginBottom: 6 }}>
              Career Mapper
            </h1>
            <p style={{ fontSize: 13, color: STYLE.sub }}>
              Choose a career path, explore your 4-month syllabus, and track your progress with AI insights.
            </p>
          </div>

          {/* Skeleton or grid */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ border: `1px solid ${STYLE.border}`, borderRadius: 10, padding: 20, background: STYLE.surface }}>
                  <div style={{ height: 14, width: '60%', background: 'var(--muted)', borderRadius: 4, marginBottom: 10 }} />
                  <div style={{ height: 10, width: '40%', background: 'var(--muted)', borderRadius: 4, marginBottom: 16 }} />
                  <div style={{ height: 32, background: 'var(--muted)', borderRadius: 6 }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
              {roles.map(role => (
                <div
                  key={role.id}
                  onClick={() => chooseRole(role)}
                  style={{ border: `1px solid ${STYLE.border}`, borderRadius: 10, padding: 20, background: STYLE.surface,
                    cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', flexDirection: 'column', gap: 12 }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = STYLE.accent}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = STYLE.border}
                >
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: STYLE.accent }}>{DOMAIN_ICON[role.domain] ?? <Briefcase size={16} />}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', color: STYLE.txt }}>{role.title}</span>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: DIFF_COLOR[role.difficulty] ?? STYLE.sub,
                      border: `1px solid ${DIFF_COLOR[role.difficulty] ?? STYLE.border}`, borderRadius: 3, padding: '1px 6px', whiteSpace: 'nowrap' }}>
                      {role.difficulty.toUpperCase()}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 11, color: STYLE.sub, lineHeight: 1.6,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {role.description}
                  </p>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: 16, fontSize: 10, color: STYLE.sub }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CurrencyDollar size={11} />
                      ${Math.round(role.salaryRangeMin / 1000)}k–${Math.round(role.salaryRangeMax / 1000)}k
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Timer size={11} />
                      4 months
                    </span>
                  </div>

                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {role.skills.slice(0, 5).map(skill => (
                      <span key={skill} style={{ fontSize: 9, color: STYLE.sub, border: `1px solid ${STYLE.border}`,
                        borderRadius: 3, padding: '1px 6px' }}>{skill}</span>
                    ))}
                    {role.skills.length > 5 && (
                      <span style={{ fontSize: 9, color: STYLE.sub, border: `1px solid ${STYLE.border}`, borderRadius: 3, padding: '1px 6px' }}>
                        +{role.skills.length - 5}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); chooseRole(role) }}
                    style={{ marginTop: 4, padding: '8px 0', border: `1px solid ${STYLE.accent}`, borderRadius: 6,
                      background: 'transparent', color: STYLE.accent, fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', letterSpacing: '0.02em' }}>
                    Explore Path →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Sub-view full-screen overrides (quiz / project) ──────────────────────
  if (subView === 'quiz' && activeQuizId) {
    return (
      <QuizPage
        initialQuizId={activeQuizId}
        onBack={handleSubViewBack}
        onComplete={(passed) => handleSubViewComplete(passed)}
      />
    )
  }

  if (subView === 'project' && activeProjectId) {
    return (
      <ProjectLearningPage
        projectId={activeProjectId}
        onBack={handleSubViewBack}
        onComplete={() => handleSubViewComplete()}
      />
    )
  }

  // ── Role detail view ───────────────────────────────────────────────────────
  const completionPct = selectedRole.syllabus.length > 0
    ? Math.round((completedSet.size / selectedRole.syllabus.length) * 100)
    : 0

  return (
    <div style={{ minHeight: '100vh', background: STYLE.bg, padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Back */}
        <button
          type="button"
          onClick={clearRole}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none',
            color: STYLE.sub, fontSize: 11, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
          <ArrowLeft size={13} /> All Roles
        </button>

        {/* Role Card Selector - Horizontal scrolling */}
        <RoleCardSelector
          roles={roles}
          selectedRoleId={selectedRole.id}
          onSelectRole={chooseRole}
          completedItems={completedSet}
        />
        <div style={{ border: `1px solid ${STYLE.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 24, background: STYLE.surface }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: STYLE.txt }}>{selectedRole.title}</h1>
            <span style={{ fontSize: 9, fontWeight: 700, color: DIFF_COLOR[selectedRole.difficulty] ?? STYLE.sub,
              border: `1px solid ${DIFF_COLOR[selectedRole.difficulty] ?? STYLE.border}`, borderRadius: 3, padding: '1px 6px' }}>
              {selectedRole.difficulty.toUpperCase()}
            </span>
            <span style={{ fontSize: 9, color: STYLE.sub, border: `1px solid ${STYLE.border}`, borderRadius: 3, padding: '1px 6px' }}>
              {selectedRole.domain}
            </span>
          </div>
          <p style={{ fontSize: 11, color: STYLE.sub, marginBottom: 10, lineHeight: 1.6 }}>{selectedRole.description}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 10, color: STYLE.sub, marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CurrencyDollar size={11} />${Math.round(selectedRole.salaryRangeMin / 1000)}k–${Math.round(selectedRole.salaryRangeMax / 1000)}k</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Timer size={11} />4-month curriculum</span>
            <span style={{ fontWeight: 700, color: STYLE.accent }}>{completionPct}% complete</span>
          </div>
          <div style={{ height: 1, background: STYLE.border, overflow: 'hidden', borderRadius: 1 }}>
            <div style={{ height: 1, background: STYLE.accent, width: `${completionPct}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* View mode toggle row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          {/* AI Insights toggle */}
          <button type="button" onClick={() => setInsightsPanelOpen(v => !v)}
            style={{ border: `1px solid ${insightsPanelOpen ? STYLE.accent : STYLE.border}`, borderRadius: 6,
              padding: '6px 14px', background: 'transparent',
              color: insightsPanelOpen ? STYLE.accent : STYLE.sub,
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
            <Brain size={12} /> AI Insights
          </button>
        </div>

        {/* AI Insights collapsible panel */}
        {insightsPanelOpen && (
          <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ border: `1px solid ${STYLE.border}`, borderRadius: 10, padding: '16px 20px', background: STYLE.surface }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', color: STYLE.txt, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MagnifyingGlass size={14} style={{ color: STYLE.accent }} />
                    Skill Gap Analysis
                  </div>
                  <p style={{ fontSize: 11, color: STYLE.sub }}>
                    {currentReport
                      ? 'Your personalised skill report is ready. Re-run to refresh.'
                      : 'Answer a few questions to get a personalised skill gap report and AI recommendations.'}
                  </p>
                </div>
                <button type="button" onClick={() => setAnalyzerOpen(true)}
                  style={{ border: `1px solid ${STYLE.accent}`, borderRadius: 6, padding: '7px 14px', background: 'transparent',
                    color: STYLE.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkle size={12} />
                  {currentReport ? 'Re-run Assessment' : 'Start Assessment'}
                </button>
              </div>
              {currentReport && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { label: `${profCount} Proficient`, color: '#4ade80', border: '#166534' },
                    { label: `${partCount} Partial`,    color: '#fbbf24', border: '#78350f' },
                    { label: `${noneCount} To Learn`,   color: '#f87171', border: '#7f1d1d' },
                  ].map(({ label, color, border }) => (
                    <span key={label} style={{ fontSize: 10, color, border: `1px solid ${border}`, borderRadius: 4, padding: '2px 8px' }}>
                      {label}
                    </span>
                  ))}
                  {currentReport.canSkipMonths.length > 0 && (
                    <span style={{ fontSize: 10, color: '#818cf8', border: '1px solid #3730a3', borderRadius: 4, padding: '2px 8px' }}>
                      Skip Month {currentReport.canSkipMonths.join(', ')}
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: STYLE.sub }}>
                    {currentReport.overallReadiness}% ready
                  </span>
                </div>
              )}
            </div>

            {topRecos.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', color: STYLE.txt, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Brain size={14} style={{ color: STYLE.accent }} />
                  Top Career Matches
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {topRecos.map((reco, idx) => {
                    const matched = roles.find(r => r.id === reco.roleId)
                    if (!matched) return null
                    return (
                      <MLCareerRecommendationCard
                        key={reco.roleId}
                        recommendation={reco}
                        role={matched}
                        rank={idx + 1}
                        onView={() => chooseRole(matched)}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {topRecos.length === 0 && !currentReport && (
              <div style={{ border: `1px solid ${STYLE.border}`, borderRadius: 10, padding: 40, textAlign: 'center', background: STYLE.surface }}>
                <Brain size={40} style={{ color: STYLE.border, margin: '0 auto 12px' }} />
                <p style={{ fontSize: 12, color: STYLE.sub }}>Run the skill assessment above to generate personalised career recommendations.</p>
              </div>
            )}
          </div>
        )}

        {/* Primary view: Learning Roadmap */}
        {subView === 'roadmap' && (
          <LearningRoadmap
            role={selectedRole}
            completedItems={completedSet}
            isAuthenticated={true}
            canSkipMonths={currentReport?.canSkipMonths}
            focusMonths={currentReport?.focusMonths}
            onToggleItem={toggleItem}
            onOpenQuiz={openQuiz}
            onOpenProject={openProject}
          />
        )}

        <SkillGapAnalyzer role={selectedRole} open={analyzerOpen} onOpenChange={handleAnalyzerClose} />
      </div>

    </div>
  )
}
