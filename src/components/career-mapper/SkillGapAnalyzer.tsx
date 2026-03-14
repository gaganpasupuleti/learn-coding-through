import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Gauge, Sparkle } from '@phosphor-icons/react'
import type { CareerRole, SkillAssessment } from '@/types/career'
import { useSkillAssessments } from '@/hooks/use-skill-assessments'
import { toast } from 'sonner'
import { SkillGapReport as SkillGapReportComponent } from './SkillGapReport'

interface SkillGapAnalyzerProps {
  role: CareerRole
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SkillGapAnalyzer({ role, open, onOpenChange }: SkillGapAnalyzerProps) {
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [assessments, setAssessments] = useState<SkillAssessment[]>([])
  const [showReport, setShowReport] = useState(false)
  const { calculateGapReport, saveReport, getReport } = useSkillAssessments()

  const existingReport = getReport(role.id)

  const currentSkill = role.skills[currentSkillIndex]
  const isLastSkill = currentSkillIndex === role.skills.length - 1
  const progress = ((currentSkillIndex + 1) / role.skills.length) * 100

  const handleAssessment = (level: 'none' | 'partial' | 'proficient') => {
    const newAssessment: SkillAssessment = {
      skill: currentSkill,
      level
    }

    const updatedAssessments = [...assessments, newAssessment]
    setAssessments(updatedAssessments)

    if (isLastSkill) {
      const report = calculateGapReport(role.id, role.skills, updatedAssessments)
      saveReport(report)
      setShowReport(true)
      toast.success('Skill assessment complete!')
    } else {
      setCurrentSkillIndex(prev => prev + 1)
    }
  }

  const handleReset = () => {
    setCurrentSkillIndex(0)
    setAssessments([])
    setShowReport(false)
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleStartNew = () => {
    handleReset()
  }

  if (showReport) {
    const report = getReport(role.id)
    if (!report) return null

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkle className="text-accent" weight="fill" />
              Your Skill Gap Analysis
            </DialogTitle>
            <DialogDescription>
              Based on your assessment, here's your personalized learning roadmap for {role.title}
            </DialogDescription>
          </DialogHeader>
          <SkillGapReportComponent report={report} role={role} />
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={handleStartNew}>
              Retake Assessment
            </Button>
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (existingReport && currentSkillIndex === 0 && assessments.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gauge className="text-accent" />
              Skill Gap Analyzer
            </DialogTitle>
            <DialogDescription>
              You've already completed an assessment for {role.title}. Would you like to view your existing report or start a new assessment?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleStartNew}>
              Start New Assessment
            </Button>
            <Button onClick={() => setShowReport(true)}>
              View Existing Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gauge className="text-accent" />
            Skill Gap Analyzer
          </DialogTitle>
          <DialogDescription>
            Question {currentSkillIndex + 1} of {role.skills.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            <div className="text-lg font-semibold text-foreground">
              How proficient are you with <span className="text-accent">{currentSkill}</span>?
            </div>

            <RadioGroup className="space-y-3">
              <div 
                onClick={() => handleAssessment('none')}
                className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent/5 hover:border-accent transition-colors"
              >
                <RadioGroupItem value="none" id={`none-${currentSkillIndex}`} />
                <Label htmlFor={`none-${currentSkillIndex}`} className="flex-1 cursor-pointer">
                  <div className="font-medium">Not familiar</div>
                  <div className="text-sm text-muted-foreground">
                    I haven't used this skill or need to learn it from scratch
                  </div>
                </Label>
              </div>

              <div 
                onClick={() => handleAssessment('partial')}
                className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent/5 hover:border-accent transition-colors"
              >
                <RadioGroupItem value="partial" id={`partial-${currentSkillIndex}`} />
                <Label htmlFor={`partial-${currentSkillIndex}`} className="flex-1 cursor-pointer">
                  <div className="font-medium">Some experience</div>
                  <div className="text-sm text-muted-foreground">
                    I've used this skill before but need more practice
                  </div>
                </Label>
              </div>

              <div 
                onClick={() => handleAssessment('proficient')}
                className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent/5 hover:border-accent transition-colors"
              >
                <RadioGroupItem value="proficient" id={`proficient-${currentSkillIndex}`} />
                <Label htmlFor={`proficient-${currentSkillIndex}`} className="flex-1 cursor-pointer">
                  <div className="font-medium">Proficient</div>
                  <div className="text-sm text-muted-foreground">
                    I'm comfortable using this skill in real projects
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {currentSkillIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setCurrentSkillIndex(prev => prev - 1)
                setAssessments(prev => prev.slice(0, -1))
              }}
              className="w-full"
            >
              Back to Previous Question
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
