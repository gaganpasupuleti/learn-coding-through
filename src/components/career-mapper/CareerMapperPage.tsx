import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { FlowChart3D } from './FlowChart3D'
import { LearningRoadmap } from './LearningRoadmap'
import { SkillGapAnalyzer } from './SkillGapAnalyzer'
import { MLCareerRecommendationCard } from './MLRecommendationCard'

const SELECTED_ROLE_KEY = 'career-mapper-selected-role'

const DOMAIN_ICON: Record<string, React.ReactNode> = {
  Data: <ChartLine size={20} />,
  AI: <Brain size={20} />,
  Web: <Lightning size={20} />,
  DevOps: <Sparkle size={20} />,
}

function DifficultyBadge({ level }: { level: string }) {
  const variant =
    level === 'Beginner' ? 'secondary' : level === 'Intermediate' ? 'outline' : 'default'
  return <Badge variant={variant}>{level}</Badge>
}

export function CareerMapperPage() {
  const [roles, setRoles] = useState<CareerRole[]>([])
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(() => {
    try {
      const stored = localStorage.getItem(SELECTED_ROLE_KEY)
      return stored ? (JSON.parse(stored) as CareerRole) : null
    } catch {
      return null
    }
  })
  const [activeTab, setActiveTab] = useState<'flow' | 'roadmap' | 'insights'>('flow')
  const [analyzerOpen, setAnalyzerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { progress, toggleItem } = useCareerProgress(selectedRole?.id ?? 'none')
  const { skillReports, getReport } = useSkillAssessments()
  const { generateAllCareerRecommendations, getTopCareerRecommendations } = useMLRecommendations()

  const completedSet = useMemo(
    () =>
      new Set<string>(
        Object.entries(progress.completedItems)
          .filter(([, v]) => v)
          .map(([k]) => k)
      ),
    [progress]
  )

  const currentReport = selectedRole ? getReport(selectedRole.id) : undefined
  const topRecos = getTopCareerRecommendations(3)

  useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const loaded = await fetchCareerRoles()
        setRoles(loaded)
        if (selectedRole) {
          const fresh = loaded.find((r) => r.id === selectedRole.id)
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
    setActiveTab('flow')
  }

  const clearRole = () => {
    setSelectedRole(null)
    localStorage.removeItem(SELECTED_ROLE_KEY)
  }

  const handleAnalyzerClose = (open: boolean) => {
    setAnalyzerOpen(open)
    if (!open && selectedRole) {
      const report = getReport(selectedRole.id)
      if (report) {
        generateAllCareerRecommendations(roles, Object.values(skillReports))
      }
    }
  }

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto px-6 py-10 max-w-7xl">
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Career Mapper</h1>
            <p className="text-muted-foreground text-lg">
              Choose a career path, explore your 4-month syllabus, and track your progress with AI insights.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-5 animate-pulse space-y-3">
                  <div className="h-5 w-2/3 bg-muted rounded" />
                  <div className="h-3 w-1/3 bg-muted rounded" />
                  <div className="h-8 bg-muted rounded" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {roles.map((role) => (
                <Card
                  key={role.id}
                  className="p-5 flex flex-col gap-3 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => chooseRole(role)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">
                        {DOMAIN_ICON[role.domain] ?? <Briefcase size={20} />}
                      </span>
                      <h3 className="font-semibold text-lg leading-tight">{role.title}</h3>
                    </div>
                    <DifficultyBadge level={role.difficulty} />
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CurrencyDollar size={14} />
                      {role.salaryRange}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Timer size={14} />
                      4 months
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {role.skills.slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {role.skills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.skills.length - 5}
                      </Badge>
                    )}
                  </div>

                  <Button
                    className="mt-auto w-full group-hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation()
                      chooseRole(role)
                    }}
                  >
                    Explore Path
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const completionPct =
    selectedRole.syllabus.length > 0
      ? Math.round((completedSet.size / selectedRole.syllabus.length) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={clearRole} className="gap-2 -ml-2">
            <ArrowLeft size={16} />
            All Roles
          </Button>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{selectedRole.title}</h1>
            <DifficultyBadge level={selectedRole.difficulty} />
            <Badge variant="outline">{selectedRole.domain}</Badge>
          </div>
          <p className="text-muted-foreground">{selectedRole.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CurrencyDollar size={14} />
              {selectedRole.salaryRange}
            </span>
            <span className="flex items-center gap-1.5">
              <Timer size={14} />
              4-month curriculum
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-primary">
              {completionPct}% complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden max-w-xs">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="flow" className="gap-2">
              <MapTrifold size={16} />
              Flow Chart
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="gap-2">
              <ChartLine size={16} />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain size={16} />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flow">
            <FlowChart3D role={selectedRole} completedItems={completedSet} />
          </TabsContent>

          <TabsContent value="roadmap">
            <LearningRoadmap
              role={selectedRole}
              completedItems={completedSet}
              isAuthenticated={true}
              canSkipMonths={currentReport?.canSkipMonths}
              focusMonths={currentReport?.focusMonths}
              onToggleItem={toggleItem}
            />
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-6">
              <Card className="p-6 border-2 border-dashed">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <MagnifyingGlass size={20} className="text-primary" />
                      Skill Gap Analysis
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentReport
                        ? 'Your personalised skill report is ready. Re-run to refresh.'
                        : 'Answer a few questions to get a personalised skill gap report and AI recommendations.'}
                    </p>
                  </div>
                  <Button onClick={() => setAnalyzerOpen(true)} className="gap-2">
                    <Sparkle size={16} />
                    {currentReport ? 'Re-run Assessment' : 'Start Assessment'}
                  </Button>
                </div>

                {currentReport && (
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <Badge className="bg-green-500/20 text-green-700 border-green-400">
                      {currentReport.proficientSkills.length} Proficient
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-400">
                      {currentReport.partialSkills.length} Partial
                    </Badge>
                    <Badge className="bg-red-500/20 text-red-700 border-red-400">
                      {currentReport.missingSkills.length} To Learn
                    </Badge>
                    {currentReport.canSkipMonths && currentReport.canSkipMonths.length > 0 && (
                      <Badge className="bg-blue-500/20 text-blue-700 border-blue-400">
                        Can skip Month {currentReport.canSkipMonths.join(', ')}
                      </Badge>
                    )}
                  </div>
                )}
              </Card>

              {topRecos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Brain size={20} className="text-primary" />
                    Top Career Matches
                  </h3>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {topRecos.map((reco, idx) => {
                      const matchedRole = roles.find((r) => r.id === reco.roleId)
                      if (!matchedRole) return null
                      return (
                        <MLCareerRecommendationCard
                          key={reco.roleId}
                          recommendation={reco}
                          role={matchedRole}
                          rank={idx + 1}
                          onView={() => chooseRole(matchedRole)}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {topRecos.length === 0 && !currentReport && (
                <Card className="p-8 text-center text-muted-foreground">
                  <Brain size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Run the skill assessment above to generate personalised career recommendations.</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <SkillGapAnalyzer
          role={selectedRole}
          open={analyzerOpen}
          onOpenChange={handleAnalyzerClose}
        />
      </div>
    </div>
  )
}
