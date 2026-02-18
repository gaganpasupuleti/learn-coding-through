import { Code, Cube, Sparkle, Timer, TrendUp } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PracticePage } from '@/components/pages/PracticePage'

const trackAssignments: Record<'python' | 'sql' | 'java' | 'live', string[]> = {
  python: [
    'Complete 2 easy Python exercises',
    'Run one loop/function problem with output check',
    'Push quiz score toward stage target',
  ],
  sql: [
    'Complete one SELECT + WHERE task',
    'Solve one JOIN query using schema tables',
    'Practice one update/delete safely',
  ],
  java: [
    'Complete one class + method exercise',
    'Run one loops and conditions challenge',
    'Verify output formatting in console',
  ],
  live: [
    'Choose language and difficulty',
    'Load template and execute once',
    'Refactor and re-run until clean output',
  ],
}

const trackLabels: Record<'python' | 'sql' | 'java' | 'live', string> = {
  python: 'Python Track',
  sql: 'SQL Track',
  java: 'Java Track',
  live: 'Live Coding',
}

export function PracticePageV2() {
  return (
    <div data-v2-page="practice" className="min-h-screen bg-gradient-to-b from-background to-secondary/15">
      <div className="container mx-auto px-6 py-8 space-y-6">
        <Card className="border-border/60 bg-card/90 backdrop-blur py-5">
          <CardHeader className="space-y-3">
            <Badge className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wide">
              <Sparkle size={12} className="mr-1" weight="fill" />
              Practice Studio V2
            </Badge>
            <CardTitle className="text-3xl md:text-4xl tracking-tight">
              Train Daily with a
              <span className="block text-primary">Professional Coding Loop</span>
            </CardTitle>
            <CardDescription className="text-base max-w-3xl leading-relaxed">
              Select language, load templates by difficulty, execute instantly, and iterate with confidence.
              This V2 experience emphasizes speed, clarity, and consistency.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Languages</p>
                <p className="text-2xl font-semibold mt-1">3</p>
                <p className="text-xs text-muted-foreground mt-1">Python, SQL, Java</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Loop</p>
                <p className="text-2xl font-semibold mt-1">Write → Run</p>
                <p className="text-xs text-muted-foreground mt-1">Immediate output feedback</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Difficulty</p>
                <p className="text-2xl font-semibold mt-1">Easy to Hard</p>
                <p className="text-xs text-muted-foreground mt-1">Guided progression</p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><Code size={16} className="text-primary" />Clean Syntax</div>
                </CardContent>
              </Card>
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><Cube size={16} className="text-primary" />Exercise Templates</div>
                </CardContent>
              </Card>
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><Timer size={16} className="text-primary" />Fast Iterations</div>
                </CardContent>
              </Card>
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><TrendUp size={16} className="text-primary" />Skill Growth</div>
                </CardContent>
              </Card>
            </div>

            <div className="text-sm text-muted-foreground">
              Use the track pills below to focus on one path at a time.
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="python" className="space-y-4">
          <TabsList className="h-auto w-full justify-start flex-wrap gap-2 rounded-xl border bg-card/80 p-2">
            <TabsTrigger value="python" className="rounded-full px-4 py-2">Python Track</TabsTrigger>
            <TabsTrigger value="sql" className="rounded-full px-4 py-2">SQL Track</TabsTrigger>
            <TabsTrigger value="java" className="rounded-full px-4 py-2">Java Track</TabsTrigger>
            <TabsTrigger value="live" className="rounded-full px-4 py-2">Live Coding</TabsTrigger>
          </TabsList>

          {(['python', 'sql', 'java', 'live'] as const).map((trackKey) => (
            <TabsContent key={trackKey} value={trackKey} className="space-y-4">
              <Card className="border-border/60 bg-card/90 backdrop-blur py-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{trackLabels[trackKey]}</CardTitle>
                    <Badge variant="secondary" className="rounded-full px-3 py-1">Pending Assignments</Badge>
                  </div>
                  <CardDescription>
                    Finish these tasks in sequence, then continue practice in the workspace below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3">
                    {trackAssignments[trackKey].map((task) => (
                      <div key={task} className="rounded-lg border bg-background/70 p-3 text-sm">
                        {task}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/90 backdrop-blur py-3">
                <CardContent className="px-3 md:px-4">
                  <div className="rounded-xl border bg-background/50 p-1 md:p-2 v2-content-shell">
                    <PracticePage />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
