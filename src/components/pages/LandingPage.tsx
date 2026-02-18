import { Button } from '@/components/ui/button'
import { ArrowRight, Cube, Lightbulb, Code } from '@phosphor-icons/react'

interface LandingPageProps {
  onNavigate: (page: 'projects' | 'practice' | 'quiz' | 'roadmapper') => void
  experienceVersion: 'v1' | 'v2'
  onChangeExperienceVersion: (version: 'v1' | 'v2') => void
  selectedPalette: 'executive' | 'sapphire' | 'royal'
  onChangePalette: (palette: 'executive' | 'sapphire' | 'royal') => void
}

export function LandingPage({
  onNavigate,
  experienceVersion,
  onChangeExperienceVersion,
  selectedPalette,
  onChangePalette,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="flex flex-wrap justify-between items-center gap-3 rounded-xl border bg-card/60 p-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={experienceVersion === 'v1' ? 'default' : 'outline'}
                onClick={() => onChangeExperienceVersion('v1')}
              >
                V1
              </Button>
              <Button
                size="sm"
                variant={experienceVersion === 'v2' ? 'default' : 'outline'}
                onClick={() => onChangeExperienceVersion('v2')}
              >
                V2
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={selectedPalette === 'executive' ? 'default' : 'outline'}
                onClick={() => {
                  onChangePalette('executive')
                  if (experienceVersion === 'v1') {
                    onChangeExperienceVersion('v2')
                  }
                }}
              >
                Executive
              </Button>
              <Button
                size="sm"
                variant={selectedPalette === 'sapphire' ? 'default' : 'outline'}
                onClick={() => {
                  onChangePalette('sapphire')
                  if (experienceVersion === 'v1') {
                    onChangeExperienceVersion('v2')
                  }
                }}
              >
                Sapphire
              </Button>
              <Button
                size="sm"
                variant={selectedPalette === 'royal' ? 'default' : 'outline'}
                onClick={() => {
                  onChangePalette('royal')
                  if (experienceVersion === 'v1') {
                    onChangeExperienceVersion('v2')
                  }
                }}
              >
                Royal
              </Button>
            </div>
          </div>

          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Student Career{' '}
              <span className="text-primary">Acceleration Portal</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              See career paths, choose your target role, build skills through practice and projects,
              then validate readiness with stage quizzes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                onClick={() => onNavigate('roadmapper')}
              >
                Choose My Career Path
                <ArrowRight className="ml-2" size={20} weight="bold" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-secondary/50 transition-all hover:-translate-y-0.5"
                onClick={() => onNavigate('practice')}
              >
                Practice Coding Now
                <Cube className="ml-2" size={20} />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 pt-4 text-left">
            <div className="bg-card rounded-xl p-5 space-y-2 border">
              <h3 className="text-base font-semibold">1. Explore Career Options</h3>
              <p className="text-muted-foreground text-sm">View roles, salaries, skills, and timelines before selecting a path.</p>
              <Button size="sm" variant="outline" onClick={() => onNavigate('roadmapper')}>
                Explore Roles
              </Button>
            </div>
            <div className="bg-card rounded-xl p-5 space-y-2 border">
              <h3 className="text-base font-semibold">2. Build Core Skills</h3>
              <p className="text-muted-foreground text-sm">Start with practice challenges to strengthen coding fundamentals.</p>
              <Button size="sm" variant="outline" onClick={() => onNavigate('practice')}>
                Start Practice
              </Button>
            </div>
            <div className="bg-card rounded-xl p-5 space-y-2 border">
              <h3 className="text-base font-semibold">3. Build Projects</h3>
              <p className="text-muted-foreground text-sm">Apply your skills in mini and capstone projects for portfolio proof.</p>
              <Button size="sm" variant="outline" onClick={() => onNavigate('projects')}>
                Open Projects
              </Button>
            </div>
            <div className="bg-card rounded-xl p-5 space-y-2 border">
              <h3 className="text-base font-semibold">4. Check Readiness</h3>
              <p className="text-muted-foreground text-sm">Take quizzes to validate progress and unlock the next stage.</p>
              <Button size="sm" variant="outline" onClick={() => onNavigate('quiz')}>
                Take Quiz
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
