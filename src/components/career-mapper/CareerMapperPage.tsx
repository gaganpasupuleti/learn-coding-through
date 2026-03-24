import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Brain,
  Briefcase,
  BarChart2,
  DollarSign,
  Clock,
  Map,
  Sparkles,
  Search,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { fetchCareerRoles } from '@/lib/api'
import { useCareerProgress } from '@/hooks/use-career-progress'
import { useSkillAssessments } from '@/hooks/use-skill-assessments'
import { useMLRecommendations } from '@/hooks/use-ml-recommendations'
import type { CareerRole } from '@/types/career'
import { FlowChart3D } from './FlowChart3D'
import { LearningRoadmap } from './LearningRoadmap'
import { SkillGapAnalyzer } from './SkillGapAnalyzer'
import { MLCareerRecommendationCard } from './MLRecommendationCard'
import { QuizPage } from '@/components/pages/QuizPage'
import { ProjectLearningPage } from '@/components/pages/ProjectLearningPage'

const SELECTED_ROLE_KEY = 'career-mapper-selected-role'

const DOMAIN_ICON: Record<string, React.ReactNode> = {
  Data:   <BarChart2 size={15} className="text-blue-600" />,
  AI:     <Brain size={15} className="text-violet-600" />,
  Web:    <Sparkles size={15} className="text-emerald-600" />,
  DevOps: <Map size={15} className="text-orange-500" />,
}

const DIFF_CLASSES: Record<string, string> = {
  Beginner:     'text-emerald-700 bg-emerald-50 border-emerald-200',
  Intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
  Advanced:     'text-red-700 bg-red-50 border-red-200',
}

export function CareerMapperPage() {
  const [roles, setRoles]               = useState<CareerRole[]>([])
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(() => {
    try {
      const s = localStorage.getItem(SELECTED_ROLE_KEY)
      return s ? (JSON.parse(s) as CareerRole) : null
    } catch { return null }
  })
  const [flowModalOpen, setFlowModalOpen]         = useState(false)
  const [insightsPanelOpen, setInsightsPanelOpen] = useState(false)
  const [analyzerOpen, setAnalyzerOpen]           = useState(false)
  const [isLoading, setIsLoading]                 = useState(true)

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
    setFlowModalOpen(false)
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
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8 space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Career Mapper</h1>
            <p className="text-sm text-slate-500">
              Choose a career path, explore your 4-month syllabus, and track progress with AI insights.
            </p>
          </div>

          {/* Skeleton or grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-5 space-y-3 animate-pulse">
                  <div className="h-3.5 w-3/5 bg-slate-100 rounded" />
                  <div className="h-2.5 w-2/5 bg-slate-100 rounded" />
                  <div className="h-8 bg-slate-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map(role => (
                <div
                  key={role.id}
                  onClick={() => chooseRole(role)}
                  className="group rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-3 cursor-pointer hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0">{DOMAIN_ICON[role.domain] ?? <Briefcase size={15} className="text-slate-400" />}</span>
                      <span className="text-sm font-semibold text-slate-900 tracking-tight">{role.title}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_CLASSES[role.difficulty] ?? 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                      {role.difficulty.toUpperCase()}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{role.description}</p>

                  {/* Meta */}
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <DollarSign size={11} />
                      ${Math.round(role.salaryRangeMin / 1000)}k–${Math.round(role.salaryRangeMax / 1000)}k
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      4 months
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {role.skills.slice(0, 5).map(skill => (
                      <span key={skill} className="text-[10px] text-slate-500 border border-slate-200 rounded-full px-2 py-0.5">{skill}</span>
                    ))}
                    {role.skills.length > 5 && (
                      <span className="text-[10px] text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">+{role.skills.length - 5}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); chooseRole(role) }}
                    className="mt-1 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-150"
                  >
                    Explore Path
                    <ChevronRight size={13} strokeWidth={2.5} />
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
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back */}
        <button
          type="button"
          onClick={clearRole}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-5 transition-colors duration-150"
        >
          <ArrowLeft size={13} />
          All Roles
        </button>

        {/* Role header card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 mb-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">{selectedRole.title}</h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_CLASSES[selectedRole.difficulty] ?? 'text-slate-500 bg-slate-50 border-slate-200'}`}>
              {selectedRole.difficulty.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-500 border border-slate-200 rounded-full px-2 py-0.5">{selectedRole.domain}</span>
          </div>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">{selectedRole.description}</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1"><DollarSign size={11} />${Math.round(selectedRole.salaryRangeMin / 1000)}k–${Math.round(selectedRole.salaryRangeMax / 1000)}k</span>
            <span className="flex items-center gap-1"><Clock size={11} />4-month curriculum</span>
            <span className="font-semibold text-blue-600">{completionPct}% complete</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {/* View mode toggle row */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          {/* Pill toggle */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1 gap-1">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white shadow-sm"
            >
              <Map size={12} /> Roadmap
            </button>
            <button
              type="button"
              onClick={() => setFlowModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-150"
            >
              <BarChart2 size={12} /> 3D Map ↗
            </button>
          </div>
          {/* AI Insights toggle */}
          <button
            type="button"
            onClick={() => setInsightsPanelOpen(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
              insightsPanelOpen
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            <Sparkles size={13} /> AI Insights
          </button>
        </div>

        {/* AI Insights panel */}
        {insightsPanelOpen && (
          <div className="mb-6 space-y-4">
            {/* Skill gap card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-1">
                    <Search size={14} className="text-blue-600" />
                    Skill Gap Analysis
                  </div>
                  <p className="text-xs text-slate-500">
                    {currentReport
                      ? 'Your personalised skill report is ready. Re-run to refresh.'
                      : 'Answer a few questions to get a personalised skill gap report and AI recommendations.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalyzerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-150"
                >
                  <Sparkles size={12} />
                  {currentReport ? 'Re-run Assessment' : 'Start Assessment'}
                </button>
              </div>
              {currentReport && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">{profCount} Proficient</span>
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">{partCount} Partial</span>
                  <span className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">{noneCount} To Learn</span>
                  {currentReport.canSkipMonths.length > 0 && (
                    <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                      Skip Month {currentReport.canSkipMonths.join(', ')}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-slate-400">{currentReport.overallReadiness}% ready</span>
                </div>
              )}
            </div>

            {/* Top career matches */}
            {topRecos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                  <Brain size={14} className="text-blue-600" />
                  Top Career Matches
                </div>
                <div className="grid md:grid-cols-3 gap-4">
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
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center">
                <Brain size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-400">Run the skill assessment above to generate personalised career recommendations.</p>
              </div>
            )}
          </div>
        )}

        {/* Learning Roadmap */}
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

      {/* 3D Flowchart full-screen modal */}
      {flowModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <button
              type="button"
              onClick={() => setFlowModalOpen(false)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-5 transition-colors"
            >
              <ArrowLeft size={13} /> Back to Roadmap
            </button>
            <div className="text-base font-bold text-slate-100 mb-5 tracking-tight">
              {selectedRole.title} · 3D Course Map
            </div>
            <FlowChart3D role={selectedRole} completedItems={completedSet} />
          </div>
        </div>
      )}
    </div>
  )
}
