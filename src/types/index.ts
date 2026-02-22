// Project status
export type ProjectStatus = 'not-started' | 'in-progress' | 'completed' | 'submitted' | 'approved'

// Review status
export type ReviewStatus = 'approved' | 'changes-requested'

// Code file for templates/steps
export interface CodeFile {
  name: string
  content: string
  language: string
}

// Technology stack item
export interface TechStack {
  name: string
  icon?: string
  color?: string
}

// Project template for sandbox
export interface ProjectTemplate {
  id: string
  name: string
  description: string
  language: 'vanilla' | 'react' | 'typescript' | 'react-typescript'
  files: CodeFile[]
}

// A single step within a project
export interface ProjectStep {
  id: number
  title: string
  type: 'understanding' | 'logic' | 'code' | 'preview' | 'challenge'
  contentMd: string
  deliverableDescription: string
  template?: CodeFile[]
  content?: {
    description?: string
    points?: string[]
    code?: string
    language?: string
    challenge?: string
    hint?: string
  }
}

// Full project definition
export interface Project {
  id: string
  title: string
  description: string
  shortDescription: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  category?: 'web-app' | 'api' | 'cli-tool' | 'data-pipeline' | 'mobile-app'
  tags?: string[]
  techStack?: TechStack[]
  seriesId?: string
  steps: ProjectStep[]
}

// User's progress on a single step
export interface UserStepProgress {
  stepId: number
  completed: boolean
  notesMd: string
  attachments: string[]
  completedAt?: string
}

// User's progress on an entire project
export interface UserProject {
  projectId: string
  userId: string
  status: ProjectStatus
  startedAt: string
  submittedAt?: string
  progress: UserStepProgress[]
  overallProgress: number
}

// Peer/mentor review of a submitted project
export interface Review {
  id: string
  projectId: string
  userId: string
  reviewerId: string
  status: ReviewStatus
  feedback: string
  createdAt: string
}

// Platform user
export interface User {
  id: string
  username: string
  email: string
  avatarUrl?: string
  role?: 'student' | 'mentor' | 'admin'
  joinedAt?: string
}

// Leaderboard entry
export interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl?: string
  points: number
  rank: number
  completedProjects: number
  streak?: number
}

// Filter options for project listings
export interface FilterOptions {
  difficulty?: string[]
  category?: string[]
  tags?: string[]
  status?: string[]
  seriesId?: string
}

// A curated learning path / series of projects
export interface ProjectSeries {
  id: string
  title: string
  description: string
  icon: string
  color: string
  projectIds: string[]
  totalProjects: number
  estimatedHours: number
  prerequisites: string[]
  learningPath: string[]
}

// User's progress through a series
export interface SeriesProgress {
  seriesId: string
  userId: string
  completedProjectIds: string[]
  unlockedProjectIds: string[]
  currentLevel: number
  overallProgress: number
}
