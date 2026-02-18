import { Sparkle } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Project } from '@/lib/projects'
import { ProjectLearningPage } from '@/components/pages/ProjectLearningPage'

interface ProjectLearningPageV2Props {
  project: Project
  onBack: () => void
}

export function ProjectLearningPageV2({ project, onBack }: ProjectLearningPageV2Props) {
  return (
    <div data-v2-page="learning" className="min-h-screen bg-gradient-to-b from-background to-secondary/15">
      <div className="container mx-auto px-6 pt-8">
        <Card className="border-border/60 bg-card/90 backdrop-blur">
          <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Learning V2</p>
              <p className="text-sm text-muted-foreground">Structured walkthrough with premium V2 tone and spacing.</p>
            </div>
            <Badge className="rounded-full px-3 py-1"><Sparkle size={12} className="mr-1" weight="fill" />Guided Build</Badge>
          </CardContent>
        </Card>
      </div>
      <ProjectLearningPage project={project} onBack={onBack} />
    </div>
  )
}
