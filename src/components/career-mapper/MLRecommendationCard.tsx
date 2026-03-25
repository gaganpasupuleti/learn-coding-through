import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Brain, Sparkle, Target, TrendUp } from '@phosphor-icons/react'
import { MLJobRecommendation, MLCareerRecommendation } from '@/hooks/use-ml-recommendations'
import { Job, CareerRole } from '@/types/career'
import { motion } from 'framer-motion'

interface MLJobRecommendationCardProps {
  recommendation: MLJobRecommendation
  job: Job
  onView: () => void
  rank: number
}

export function MLJobRecommendationCard({ recommendation, job, onView, rank }: MLJobRecommendationCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent'
    if (score >= 60) return 'text-primary'
    return 'text-muted-foreground'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence'
    if (confidence >= 60) return 'Medium Confidence'
    return 'Low Confidence'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className="animate-in fade-in duration-700"
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={rank === 0 ? 'default' : 'secondary'} className="border-border/50">
                  {rank === 0 ? 'Top Match' : `#${rank + 1}`}
                </Badge>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary animate-pulse [animation-duration:3s]">
                  <Sparkle className="mr-1 h-3 w-3" weight="fill" />
                  {getConfidenceLabel(recommendation.confidenceLevel)}
                </Badge>
              </div>
              <CardTitle className="text-xl tracking-tight">{job.title}</CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                {job.company} • {job.location}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(recommendation.score)}`}>
                {recommendation.score}%
              </div>
              <div className="text-xs text-muted-foreground">Match Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Career Fit</span>
              <span className="font-medium">{recommendation.careerFit}%</span>
            </div>
            <Progress value={recommendation.careerFit} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Growth Potential</span>
              <span className="font-medium">{recommendation.growthPotential}%</span>
            </div>
            <Progress value={recommendation.growthPotential} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Brain weight="duotone" className="text-primary" />
              <span>Why This Job?</span>
            </div>
            <ul className="space-y-1">
              {recommendation.reasoning.slice(0, 3).map((reason, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {recommendation.skillMatches.filter(s => s.relevance === 100).length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Matching Skills</div>
              <div className="flex flex-wrap gap-2">
                {recommendation.skillMatches
                  .filter(s => s.relevance === 100)
                  .slice(0, 5)
                  .map((skillMatch, index) => (
                    <Badge key={index} variant="secondary" className="border-border/50 bg-secondary/50 text-foreground hover:border-primary/50 transition-colors">
                      {skillMatch.skill}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          <Button onClick={onView} className="w-full">
            View Job Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface MLCareerRecommendationCardProps {
  recommendation: MLCareerRecommendation
  role: CareerRole
  onView: () => void
  rank: number
}

export function MLCareerRecommendationCard({ recommendation, role, onView, rank }: MLCareerRecommendationCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-accent'
    if (score >= 50) return 'text-primary'
    return 'text-muted-foreground'
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className="animate-in fade-in duration-700"
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={rank === 0 ? 'default' : 'secondary'} className="border-border/50">
                  {rank === 0 ? 'Best Fit' : `#${rank + 1}`}
                </Badge>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary animate-pulse [animation-duration:3s]">
                  <Sparkle className="mr-1 h-3 w-3" weight="fill" />
                  {role.domain}
                </Badge>
              </div>
              <CardTitle className="text-xl tracking-tight">{role.title}</CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                {role.difficulty} • ${role.salaryRangeMin.toLocaleString()} - ${role.salaryRangeMax.toLocaleString()}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(recommendation.score)}`}>
                {recommendation.score}%
              </div>
              <div className="text-xs text-muted-foreground">Readiness</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-background/30 p-3">
            <div className="space-y-1 rounded-lg border border-border/40 bg-card/40 p-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Target weight="duotone" className="text-primary" />
                <span>Time to Ready</span>
              </div>
              <div className="text-lg font-bold">{recommendation.timeToReady} month{recommendation.timeToReady > 1 ? 's' : ''}</div>
            </div>
            <div className="space-y-1 rounded-lg border border-border/40 bg-card/40 p-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendUp weight="duotone" className="text-primary" />
                <span>Success Rate</span>
              </div>
              <div className="text-lg font-bold">{recommendation.successProbability}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Brain weight="duotone" className="text-primary" />
              <span>AI Insights</span>
            </div>
            <ul className="space-y-1">
              {recommendation.reasoning.map((reason, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {recommendation.skillGaps.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Skills to Learn</div>
              <div className="flex flex-wrap gap-2">
                {recommendation.skillGaps.slice(0, 6).map((gap, index) => (
                  <Badge key={index} variant={getPriorityColor(gap.priority)} className="border-border/50 hover:border-primary/50 transition-colors">
                    {gap.skill}
                  </Badge>
                ))}
                {recommendation.skillGaps.length > 6 && (
                  <Badge variant="outline">+{recommendation.skillGaps.length - 6} more</Badge>
                )}
              </div>
            </div>
          )}

          <Button onClick={onView} className="w-full">
            Explore Career Path
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
