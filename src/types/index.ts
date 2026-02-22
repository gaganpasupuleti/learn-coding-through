export type Category = 'web-app' | 'api' | 'data-pipeline' | 'cli-tool' | 'mobile-app' | 'game'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type ProjectStatus = 'not-started' | 'in-progress' | 'completed'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface TechStack {
  name: string
  color: string
}

export interface CodeFile {
  name: string
  content: string
  type: 'html' | 'css' | 'js' | 'tsx' | 'ts' | 'json' | 'py'
}

export interface ProjectTemplate {
  name: string
  description: string
  files: CodeFile[]
  packages?: string[]
  language: string
}

export interface ProjectStep {
  id: string
  stepNumber: number
  title: string
  contentMd: string
  deliverableDescription: string
  template?: ProjectTemplate
}

export interface Project {
  id: string
  title: string
  slug: string
  description: string
  category: Category
  difficulty: Difficulty
  estimatedHours: number
  techStack: TechStack[]
  learningOutcomes: string[]
  prerequisites: string[]
  isActive: boolean
  steps: ProjectStep[]
  featured?: boolean
}

export interface UserStepProgress {
  stepId: string
  completedAt: Date
  submittedCode?: string
}

export interface UserProject {
  projectId: string
  status: ProjectStatus
  startedAt: Date
  completedAt?: Date
  stepProgress: UserStepProgress[]
}

export interface ProjectSeries {
  id: string
  title: string
  description: string
  projectIds: string[]
  order: number
}

export interface SeriesProgress {
  seriesId: string
  completedProjectIds: string[]
}
