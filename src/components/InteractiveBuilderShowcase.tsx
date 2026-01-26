import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Rocket, 
  CheckCircle, 
  Lightbulb, 
  Target,
  Code,
  Eye,
  Trophy,
  Sparkle
} from '@phosphor-icons/react'

export function InteractiveBuilderShowcase() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <Sparkle size={20} weight="duotone" className="text-primary" />
          <span className="text-primary font-semibold">NEW FEATURE</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          Build Projects Interactively
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Write real code, run tests, get instant feedback, and build projects step-by-step
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Feature 1 */}
        <Card className="border-2 p-6 space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Target size={24} weight="duotone" className="text-primary" />
          </div>
          <h3 className="text-xl font-bold">Step-by-Step Guidance</h3>
          <p className="text-muted-foreground">
            Each project broken into small, manageable steps with clear requirements. 
            Start with TODO comments and build incrementally.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Clear Goals</Badge>
            <Badge variant="secondary">Starter Code</Badge>
            <Badge variant="secondary">Progress Tracking</Badge>
          </div>
        </Card>

        {/* Feature 2 */}
        <Card className="border-2 p-6 space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <CheckCircle size={24} weight="duotone" className="text-primary" />
          </div>
          <h3 className="text-xl font-bold">Automated Test Cases</h3>
          <p className="text-muted-foreground">
            Run tests to validate your code instantly. Get specific feedback on what's 
            working and what needs fixing.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Real Validation</Badge>
            <Badge variant="secondary">Instant Feedback</Badge>
            <Badge variant="secondary">Visual Results</Badge>
          </div>
        </Card>

        {/* Feature 3 */}
        <Card className="border-2 p-6 space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Eye size={24} weight="duotone" className="text-primary" />
          </div>
          <h3 className="text-xl font-bold">Live Preview</h3>
          <p className="text-muted-foreground">
            See your code output in real-time as you type. Catch errors early and 
            experiment freely in a safe environment.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Real-time Output</Badge>
            <Badge variant="secondary">Error Detection</Badge>
            <Badge variant="secondary">Safe Sandbox</Badge>
          </div>
        </Card>

        {/* Feature 4 */}
        <Card className="border-2 p-6 space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Lightbulb size={24} weight="duotone" className="text-primary" />
          </div>
          <h3 className="text-xl font-bold">Progressive Hints</h3>
          <p className="text-muted-foreground">
            Stuck? Get multi-level hints that guide without spoiling. Learn problem-solving 
            while getting the help you need.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Smart Help</Badge>
            <Badge variant="secondary">Code Snippets</Badge>
            <Badge variant="secondary">Learn by Doing</Badge>
          </div>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="border-2 p-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Code size={28} weight="duotone" />
          How It Works
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold mb-1">Choose a Project</h4>
              <p className="text-muted-foreground text-sm">
                Select from Digital Clock, Calculator, Temperature Converter, and more
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold mb-1">Write Code Step-by-Step</h4>
              <p className="text-muted-foreground text-sm">
                Follow TODO comments and requirements. Build your project incrementally.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold mb-1">Run Tests & Get Feedback</h4>
              <p className="text-muted-foreground text-sm">
                Click "Run Tests" to validate. See exactly which requirements pass or fail.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="font-semibold mb-1">Use Hints if Needed</h4>
              <p className="text-muted-foreground text-sm">
                Request progressive hints that guide you without giving away the solution.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <h4 className="font-semibold mb-1">Complete & Celebrate!</h4>
              <p className="text-muted-foreground text-sm">
                Pass all tests, move to next step, and celebrate your completed project!
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Projects with Interactive Mode */}
      <Card className="border-2 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Trophy size={28} weight="duotone" className="text-primary" />
          Available Interactive Projects
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border-2 border-primary/30 bg-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">Digital Clock</h4>
              <Badge variant="default" className="bg-primary">
                <Rocket size={12} className="mr-1" />
                Interactive
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">3 coding steps</p>
            <p className="text-xs text-muted-foreground">
              Learn Date objects, time extraction, and string formatting
            </p>
          </div>

          <div className="border-2 border-primary/30 bg-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">Calculator</h4>
              <Badge variant="default" className="bg-primary">
                <Rocket size={12} className="mr-1" />
                Interactive
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">3 coding steps</p>
            <p className="text-xs text-muted-foreground">
              Build functions, handle operations, and combine logic
            </p>
          </div>

          <div className="border-2 border-primary/30 bg-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">Temperature</h4>
              <Badge variant="default" className="bg-primary">
                <Rocket size={12} className="mr-1" />
                Interactive
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">2 coding steps</p>
            <p className="text-xs text-muted-foreground">
              Master conversion formulas and mathematical operations
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-6">
          More interactive projects coming soon!
        </p>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-4 py-8">
        <h2 className="text-3xl font-bold">Ready to Start Building?</h2>
        <p className="text-muted-foreground">
          Choose a project and click the "Build Interactive" button to begin!
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Rocket className="mr-2" size={20} weight="duotone" />
          Explore Projects
        </Button>
      </div>
    </div>
  )
}
