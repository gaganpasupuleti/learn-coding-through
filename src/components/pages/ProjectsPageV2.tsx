import { ArrowRight, Clock, Sparkle, TrendUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { projects } from '@/lib/projects'

interface ProjectsPageV2Props {
  onSelectProject: (projectId: string) => void
}

export function ProjectsPageV2({ onSelectProject }: ProjectsPageV2Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20" data-v2-page="projects">
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="border-border/60 bg-card/90 backdrop-blur py-6">
            <CardHeader className="space-y-4">
              <Badge className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wider">
                <Sparkle size={12} className="mr-1" weight="fill" />
                Projects V2
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

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="border-border/60 bg-card/90 backdrop-blur transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{project.difficulty}</Badge>
                    <Badge variant="outline">
                      <Clock size={13} className="mr-1" weight="fill" />
                      {project.estimatedTime}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary">{project.steps.length} steps</Badge>
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
                  <Button className="w-full" size="lg" onClick={() => onSelectProject(project.id)}>
                    Start Project Track
                    <ArrowRight size={18} weight="bold" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
