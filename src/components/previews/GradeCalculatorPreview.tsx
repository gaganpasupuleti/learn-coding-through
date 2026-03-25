import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash, Calculator } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function GradeCalculatorPreview() {
  const [scores, setScores] = useState<number[]>([85.5, 92.0, 78.5, 88.0, 95.0])
  const [newScore, setNewScore] = useState<string>('')
  const [average, setAverage] = useState<number | null>(null)
  const [letterGrade, setLetterGrade] = useState<string | null>(null)

  const calculateGrade = () => {
    if (scores.length === 0) {
      toast.error('Add at least one test score!')
      return
    }

    const sum = scores.reduce((acc, score) => acc + score, 0)
    const avg = sum / scores.length

    let grade = ''
    if (avg >= 90) grade = 'A'
    else if (avg >= 80) grade = 'B'
    else if (avg >= 70) grade = 'C'
    else if (avg >= 60) grade = 'D'
    else grade = 'F'

    setAverage(Math.round(avg * 100) / 100)
    setLetterGrade(grade)
    toast.success('Grades calculated!')
  }

  const addScore = () => {
    const score = parseFloat(newScore)
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error('Enter a valid score (0-100)')
      return
    }
    setScores([...scores, score])
    setNewScore('')
    setAverage(null)
    setLetterGrade(null)
  }

  const removeScore = (index: number) => {
    setScores(scores.filter((_, i) => i !== index))
    setAverage(null)
    setLetterGrade(null)
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-500/10 text-green-700 border-green-500/30',
      'B': 'bg-blue-500/10 text-blue-700 border-blue-500/30',
      'C': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
      'D': 'bg-orange-500/10 text-orange-700 border-orange-500/30',
      'F': 'bg-red-500/10 text-red-700 border-red-500/30'
    }
    return colors[grade] || ''
  }

  return (
    <div className="flex items-center justify-center min-h-[500px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Grade Calculator</h3>
          <p className="text-sm text-muted-foreground">Calculate your average grade and letter grade</p>
        </div>

        <div className="space-y-3">
          <Label>Test Scores</Label>
          <div className="space-y-2 max-h-[200px] overflow-auto">
            {scores.map((score, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Test {index + 1}:</span>
                <span className="text-lg font-bold flex-1">{score}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeScore(index)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              placeholder="Enter score (0-100)"
              min="0"
              max="100"
              step="0.5"
              onKeyDown={(e) => e.key === 'Enter' && addScore()}
            />
            <Button onClick={addScore} size="icon">
              <Plus size={20} />
            </Button>
          </div>
        </div>

        <Button 
          onClick={calculateGrade} 
          className="w-full"
          size="lg"
        >
          <Calculator className="mr-2" size={18} />
          Calculate Grade
        </Button>

        {average !== null && letterGrade && (
          <div className="space-y-3">
            <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Average Score</div>
              <div className="text-4xl font-bold text-primary">{average}</div>
            </div>

            <div className={`border-2 rounded-lg p-6 text-center ${getGradeColor(letterGrade)}`}>
              <div className="text-sm font-medium mb-2">Letter Grade</div>
              <div className="text-6xl font-bold">{letterGrade}</div>
              <div className="text-sm mt-2 font-medium">
                {letterGrade === 'A' && 'Outstanding! 🎉'}
                {letterGrade === 'B' && 'Great job! 👏'}
                {letterGrade === 'C' && 'Good work! 👍'}
                {letterGrade === 'D' && 'Keep trying! 💪'}
                {letterGrade === 'F' && 'Need improvement 📚'}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
