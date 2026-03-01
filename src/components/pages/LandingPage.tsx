import { Button } from '@/components/ui/button'
import { ArrowRight, Cube, Lightbulb, Code } from '@phosphor-icons/react'

interface LandingPageProps {
  onNavigate: (page: 'projects' | 'practice' | 'quiz' | 'roadmapper') => void
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Removed V1/V2 and palette pills UI */}

          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Student Career Acceleration Platform
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground">
              See career paths, choose your target role, build skills through practice and projects, and track your progress to job readiness.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="h-11 px-7" onClick={() => onNavigate('roadmapper')}>
                Start Career Mapping
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-7" onClick={() => onNavigate('projects')}>
                Explore Projects
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-2">
            <div className="bg-card rounded-xl p-6 space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Lightbulb size={24} className="text-primary" weight="duotone" />
              </div>
              <h3 className="text-xl font-semibold">Role-Focused Roadmaps</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Each role has skills, salary range, companies hiring, difficulty, and expected timeline.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Code size={24} className="text-accent" weight="duotone" />
              </div>
              <h3 className="text-xl font-semibold">Stage Lock System</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Next stage unlocks only after quiz completion threshold is achieved.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/30 rounded-lg flex items-center justify-center">
                <Cube size={24} className="text-primary" weight="duotone" />
              </div>
              <h3 className="text-xl font-semibold">Job Selection Readiness</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Blend coding exercises, projects, and final interview preparation in one flow.
              </p>
            </div>
          </div>

          <div className="pt-12 text-sm text-muted-foreground">
            Quiz-gated stage progression • Job-focused learning • Build-to-selection flow
          </div>
        </div>
      </div>
    </div>
  )
}
