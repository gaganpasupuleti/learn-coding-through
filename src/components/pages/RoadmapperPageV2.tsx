import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SyllabusTimeline } from '@/components/SyllabusTimeline'
import { RoadmapperPage } from '@/components/pages/RoadmapperPage'

interface RoadmapperPageV2Props {
  /** Called when the user clicks the "Sign up free" CTA (public browse mode only). */
  onSignUp?: () => void
}

export function RoadmapperPageV2({ onSignUp }: RoadmapperPageV2Props) {
  return (
    <div data-v2-page="roadmapper" className="min-h-screen bg-gradient-to-b from-background to-secondary/15">
      <div className="container mx-auto px-6 pt-8 space-y-6">
        <Card className="border-border/60 bg-card/90 backdrop-blur">
          <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Career Mapper</p>
              <p className="text-sm text-muted-foreground">Explore career paths, preview 4-month syllabuses, and start your journey.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full px-3 py-1"><Sparkle size={12} className="mr-1" weight="fill" />Career Path</Badge>
              {onSignUp && (
                <Button size="sm" onClick={onSignUp}>
                  Sign up for free
                  <ArrowRight size={14} weight="bold" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4-month syllabus preview – shown inline for public browsing */}
        <div className="grid lg:grid-cols-2 gap-6">
          <SyllabusTimeline roleKey="data-analyst" />
          <SyllabusTimeline roleKey="python-backend-developer" />
        </div>
      </div>

      <RoadmapperPage />
    </div>
  )
}
