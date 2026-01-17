import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock, ChartBar } from '@phosphor-icons/react'
import { projects } from '@/lib/projects'

interface ProjectsPageProps {
  onSelectProject: (projectId: string) => void
}

export function ProjectsPage({ onSelectProject }: ProjectsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Choose Your Project
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pick a project to start learning. Each one teaches you important coding concepts 
              through hands-on building.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4">
            {projects.map((project) => (
              <Card 
                key={project.id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 bg-card"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-2xl">{project.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {project.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="px-3 py-1">
                      <ChartBar size={14} className="mr-1.5" weight="fill" />
                      {project.difficulty}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      <Clock size={14} className="mr-1.5" weight="fill" />
                      {project.estimatedTime}
                    </Badge>
                    <Badge className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20">
                      {project.steps.length} Steps
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 transition-all"
                    size="lg"
                    onClick={() => onSelectProject(project.id)}
                  >
                    Start Project
                    <ArrowRight className="ml-2" size={18} weight="bold" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No projects available yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
