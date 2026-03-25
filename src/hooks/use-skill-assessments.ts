import { useKV } from '@github/spark/hooks'
import type { SkillGapReport, SkillAssessment } from '@/types/career'

export function useSkillAssessments() {
  const [skillReports, setSkillReports] = useKV<Record<string, SkillGapReport>>('skill-gap-reports', {})

  const getReport = (roleId: string) => skillReports?.[roleId]

  const saveReport = (report: SkillGapReport) => {
    setSkillReports(currentReports => ({
      ...(currentReports || {}),
      [report.roleId]: report
    }))
  }

  const deleteReport = (roleId: string) => {
    setSkillReports(currentReports => {
      if (!currentReports) return {}
      const next = { ...currentReports }
      delete next[roleId]
      return next
    })
  }

  const calculateGapReport = (
    roleId: string,
    skills: string[],
    assessments: SkillAssessment[]
  ): SkillGapReport => {
    const assessmentMap = new Map(
      assessments.map(a => [a.skill.toLowerCase(), a.level])
    )

    let proficientCount = 0
    let partialCount = 0

    skills.forEach(skill => {
      const level = assessmentMap.get(skill.toLowerCase())
      if (level === 'proficient') proficientCount++
      else if (level === 'partial') partialCount++
    })

    const overallReadiness = Math.round(
      ((proficientCount + partialCount * 0.5) / skills.length) * 100
    )

    const canSkipMonths: number[] = []
    const focusMonths: number[] = []

    if (overallReadiness >= 75) {
      canSkipMonths.push(1)
    } else if (overallReadiness < 40) {
      focusMonths.push(1, 2)
    }

    if (overallReadiness >= 50 && overallReadiness < 75) {
      canSkipMonths.push(1)
      focusMonths.push(2)
    }

    if (overallReadiness < 25) {
      focusMonths.push(1, 2, 3)
    }

    if (focusMonths.length === 0 && canSkipMonths.length === 0) {
      focusMonths.push(3, 4)
    }

    return {
      roleId,
      assessments,
      canSkipMonths,
      focusMonths,
      overallReadiness
    }
  }

  return {
    skillReports: skillReports || {},
    getReport,
    saveReport,
    deleteReport,
    calculateGapReport
  }
}
