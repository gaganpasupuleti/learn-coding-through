export type Domain = 'Web' | 'Data' | 'Cloud' | 'Mobile' | 'AI' | 'Security' | 'DevOps'
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type DemandLevel = 'High' | 'Medium' | 'Growing'
export type ItemType = 'topic' | 'milestone' | 'deliverable'

export interface SyllabusItem {
  id: string
  month: 1 | 2 | 3 | 4
  week: number
  title: string
  description: string
  type: ItemType
  sortOrder: number
  quizId?: string
  projectId?: string
}

export interface CareerRole {
  id: string
  title: string
  slug: string
  description: string
  domain: Domain
  difficulty: Difficulty
  salaryRangeMin: number
  salaryRangeMax: number
  demandLevel: DemandLevel
  icon: string
  skills: string[]
  syllabus: SyllabusItem[]
  sortOrder: number
  isActive: boolean
}

export interface SkillAssessment {
  skill: string
  level: 'none' | 'partial' | 'proficient'
}

export interface SkillGapReport {
  roleId: string
  assessments: SkillAssessment[]
  canSkipMonths: number[]
  focusMonths: number[]
  overallReadiness: number
}

export interface UserProgress {
  roleId: string
  completedItems: Record<string, boolean>
  lastUpdated: string
}

export interface MilestoneNote {
  id: string
  itemId: string
  roleId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface UserData {
  progress: Record<string, UserProgress>
  skillReports: Record<string, SkillGapReport>
  notes: Record<string, MilestoneNote>
}

export type JobStatus = 'Active' | 'Closed' | 'Draft'
export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Remote'
export type ExperienceLevel = 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Lead'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: JobType
  experienceLevel: ExperienceLevel
  status: JobStatus
  salary: {
    min: number
    max: number
    currency: string
  }
  description: string
  requirements: string[]
  skills: string[]
  roleId: string
  postedDate: string
  applicationUrl: string
  remote: boolean
}

export type AlertFrequency = 'instant' | 'daily' | 'weekly'
export type MatchCriteria = 'all' | 'any' | 'minimum'

export interface JobAlert {
  id: string
  userId: string
  name: string
  enabled: boolean
  frequency: AlertFrequency
  criteria: {
    roleIds: string[]
    skills: string[]
    matchType: MatchCriteria
    minimumMatchPercentage?: number
    locations: string[]
    experienceLevels: ExperienceLevel[]
    jobTypes: JobType[]
    remote?: boolean
    salaryMin?: number
  }
  createdAt: string
  lastNotified?: string
}

export interface JobNotification {
  id: string
  alertId: string
  jobId: string
  matchScore: number
  matchedSkills: string[]
  createdAt: string
  read: boolean
  dismissed: boolean
}
