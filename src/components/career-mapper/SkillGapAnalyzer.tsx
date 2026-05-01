import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Brain, Sparkle, Trophy, Target } from '@phosphor-icons/react'
import type { CareerRole } from '@/types/career'
import { useCareerProgress } from '@/hooks/use-career-progress'
import { toast } from 'sonner'
import { SkillGapReport as SkillGapReportComponent } from './SkillGapReport'
import {
  calculateNodeSkillGap,
  getCareerRecommendations,
  type NodeSkillGap,
  type CareerRecommendation,
} from '@/lib/node-mastery-tracker'

interface SkillGapAnalyzerProps {
  role: CareerRole
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SkillGapAnalyzer({ role, open, onOpenChange }: SkillGapAnalyzerProps) {
  const [showReport, setShowReport] = useState(false)
  const { progress } = useCareerProgress(role.id)

  // Get completed projects from syllabus
  const completedProjects = useMemo(() => {
    const items = role.syllabus.filter(i => i.type === 'deliverable' && i.projectId)
    const completed = items
      .filter(i => (progress?.completedItems?.[i.id] || false))
      .map(i => i.projectId!)
    return completed
  }, [role.syllabus, progress])

  // Calculate node skill gap
  const nodeGap = useMemo(() => {
    return calculateNodeSkillGap(role.id, completedProjects)
  }, [role.id, completedProjects])

  // Get career recommendations
  const recommendations = useMemo(() => {
    return getCareerRecommendations(completedProjects)
  }, [completedProjects])

  const handleClose = () => {
    setShowReport(false)
    onOpenChange(false)
  }

  const handleStartAnalysis = () => {
    setShowReport(true)
    toast.success('Analysis complete! Analyzing your progress...')
  }

  if (showReport && nodeGap) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in duration-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Sparkle className="text-primary" weight="fill" />
              Your Node-Based Skill Analysis
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Based on your completed projects, here's your personalized learning roadmap for {role.title}
            </DialogDescription>
          </DialogHeader>
          <SkillGapReportComponent 
            nodeGap={nodeGap} 
            role={role}
            recommendations={recommendations}
          />
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" className="border-border/60 hover:border-primary/50 transition-colors" onClick={handleClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in duration-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Brain className="text-primary" weight="fill" />
            Node-Based Skill Analysis
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Analyze your mastered nodes based on completed projects and get personalized recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 animate-in fade-in duration-700">
          {/* Summary Card */}
          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/10 to-transparent p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Completed Projects</div>
                  <div className="text-3xl font-bold text-foreground mt-1">{completedProjects.length}</div>
                </div>
                <Trophy className="text-primary" size={28} weight="duotone" />
              </div>

              {nodeGap && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nodes Mastered</span>
                      <span className="font-semibold text-foreground">{nodeGap.masteredNodes.size} / {nodeGap.requiredNodes.size}</span>
                    </div>
                    <Progress value={nodeGap.completionPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="rounded-lg bg-card/50 p-2 text-center">
                      <div className="text-2xl font-bold text-green-500">{nodeGap.masteredNodes.size}</div>
                      <div className="text-xs text-muted-foreground">Mastered</div>
                    </div>
                    <div className="rounded-lg bg-card/50 p-2 text-center">
                      <div className="text-2xl font-bold text-yellow-500">{nodeGap.missingNodes.size}</div>
                      <div className="text-xs text-muted-foreground">Missing</div>
                    </div>
                    <div className="rounded-lg bg-card/50 p-2 text-center">
                      <div className="text-2xl font-bold text-primary">{nodeGap.completionPercentage}%</div>
                      <div className="text-xs text-muted-foreground">Ready</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Next Steps */}
          {nodeGap && nodeGap.missingProjectSuggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-primary" />
                <span className="font-medium text-foreground">Recommended Next Step</span>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                <div className="text-sm text-muted-foreground">Try the next project to master more nodes:</div>
                <div className="mt-2 text-base font-semibold text-foreground">
                  {nodeGap.missingProjectSuggestions[0].projectName}
                </div>
              </div>
            </div>
          )}

          {/* Career Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground">
                Top Career Matches
              </div>
              <div className="space-y-2">
                {recommendations.slice(0, 3).map(rec => (
                  <div key={rec.roleId} className="rounded-lg border border-border/50 bg-card/50 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{rec.roleName}</div>
                      <div className="text-xs text-muted-foreground">{rec.suggestion}</div>
                    </div>
                    <Badge variant="secondary" className="ml-2">{rec.matchScore}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" className="border-border/60 hover:border-primary/50 transition-colors" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleStartAnalysis} className="bg-primary hover:bg-primary/90">
            <Sparkle className="mr-2" size={16} />
            Generate Detailed Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
