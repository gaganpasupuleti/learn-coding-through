import { ArrowRight, Clock, Lock, Sparkle, TrendUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { projects } from '@/lib/projects'
import { isDemoUser } from '@/lib/auth'
import {
  canStartDemoProject,
  getDemoStartedProjects,
  recordDemoProjectStart,
  DEMO_PROJECT_LIMIT,
} from '@/lib/demo-limits'

interface ProjectsPageV2Props {
  onSelectProject: (projectId: string) => void
}

export function ProjectsPageV2({ onSelectProject }: ProjectsPageV2Props) {
  const isDemo = isDemoUser()
  const startedProjects = isDemo ? getDemoStartedProjects() : []

  const handleSelect = (projectId: string) => {
    if (isDemo) {
      if (!canStartDemoProject(projectId)) return
      recordDemoProjectStart(projectId)
    }
    onSelectProject(projectId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20" data-v2-page="projects">
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="border-border/60 bg-card/90 backdrop-blur py-6">
            <CardHeader className="space-y-4">
              <Badge className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wider">
                <Sparkle size={12} className="mr-1" weight="fill" />
                Projects
              </Badge>
              <CardTitle className="text-3xl md:text-5xl tracking-tight leading-tight">
                Build Professional Projects with
                <span className="block text-primary">Structured Steps</span>
              </CardTitle>
              <CardDescription className="text-base md:text-lg max-w-3xl leading-relaxed">
                Pick a project path, move through guided milestones, and create portfolio-ready outcomes with measurable progress.
              </CardDescription>
            </CardHeader>
          </Card>

          {isDemo && (
            <Card className="border-amber-400/40 bg-amber-500/5 py-3">
              <CardContent className="px-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Demo mode:</strong> You can start any {DEMO_PROJECT_LIMIT} projects.{' '}
                  {startedProjects.length} of {DEMO_PROJECT_LIMIT} used.
                </p>
                <Badge variant="outline" className="border-amber-400/60 text-amber-600 rounded-full">
                  {DEMO_PROJECT_LIMIT - startedProjects.length} remaining
                </Badge>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const isLocked = isDemo && !canStartDemoProject(project.id)
              const isStarted = startedProjects.includes(project.id)

              return (
                <Card
                  key={project.id}
                  className={`border-border/60 bg-card/90 backdrop-blur transition-all duration-200 ${
                    isLocked ? 'opacity-70' : 'hover:shadow-lg hover:-translate-y-0.5'
                  } relative`}
                >
                  {isLocked && (
                    <div className="absolute inset-0 rounded-xl bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 gap-3">
                      <div className="rounded-full bg-muted p-3">
                        <Lock size={22} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground text-center px-6">
                        Demo limit reached ({DEMO_PROJECT_LIMIT} projects). Upgrade for full access.
                      </p>
                    </div>
                  )}

                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{project.difficulty}</Badge>
                      <Badge variant="outline">
                        <Clock size={13} className="mr-1" weight="fill" />
                        {project.estimatedTime}
                      </Badge>
                      <Badge className="bg-primary/10 text-primary">{project.steps.length} steps</Badge>
                      {isStarted && (
                        <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 rounded-full text-xs">
                          Started
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{project.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{project.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-background/70 p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Top Outcomes</p>
                      <div className="space-y-2">
                        {project.steps.slice(0, 3).map((step) => (
                          <div key={step.id} className="flex items-start gap-2 text-sm">
                            <TrendUp size={14} className="text-primary mt-0.5" weight="duotone" />
                            <span>{step.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleSelect(project.id)}
                      disabled={isLocked}
                      variant={isLocked ? 'outline' : 'default'}
                    >
                      {isLocked ? (
                        <>
                          <Lock size={16} className="mr-2" />
                          Locked – Upgrade to Access
                        </>
                      ) : (
                        <>
                          {isStarted ? 'Continue Project' : 'Start Project Track'}
                          <ArrowRight size={18} weight="bold" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
