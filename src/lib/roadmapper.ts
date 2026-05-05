export interface RoleStage {
  id: number
  title: string
  description: string
  topics: string[]
  quizPassThreshold: number
  exerciseCompletionThreshold: number
}

export interface CareerRole {
  id: string
  title: string
  skillsRequired: string[]
  salaryRange: string
  companiesHiring: string[]
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: string
  stages: RoleStage[]
}

const commonStages: RoleStage[] = [
  {
    id: 1,
    title: 'Foundation Stage',
    description: 'Build fundamentals and start guided coding exercises.',
    topics: ['Core Concepts', 'Tooling Setup', 'Problem Solving Basics'],
    quizPassThreshold: 70,
    exerciseCompletionThreshold: 80,
  },
  {
    id: 2,
    title: 'Applied Practice Stage',
    description: 'Deepen understanding through practical coding and mini projects.',
    topics: ['Hands-on Tasks', 'Debugging', 'Best Practices'],
    quizPassThreshold: 70,
    exerciseCompletionThreshold: 80,
  },
  {
    id: 3,
    title: 'Production-Ready Stage',
    description: 'Solve real-world scenarios and complete job-oriented assessments.',
    topics: ['System Thinking', 'Project Readiness', 'Role-specific Scenarios'],
    quizPassThreshold: 70,
    exerciseCompletionThreshold: 80,
  },
  {
    id: 4,
    title: 'Selection Prep Stage',
    description: 'Capstone and interview simulation.',
    topics: ['Capstone Project', 'Interview Simulation'],
    quizPassThreshold: 70,
    exerciseCompletionThreshold: 80,
  },
]

export const careerRoles: CareerRole[] = [
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    skillsRequired: ['SQL', 'Python', 'Excel', 'Power BI/Tableau', 'Statistics'],
    salaryRange: '$55,000 - $110,000',
    companiesHiring: ['Accenture', 'Deloitte', 'Amazon', 'TCS'],
    difficultyLevel: 'beginner',
    estimatedDuration: '5-6 months',
    stages: commonStages,
  },
  {
    id: 'python-backend-developer',
    title: 'Python Backend Developer',
    skillsRequired: ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs', 'Testing'],
    salaryRange: '$70,000 - $140,000',
    companiesHiring: ['PayPal', 'Swiggy', 'Razorpay', 'Zoho'],
    difficultyLevel: 'intermediate',
    estimatedDuration: '6-7 months',
    stages: commonStages,
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    skillsRequired: ['SQL', 'Python', 'Spark', 'Airflow', 'Data Warehousing'],
    salaryRange: '$85,000 - $165,000',
    companiesHiring: ['Google', 'Uber', 'Flipkart', 'Walmart'],
    difficultyLevel: 'intermediate',
    estimatedDuration: '7-8 months',
    stages: commonStages,
  },
  {
    id: 'ml-engineer',
    title: 'ML Engineer',
    skillsRequired: ['Python', 'Machine Learning', 'MLOps', 'TensorFlow/PyTorch', 'Feature Engineering'],
    salaryRange: '$95,000 - $190,000',
    companiesHiring: ['NVIDIA', 'Microsoft', 'OpenAI', 'Infosys'],
    difficultyLevel: 'advanced',
    estimatedDuration: '8-9 months',
    stages: commonStages,
  },
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    skillsRequired: ['React', 'TypeScript', 'Node.js', 'SQL/NoSQL', 'System Design'],
    salaryRange: '$75,000 - $155,000',
    companiesHiring: ['Meta', 'Atlassian', 'Freshworks', 'CRED'],
    difficultyLevel: 'intermediate',
    estimatedDuration: '6-8 months',
    stages: commonStages,
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    skillsRequired: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud Platforms'],
    salaryRange: '$90,000 - $175,000',
    companiesHiring: ['Adobe', 'IBM', 'Oracle', 'ServiceNow'],
    difficultyLevel: 'advanced',
    estimatedDuration: '7-9 months',
    stages: commonStages,
  },
]
