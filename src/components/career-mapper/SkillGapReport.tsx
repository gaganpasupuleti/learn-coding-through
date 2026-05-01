import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Brain, CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
import type { SkillGapReport as SkillGapReportType, CareerRole } from '@/types/career'
import { useMemo } from 'react'
import type { NodeSkillGap, CareerRecommendation } from '@/lib/node-mastery-tracker'

interface SkillGapReportProps {
  report: SkillGapReportType
  role: CareerRole
  recommendations: CareerRecommendation[]
}

export function SkillGapReport({ report, role, recommendations }: SkillGapReportProps) {
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

  const { masteredNodes, missingNodes, completionPercentage, missingProjectSuggestions } = report

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
              <div className={`text-4xl font-bold ${getReadinessColor(completionPercentage)}`}>
                {completionPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">
                {completionPercentage >= 75 ? 'You are well-prepared!' : 'Keep progressing to master more nodes.'}
              </div>
            </div>
            <div className="text-right text-sm space-y-1">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle weight="fill" />
                <span>{masteredNodes.size} Mastered</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-500">
                <Warning weight="fill" />
                <span>{missingNodes.size} Missing</span>
              </div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </CardContent>
      </Card>

      {missingProjectSuggestions.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors animate-in fade-in" style={{ animationDelay: '90ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="text-primary" weight="duotone" />
              Recommended Next Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              To master more nodes, try the following project:
            </div>
            <div className="mt-2 text-base font-semibold text-foreground">
              {missingProjectSuggestions[0].projectName}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors animate-in fade-in" style={{ animationDelay: '140ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="text-primary" weight="duotone" />
              Career Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.slice(0, 3).map(rec => (
                <div key={rec.roleId} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{rec.roleName}</div>
                    <div className="text-xs text-muted-foreground">{rec.suggestion}</div>
                  </div>
                  <Badge variant="secondary">{rec.matchScore}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
