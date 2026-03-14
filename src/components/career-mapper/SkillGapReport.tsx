import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Warning, ArrowRight } from '@phosphor-icons/react'
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
    <div className="space-y-6">
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-2xl">Overall Readiness</CardTitle>
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
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle weight="fill" />
                <span>{skillsByLevel.proficient.length} Proficient</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-600">
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

      <Card>
        <CardHeader>
          <CardTitle>Your Personalized Roadmap</CardTitle>
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
                      ? 'border-green-200 bg-green-50/50' 
                      : status === 'focus' 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border'
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Month {month}</CardTitle>
                      {status === 'skip' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          Can Skip
                        </Badge>
                      )}
                      {status === 'focus' && (
                        <Badge className="bg-accent text-accent-foreground">
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
                      <div className="text-sm text-green-700">
                        You already have the skills covered in this month
                      </div>
                    )}
                    {status === 'focus' && (
                      <div className="text-sm text-accent-foreground">
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
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="text-green-600" weight="fill" />
              Proficient Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillsByLevel.proficient.length > 0 ? (
              <ul className="space-y-2">
                {skillsByLevel.proficient.map(skill => (
                  <li key={skill} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-600" weight="fill" />
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No proficient skills yet</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Warning className="text-yellow-600" weight="fill" />
              Partial Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillsByLevel.partial.length > 0 ? (
              <ul className="space-y-2">
                {skillsByLevel.partial.map(skill => (
                  <li key={skill} className="flex items-center gap-2 text-sm">
                    <Warning size={16} className="text-yellow-600" weight="fill" />
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No partial skills</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="text-orange-600" />
              Need to Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillsByLevel.none.length > 0 ? (
              <ul className="space-y-2">
                {skillsByLevel.none.map(skill => (
                  <li key={skill} className="flex items-center gap-2 text-sm">
                    <ArrowRight size={16} className="text-orange-600" />
                    {skill}
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
