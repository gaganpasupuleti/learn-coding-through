import { loadResumeData } from '@/lib/resume-storage'
import type { ResumeData } from '@/components/resume/resume-demo-data'

export interface ResumeChecklistItem {
  id: string
  label: string
  done: boolean
  weight: number
}

export interface ResumeReadinessScore {
  overall: number
  checklist: ResumeChecklistItem[]
}

function hasText(value: string | undefined | null): boolean {
  return Boolean(value?.trim())
}

function buildChecklist(data: ResumeData): ResumeChecklistItem[] {
  const personalComplete =
    hasText(data.personal.fullName) &&
    hasText(data.personal.email) &&
    hasText(data.personal.phone)

  return [
    { id: 'profile', label: 'Profile complete', done: personalComplete, weight: 20 },
    { id: 'summary', label: 'Summary written', done: hasText(data.summary), weight: 10 },
    { id: 'education', label: 'Education added', done: data.education.length > 0, weight: 15 },
    { id: 'skills', label: '3+ skills listed', done: data.skills.filter(Boolean).length >= 3, weight: 15 },
    { id: 'projects', label: 'Project added', done: data.projects.length > 0, weight: 20 },
    {
      id: 'links',
      label: 'Link added (GitHub/LinkedIn/Portfolio)',
      done:
        hasText(data.links.github) ||
        hasText(data.links.linkedin) ||
        hasText(data.links.portfolio),
      weight: 10,
    },
    {
      id: 'experience',
      label: 'Experience or certification (optional)',
      done: data.experience.length > 0 || data.certifications.length > 0,
      weight: 10,
    },
  ]
}

export function computeResumeReadinessScore(data?: ResumeData): ResumeReadinessScore {
  const resume = data ?? loadResumeData()
  const checklist = buildChecklist(resume)
  const earned = checklist.filter((item) => item.done).reduce((s, item) => s + item.weight, 0)
  const total = checklist.reduce((s, item) => s + item.weight, 0)
  const overall = total > 0 ? Math.round((earned / total) * 100) : 0

  return { overall, checklist }
}
