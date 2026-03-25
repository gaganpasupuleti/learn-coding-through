import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Brain, CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
import type { SkillGapReport as SkillGapReportType, CareerRole } from '@/types/career'
import { useMemo } from 'react'

interface SkillGapReportProps {
  report: SkillGapReportType
  role: CareerRole
}

export function SkillGapReport({ report, role }: SkillGapReportProps) {
  const skillsByLevel = useMemo(() => {
    const proficient: string[] = []
    const partial: string[] = []
    const none: string[] = []

    report.assessments.forEach(assessment => {
      if (assessment.level === 'proficient') {
        proficient.push(assessment.skill)
      } else if (assessment.level === 'partial') {
        partial.push(assessment.skill)
      } else {
        none.push(assessment.skill)
      }
    })

    return { proficient, partial, none }
  }, [report])

  const getReadinessColor = (readiness: number) => {
    if (readiness >= 75) return 'text-green-600'
    if (readiness >= 50) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getReadinessMessage = (readiness: number) => {
    if (readiness >= 75) return 'You\'re well-prepared for this role!'
    if (readiness >= 50) return 'You have a solid foundation to build upon'
    if (readiness >= 25) return 'Focus on fundamentals to build your skills'
    return 'Start with the basics and work your way up'
  }

  const monthsByFocus = useMemo(() => {
    const months = [1, 2, 3, 4]
    return months.map(month => {
      if (report.canSkipMonths.includes(month)) {
        return { month, status: 'skip' as const }
      } else if (report.focusMonths.includes(month)) {
        return { month, status: 'focus' as const }
      } else {
        return { month, status: 'normal' as const }
      }
    })
  }, [report])

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors animate-in fade-in" style={{ animationDelay: '40ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl tracking-tight">
            <Brain className="text-primary" weight="duotone" />
            Overall Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className={`text-4xl font-bold ${getReadinessColor(report.overallReadiness)}`}>
                {report.overallReadiness}%
              </div>
              <div className="text-sm text-muted-foreground">
                {getReadinessMessage(report.overallReadiness)}
              </div>
            </div>
            <div className="text-right text-sm space-y-1">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle weight="fill" />
                <span>{skillsByLevel.proficient.length} Proficient</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-500">
                <Warning weight="fill" />
                <span>{skillsByLevel.partial.length} Partial</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle />
                <span>{skillsByLevel.none.length} Need to Learn</span>
              </div>
            </div>
          </div>
          <Progress value={report.overallReadiness} className="h-3" />
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors animate-in fade-in" style={{ animationDelay: '90ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="text-primary" weight="duotone" />
            Your Personalized Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthsByFocus.map(({ month, status }) => {
              const monthSyllabus = role.syllabus.filter(item => item.month === month)
              
              return (
                <Card 
                  key={month} 
                  className={
                    status === 'skip' 
                      ? 'border-green-500/40 bg-green-500/10 backdrop-blur-sm hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-200' 
                      : status === 'focus' 
                      ? 'border-primary/50 bg-primary/10 backdrop-blur-sm hover:border-primary/60 hover:-translate-y-0.5 transition-all duration-200' 
                      : 'border-border/50 bg-background/30 backdrop-blur-sm hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-200'
                  }
                  style={{ animationDelay: `${month * 60}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Month {month}</CardTitle>
                      {status === 'skip' && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/40">
                          Can Skip
                        </Badge>
                      )}
                      {status === 'focus' && (
                        <Badge className="bg-primary/30 text-primary border border-primary/40">
                          Focus Here
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {monthSyllabus.length} topics
                    </div>
                    {status === 'skip' && (
                      <div className="text-sm text-green-400">
                        You already have the skills covered in this month
                      </div>
                    )}
                    {status === 'focus' && (
                      <div className="text-sm text-primary">
                        Spend extra time mastering these concepts
                      </div>
                    )}
                    {status === 'normal' && (
                      <div className="text-sm text-muted-foreground">
                        Follow the standard timeline
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-500/40 bg-green-500/10 backdrop-blur-sm hover:border-primary/50 transition-colors animate-in fade-in" style={{ animationDelay: '130ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="text-green-400" weight="fill" />
              Proficient Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillsByLevel.proficient.length > 0 ? (
              <ul className="space-y-2">
                {skillsByLevel.proficient.map(skill => (
                  <li key={skill} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-400" weight="fill" />
                    <Badge variant="secondary" className="border-green-500/30 bg-green-500/20 text-green-300 hover:border-primary/50 transition-colors">{skill}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No proficient skills yet</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-yellow-500/40 bg-yellow-500/10 backdrop-blur-sm hover:border-primary/50 transition-colors animate-in fade-in" style={{ animationDelay: '170ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Warning className="text-yellow-400" weight="fill" />
              Partial Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillsByLevel.partial.length > 0 ? (
              <ul className="space-y-2">
                {skillsByLevel.partial.map(skill => (
                  <li key={skill} className="flex items-center gap-2 text-sm">
                    <Warning size={16} className="text-yellow-400" weight="fill" />
                    <Badge variant="secondary" className="border-yellow-500/30 bg-yellow-500/20 text-yellow-300 hover:border-primary/50 transition-colors">{skill}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No partial skills</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-500/40 bg-orange-500/10 backdrop-blur-sm hover:border-primary/50 transition-colors animate-in fade-in" style={{ animationDelay: '210ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="text-orange-400" weight="duotone" />
              Need to Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillsByLevel.none.length > 0 ? (
              <ul className="space-y-2">
                {skillsByLevel.none.map(skill => (
                  <li key={skill} className="flex items-center gap-2 text-sm">
                    <ArrowRight size={16} className="text-orange-400" weight="duotone" />
                    <Badge variant="secondary" className="border-orange-500/30 bg-orange-500/20 text-orange-300 hover:border-primary/50 transition-colors">{skill}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">All skills covered!</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
