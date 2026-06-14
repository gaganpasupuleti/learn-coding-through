export interface ResumePersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
}

export interface ResumeEducationEntry {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  details: string
}

export interface ResumeProjectEntry {
  id: string
  name: string
  description: string
  tech: string
  link: string
}

export interface ResumeExperienceEntry {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  bullets: string[]
}

export interface ResumeCertificationEntry {
  id: string
  name: string
  issuer: string
  date: string
}

export interface ResumeLinks {
  github: string
  linkedin: string
  portfolio: string
}

export interface ResumeData {
  personal: ResumePersonalInfo
  summary: string
  education: ResumeEducationEntry[]
  skills: string[]
  projects: ResumeProjectEntry[]
  experience: ResumeExperienceEntry[]
  certifications: ResumeCertificationEntry[]
  achievements: string[]
  links: ResumeLinks
}

export const SAMPLE_RESUME: ResumeData = {
  personal: {
    fullName: 'Alex Student',
    email: 'alex@example.com',
    phone: '+91 98765 43210',
    location: 'Hyderabad, India',
  },
  summary:
    'Motivated junior developer with hands-on experience in Python, SQL, and full-stack project work through CodeQuest. Seeking an internship where I can contribute to data-driven products while continuing to grow engineering fundamentals.',
  education: [
    {
      id: 'edu-1',
      school: 'CodeQuest Career Program',
      degree: 'Professional Certificate',
      field: 'Full Stack Development',
      startDate: '2025-01',
      endDate: '2025-06',
      details: 'Capstone projects in Python, SQL, and React.',
    },
  ],
  skills: ['Python', 'SQL', 'JavaScript', 'React', 'Git', 'REST APIs'],
  projects: [
    {
      id: 'proj-1',
      name: 'Inventory Dashboard',
      description: 'Built a CRUD dashboard with filtered reports and export-ready SQL queries.',
      tech: 'Python, FastAPI, PostgreSQL',
      link: 'https://github.com/example/inventory-dashboard',
    },
  ],
  experience: [],
  certifications: [],
  achievements: ['Completed 4-month CodeQuest syllabus', 'SQL practice: 15+ questions passed'],
  links: {
    github: 'https://github.com/example',
    linkedin: 'https://linkedin.com/in/example',
    portfolio: 'https://example.dev',
  },
}

export function createEmptyResume(personalDefaults?: Partial<ResumePersonalInfo>): ResumeData {
  return {
    personal: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      ...personalDefaults,
    },
    summary: '',
    education: [],
    skills: [],
    projects: [],
    experience: [],
    certifications: [],
    achievements: [],
    links: { github: '', linkedin: '', portfolio: '' },
  }
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
