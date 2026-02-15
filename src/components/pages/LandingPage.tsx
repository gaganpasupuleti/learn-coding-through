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
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Student Career{' '}
              <span className="text-primary">Acceleration Portal</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Pick your target role, follow stage-wise learning, clear quizzes to unlock next stages,
              and finish with projects, resume, and interview preparation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                onClick={() => onNavigate('roadmapper')}
              >
                Start with Roadmapper
                <ArrowRight className="ml-2" size={20} weight="bold" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-secondary/50 transition-all hover:-translate-y-0.5"
                onClick={() => onNavigate('quiz')}
              >
                Jump to Quizzes
                <Cube className="ml-2" size={20} />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-4 pt-4 text-left">
            <div className="bg-card rounded-xl p-5 space-y-2 border">
              <h3 className="text-base font-semibold">1. Choose Role</h3>
              <p className="text-muted-foreground text-sm">Open Roadmapper and pick your target career role.</p>
              <Button size="sm" variant="outline" onClick={() => onNavigate('roadmapper')}>
                Open Roadmapper
              </Button>
            </div>
            <div className="bg-card rounded-xl p-5 space-y-2 border">
              <h3 className="text-base font-semibold">2. Learn & Practice</h3>
              <p className="text-muted-foreground text-sm">Use Projects and Practice tabs to build required skills.</p>
              <Button size="sm" variant="outline" onClick={() => onNavigate('projects')}>
                Open Projects
              </Button>
            </div>
            <div className="bg-card rounded-xl p-5 space-y-2 border">
              <h3 className="text-base font-semibold">3. Pass Quiz</h3>
              <p className="text-muted-foreground text-sm">Clear the quiz with at least 70% to unlock next stage.</p>
              <Button size="sm" variant="outline" onClick={() => onNavigate('quiz')}>
                Open Quiz
              </Button>
            </div>
            <div className="bg-card rounded-xl p-5 space-y-2 border">
              <h3 className="text-base font-semibold">4. Build Project</h3>
              <p className="text-muted-foreground text-sm">Complete mini and capstone projects for job readiness.</p>
              <Button size="sm" variant="outline" onClick={() => onNavigate('projects')}>
                Build Projects
              </Button>
            </div>
            <div className="bg-card rounded-xl p-5 space-y-2 border">
              <h3 className="text-base font-semibold">5. Get Interview Ready</h3>
              <p className="text-muted-foreground text-sm">Prepare resume and interview responses using final stage tasks.</p>
              <Button size="sm" variant="outline" onClick={() => onNavigate('roadmapper')}>
                Track Final Stage
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
