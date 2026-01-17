import { Button } from '@/components/ui/button'
import { ArrowRight, Cube, Lightbulb, Code } from '@phosphor-icons/react'

interface LandingPageProps {
  onNavigate: (page: 'projects') => void
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Learn Coding Through{' '}
              <span className="text-primary">Small Projects</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Start your coding journey by building real projects. No experience needed - 
              we'll guide you step-by-step from idea to working code.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                onClick={() => onNavigate('projects')}
              >
                Start Learning
                <ArrowRight className="ml-2" size={20} weight="bold" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-secondary/50 transition-all hover:-translate-y-0.5"
                onClick={() => onNavigate('projects')}
              >
                View Projects
                <Cube className="ml-2" size={20} />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="bg-card rounded-xl p-6 space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Lightbulb size={24} className="text-primary" weight="duotone" />
              </div>
              <h3 className="text-xl font-semibold">Simple Explanations</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                No confusing jargon. We explain everything in plain English that anyone can understand.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Code size={24} className="text-accent" weight="duotone" />
              </div>
              <h3 className="text-xl font-semibold">Step-by-Step</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Each project is broken down into small, manageable steps that build on each other.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/30 rounded-lg flex items-center justify-center">
                <Cube size={24} className="text-primary" weight="duotone" />
              </div>
              <h3 className="text-xl font-semibold">See It Work</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Watch your code come to life with live previews. See exactly what you're building.
              </p>
            </div>
          </div>

          <div className="pt-12 text-sm text-muted-foreground">
            Perfect for absolute beginners • No setup required • Start in seconds
          </div>
        </div>
      </div>
    </div>
  )
}
