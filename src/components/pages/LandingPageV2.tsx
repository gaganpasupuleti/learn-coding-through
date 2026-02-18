import { ArrowRight, Briefcase, ChartBar, Cube, GraduationCap, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LandingPageV2Props {
  onNavigate: (page: 'projects' | 'practice' | 'quiz' | 'roadmapper') => void
  experienceVersion: 'v1' | 'v2'
  onChangeExperienceVersion: (version: 'v1' | 'v2') => void
  selectedPalette: LandingPalette
  onChangePalette: (palette: LandingPalette) => void
}

type LandingPalette = 'executive' | 'sapphire' | 'royal'

const paletteOptions: Array<{ key: LandingPalette; label: string }> = [
  { key: 'executive', label: 'Executive' },
  { key: 'sapphire', label: 'Sapphire' },
  { key: 'royal', label: 'Royal' },
]

export function LandingPageV2({
  onNavigate,
  experienceVersion,
  onChangeExperienceVersion,
  selectedPalette,
  onChangePalette,
}: LandingPageV2Props) {

  return (
    <div className="landing-v2 min-h-screen relative overflow-hidden" data-palette={selectedPalette}>
      <div className="landing-v2-bg absolute inset-0" aria-hidden="true" />
      <div className="landing-v2-glow landing-v2-glow-a" aria-hidden="true" />
      <div className="landing-v2-glow landing-v2-glow-b" aria-hidden="true" />

      <div className="relative container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur px-2 py-1">
              <Button
                size="sm"
                variant={experienceVersion === 'v1' ? 'outline' : 'default'}
                className="rounded-full"
                onClick={() => onChangeExperienceVersion('v1')}
              >
                V1
              </Button>
              <Button
                size="sm"
                variant={experienceVersion === 'v2' ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => onChangeExperienceVersion('v2')}
              >
                V2
              </Button>
            </div>

            <div className="flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur px-2 py-1">
              {paletteOptions.map((option) => (
                <Button
                  key={option.key}
                  size="sm"
                  variant={selectedPalette === option.key ? 'default' : 'ghost'}
                  className="rounded-full"
                  onClick={() => onChangePalette(option.key)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <Badge className="rounded-full px-4 py-1.5 text-xs tracking-wide uppercase">
              Career Acceleration Platform
            </Badge>
          </div>

          <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-8 items-stretch">
            <Card className="border-border/60 bg-card/85 backdrop-blur shadow-sm">
              <CardHeader className="space-y-5">
                <CardTitle className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
                  Launch Your Career with a
                  <span className="block text-primary">Focused Learning Journey</span>
                </CardTitle>
                <CardDescription className="text-base md:text-lg leading-relaxed max-w-2xl">
                  Choose your role, train with guided practice, build portfolio-ready projects, and
                  validate progress using stage-based assessments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="h-11 px-7" onClick={() => onNavigate('roadmapper')}>
                    Start Career Mapping
                    <ArrowRight size={18} weight="bold" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-11 px-7" onClick={() => onNavigate('practice')}>
                    Begin Practice Track
                    <Cube size={18} />
                  </Button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <Card className="gap-3 bg-background/60 border-border/60 py-4">
                    <CardContent className="px-4 pt-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Career Tracks</p>
                      <p className="text-2xl font-semibold mt-1">12+</p>
                    </CardContent>
                  </Card>
                  <Card className="gap-3 bg-background/60 border-border/60 py-4">
                    <CardContent className="px-4 pt-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Hands-on Projects</p>
                      <p className="text-2xl font-semibold mt-1">30+</p>
                    </CardContent>
                  </Card>
                  <Card className="gap-3 bg-background/60 border-border/60 py-4">
                    <CardContent className="px-4 pt-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Selection Readiness</p>
                      <p className="text-2xl font-semibold mt-1">Stage-gated</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/85 backdrop-blur py-5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">What You Build Here</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border bg-background/60 p-4 flex items-start gap-3">
                  <ChartBar size={20} className="text-primary mt-0.5" weight="duotone" />
                  <div>
                    <p className="font-medium">Skill Depth</p>
                    <p className="text-sm text-muted-foreground">Daily coding practice with progressive complexity.</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-background/60 p-4 flex items-start gap-3">
                  <Briefcase size={20} className="text-primary mt-0.5" weight="duotone" />
                  <div>
                    <p className="font-medium">Portfolio Proof</p>
                    <p className="text-sm text-muted-foreground">Project outputs mapped to hiring expectations.</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-background/60 p-4 flex items-start gap-3">
                  <GraduationCap size={20} className="text-primary mt-0.5" weight="duotone" />
                  <div>
                    <p className="font-medium">Interview Readiness</p>
                    <p className="text-sm text-muted-foreground">Milestone quizzes and practical checkpoints.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-border/60 bg-card/80 py-5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkle size={16} className="text-primary" weight="fill" />
                  Discover Role Paths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Explore role outcomes, expected salary ranges, and must-have skills.</p>
                <Button variant="outline" size="sm" onClick={() => onNavigate('roadmapper')}>Explore Roles</Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80 py-5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Build with Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Sharpen fundamentals through targeted coding sessions and feedback loops.</p>
                <Button variant="outline" size="sm" onClick={() => onNavigate('practice')}>Start Practice</Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80 py-5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Deliver Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Convert skills into deployable projects and track progress with checkpoints.</p>
                <Button variant="outline" size="sm" onClick={() => onNavigate('projects')}>Open Projects</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}