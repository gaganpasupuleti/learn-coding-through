import { Briefcase, ChartBar, Sparkle, Student, TrendUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPage } from '@/components/pages/AdminPage'

export function AdminPageV2() {
  return (
    <div data-v2-page="admin" className="min-h-screen bg-gradient-to-b from-background to-secondary/15">
      <div className="container mx-auto px-6 py-8 space-y-6">
        <Card className="border-border/60 bg-card/90 backdrop-blur py-5">
          <CardHeader className="space-y-3">
            <Badge className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wide">
              <Sparkle size={12} className="mr-1" weight="fill" />
              Admin Command V2
            </Badge>
            <CardTitle className="text-3xl md:text-4xl tracking-tight">
              Operate with Clear Metrics,
              <span className="block text-primary">Class Progress, and Hiring Signals</span>
            </CardTitle>
            <CardDescription className="text-base max-w-3xl leading-relaxed">
              Manage students, batches, and jobs from one structured view. Prioritize interventions,
              monitor outcomes, and drive selection readiness.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-4 gap-3">
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Students</p>
                <p className="text-2xl font-semibold mt-1">Active Monitoring</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Batches</p>
                <p className="text-2xl font-semibold mt-1">Class Insights</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Jobs</p>
                <p className="text-2xl font-semibold mt-1">Portal Pipeline</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Role Split</p>
                <p className="text-2xl font-semibold mt-1">Student vs Faculty</p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><ChartBar size={16} className="text-primary" />Metrics</div>
                </CardContent>
              </Card>
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><Student size={16} className="text-primary" />Learners</div>
                </CardContent>
              </Card>
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><Briefcase size={16} className="text-primary" />Placement</div>
                </CardContent>
              </Card>
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><TrendUp size={16} className="text-primary" />Progress</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline">Overview</Button>
              <Button size="sm" variant="outline">Class Timings</Button>
              <Button size="sm" variant="outline">Job Portal</Button>
              <Badge variant="secondary" className="px-3 py-1 rounded-full">Operations</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90 backdrop-blur py-3">
          <CardContent className="px-3 md:px-4">
            <div className="rounded-xl border bg-background/50 p-1 md:p-2 v2-content-shell">
              <AdminPage />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
