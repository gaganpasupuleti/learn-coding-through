import type { CareerRole, SyllabusItem } from '@/types/career'

/**
 * Career Role Definition Structure
 * Extends CareerRole with additional architecture fields for building personalized learning paths
 */
export interface CareerRoleData extends CareerRole {
  focus: string
  roadmapNodes: string[]
  requiredProjects: string[]
}

/**
 * Roadmap Nodes - Core learning components from the curriculum
 * These represent discrete learning concepts that form the foundation
 */
const ROADMAP_NODES = {
  // Foundation
  internet: 'Understanding the Internet',
  html: 'HTML Fundamentals',
  css: 'CSS & Styling',
  jsBasics: 'JavaScript Basics',
  dom: 'DOM Manipulation',
  
  // Frontend
  responsive: 'Responsive Design',
  accessibility: 'Web Accessibility',
  performance: 'Frontend Performance',
  react: 'React Framework',
  state: 'State Management',
  
  // Backend
  node: 'Node.js Runtime',
  express: 'Express.js',
  databases: 'Database Design',
  sql: 'SQL & Queries',
  apis: 'REST API Design',
  
  // DevOps & Cloud
  docker: 'Docker & Containers',
  kubernetes: 'Kubernetes Orchestration',
  cicd: 'CI/CD Pipelines',
  aws: 'AWS Cloud Platform',
  monitoring: 'System Monitoring',
  
  // Security
  authentication: 'Authentication & Authorization',
  encryption: 'Encryption & Cryptography',
  owasp: 'OWASP Security',
  testing: 'Security Testing',
  
  // Data & AI
  python: 'Python Programming',
  numpy: 'NumPy & Pandas',
  visualization: 'Data Visualization',
  ml: 'Machine Learning Basics',
  nlp: 'NLP & LLMs',
  
  // Advanced
  microservices: 'Microservices Architecture',
  distributed: 'Distributed Systems',
  design: 'System Design',
  scaling: 'Scaling & Optimization',
  testing_advanced: 'Advanced Testing',
}

/**
 * Helper function to create a syllabus from roadmap nodes and required projects
 */
function createSyllabus(
  nodes: (keyof typeof ROADMAP_NODES)[],
  projectMilestones: { month: number; project: string }[]
): SyllabusItem[] {
  const syllabus: SyllabusItem[] = []
  let sortOrder = 0

  // Distribute nodes across 4 months
  const nodesPerMonth = Math.ceil(nodes.length / 4)

  nodes.forEach((nodeKey, idx) => {
    const month = Math.min(Math.floor(idx / nodesPerMonth) + 1, 4) as 1 | 2 | 3 | 4
    const week = (idx % nodesPerMonth) + 1

    syllabus.push({
      id: `${nodeKey}-item`,
      month,
      week,
      title: ROADMAP_NODES[nodeKey],
      description: `Master ${ROADMAP_NODES[nodeKey]}`,
      type: 'topic',
      sortOrder: sortOrder++,
    })
  })

  // Add project milestones
  projectMilestones.forEach((milestone, idx) => {
    syllabus.push({
      id: `project-${milestone.project}-${idx}`,
      month: milestone.month as 1 | 2 | 3 | 4,
      week: 4,
      title: `Build: ${milestone.project}`,
      description: `Complete the ${milestone.project} project`,
      type: 'deliverable',
      sortOrder: sortOrder++,
      projectId: milestone.project,
    })
  })

  return syllabus.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month
    return a.sortOrder - b.sortOrder
  })
}

/**
 * CAREER_ROLES - 10 distinct professional career paths
 * Each role defines a unique learning journey tailored to career goals
 */
export const CAREER_ROLES: CareerRoleData[] = [
  {
    id: 'backend-architect',
    title: 'Backend Architect',
    slug: 'backend-architect',
    focus: 'Efficiency & Logic',
    description: 'Build scalable server-side systems with robust architecture and database design',
    domain: 'Web',
    difficulty: 'Advanced',
    salaryRangeMin: 120000,
    salaryRangeMax: 200000,
    demandLevel: 'High',
    icon: '⚙️',
    skills: ['Node.js', 'Express', 'SQL', 'API Design', 'Database Architecture', 'Microservices'],
    roadmapNodes: ['node', 'express', 'databases', 'sql', 'apis', 'microservices', 'design', 'testing'],
    requiredProjects: ['calculator', 'resume-builder'],
    sortOrder: 1,
    isActive: true,
    syllabus: createSyllabus(
      ['jsBasics', 'node', 'express', 'databases', 'sql', 'apis', 'microservices', 'design'],
      [
        { month: 1, project: 'digital-clock' },
        { month: 2, project: 'calculator' },
        { month: 3, project: 'resume-builder' },
      ]
    ),
  },

  {
    id: 'data-analyst',
    title: 'Data Analyst',
    slug: 'data-analyst',
    focus: 'Insights & Patterns',
    description: 'Transform raw data into actionable insights using analytics and visualization',
    domain: 'Data',
    difficulty: 'Intermediate',
    salaryRangeMin: 90000,
    salaryRangeMax: 160000,
    demandLevel: 'High',
    icon: '📊',
    skills: ['Python', 'SQL', 'Data Visualization', 'Statistical Analysis', 'Tableau', 'Excel'],
    roadmapNodes: ['python', 'sql', 'numpy', 'visualization', 'databases', 'ml'],
    requiredProjects: ['calculator', 'temperature-converter'],
    sortOrder: 2,
    isActive: true,
    syllabus: createSyllabus(
      ['python', 'sql', 'numpy', 'databases', 'visualization', 'ml'],
      [
        { month: 1, project: 'calculator' },
        { month: 2, project: 'temperature-converter' },
      ]
    ),
  },

  {
    id: 'frontend-specialist',
    title: 'Frontend Specialist',
    slug: 'frontend-specialist',
    focus: 'User Experience',
    description: 'Create beautiful, responsive, and interactive user interfaces',
    domain: 'Web',
    difficulty: 'Intermediate',
    salaryRangeMin: 100000,
    salaryRangeMax: 180000,
    demandLevel: 'High',
    icon: '🎨',
    skills: ['React', 'TypeScript', 'CSS', 'HTML', 'Responsive Design', 'Web Performance'],
    roadmapNodes: ['html', 'css', 'jsBasics', 'dom', 'responsive', 'react', 'state', 'accessibility'],
    requiredProjects: ['digital-clock', 'calculator'],
    sortOrder: 3,
    isActive: true,
    syllabus: createSyllabus(
      ['html', 'css', 'jsBasics', 'dom', 'responsive', 'react', 'state', 'accessibility'],
      [
        { month: 1, project: 'digital-clock' },
        { month: 2, project: 'calculator' },
        { month: 3, project: 'temperature-converter' },
      ]
    ),
  },

  {
    id: 'automation-engineer',
    title: 'Automation Engineer',
    slug: 'automation-engineer',
    focus: 'Efficiency & Reliability',
    description: 'Automate testing and deployment processes with robust CI/CD pipelines',
    domain: 'DevOps',
    difficulty: 'Advanced',
    salaryRangeMin: 110000,
    salaryRangeMax: 190000,
    demandLevel: 'Growing',
    icon: '🤖',
    skills: ['CI/CD', 'Docker', 'Kubernetes', 'Python', 'Scripting', 'Test Automation'],
    roadmapNodes: ['docker', 'kubernetes', 'cicd', 'testing', 'python', 'node', 'monitoring'],
    requiredProjects: ['calculator', 'resume-builder'],
    sortOrder: 4,
    isActive: true,
    syllabus: createSyllabus(
      ['python', 'node', 'docker', 'kubernetes', 'cicd', 'testing', 'monitoring'],
      [
        { month: 1, project: 'digital-clock' },
        { month: 2, project: 'calculator' },
      ]
    ),
  },

  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    slug: 'cybersecurity-analyst',
    focus: 'Protection & Compliance',
    description: 'Identify vulnerabilities and implement security measures across systems',
    domain: 'Security',
    difficulty: 'Advanced',
    salaryRangeMin: 115000,
    salaryRangeMax: 195000,
    demandLevel: 'High',
    icon: '🔐',
    skills: ['Network Security', 'Cryptography', 'Penetration Testing', 'OWASP', 'Compliance', 'Incident Response'],
    roadmapNodes: ['authentication', 'encryption', 'owasp', 'testing', 'sql', 'python', 'monitoring'],
    requiredProjects: ['calculator', 'temperature-converter'],
    sortOrder: 5,
    isActive: true,
    syllabus: createSyllabus(
      ['authentication', 'encryption', 'owasp', 'testing', 'python', 'sql'],
      [
        { month: 2, project: 'calculator' },
        { month: 3, project: 'temperature-converter' },
      ]
    ),
  },

  {
    id: 'ai-prompt-engineer',
    title: 'AI/Prompt Engineer',
    slug: 'ai-prompt-engineer',
    focus: 'Innovation & Adaptation',
    description: 'Design and optimize AI prompts and leverage LLMs for intelligent solutions',
    domain: 'AI',
    difficulty: 'Intermediate',
    salaryRangeMin: 100000,
    salaryRangeMax: 180000,
    demandLevel: 'Growing',
    icon: '🧠',
    skills: ['Prompt Engineering', 'LLMs', 'Python', 'NLP', 'API Integration', 'Data Processing'],
    roadmapNodes: ['python', 'nlp', 'ml', 'apis', 'numpy', 'node', 'jsBasics'],
    requiredProjects: ['resume-builder', 'digital-clock'],
    sortOrder: 6,
    isActive: true,
    syllabus: createSyllabus(
      ['jsBasics', 'python', 'numpy', 'nlp', 'ml', 'apis'],
      [
        { month: 1, project: 'digital-clock' },
        { month: 3, project: 'resume-builder' },
      ]
    ),
  },

  {
    id: 'cloud-devops-engineer',
    title: 'Cloud DevOps Engineer',
    slug: 'cloud-devops-engineer',
    focus: 'Infrastructure & Reliability',
    description: 'Manage cloud infrastructure and ensure seamless deployment at scale',
    domain: 'Cloud',
    difficulty: 'Advanced',
    salaryRangeMin: 125000,
    salaryRangeMax: 205000,
    demandLevel: 'High',
    icon: '☁️',
    skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Infrastructure as Code', 'System Design'],
    roadmapNodes: ['aws', 'docker', 'kubernetes', 'cicd', 'monitoring', 'design', 'scaling'],
    requiredProjects: ['calculator', 'resume-builder'],
    sortOrder: 7,
    isActive: true,
    syllabus: createSyllabus(
      ['docker', 'kubernetes', 'aws', 'cicd', 'monitoring', 'design', 'scaling'],
      [
        { month: 1, project: 'digital-clock' },
        { month: 2, project: 'calculator' },
        { month: 3, project: 'resume-builder' },
      ]
    ),
  },

  {
    id: 'full-stack-developer',
    title: 'Full-Stack Developer',
    slug: 'full-stack-developer',
    focus: 'End-to-End Solutions',
    description: 'Build complete web applications from database to user interface',
    domain: 'Web',
    difficulty: 'Intermediate',
    salaryRangeMin: 105000,
    salaryRangeMax: 185000,
    demandLevel: 'High',
    icon: '🌐',
    skills: ['React', 'Node.js', 'Express', 'SQL', 'REST APIs', 'Full-Stack Architecture'],
    roadmapNodes: ['html', 'css', 'jsBasics', 'react', 'node', 'express', 'databases', 'apis'],
    requiredProjects: ['digital-clock', 'calculator', 'temperature-converter'],
    sortOrder: 8,
    isActive: true,
    syllabus: createSyllabus(
      ['html', 'css', 'jsBasics', 'react', 'node', 'express', 'databases', 'apis'],
      [
        { month: 1, project: 'digital-clock' },
        { month: 2, project: 'calculator' },
        { month: 3, project: 'temperature-converter' },
        { month: 4, project: 'resume-builder' },
      ]
    ),
  },

  {
    id: 'game-developer',
    title: 'Game Developer',
    slug: 'game-developer',
    focus: 'Interactive Experience',
    description: 'Create engaging games with graphics, physics, and interactive gameplay',
    domain: 'Mobile',
    difficulty: 'Advanced',
    salaryRangeMin: 95000,
    salaryRangeMax: 175000,
    demandLevel: 'Growing',
    icon: '🎮',
    skills: ['Game Engines', 'Graphics Programming', 'Physics', 'JavaScript/C#', 'Game Design', 'Optimization'],
    roadmapNodes: ['jsBasics', 'dom', 'performance', 'state', 'design', 'scaling', 'testing_advanced'],
    requiredProjects: ['digital-clock', 'calculator'],
    sortOrder: 9,
    isActive: true,
    syllabus: createSyllabus(
      ['jsBasics', 'dom', 'state', 'performance', 'design', 'scaling'],
      [
        { month: 1, project: 'digital-clock' },
        { month: 2, project: 'calculator' },
      ]
    ),
  },

  {
    id: 'product-manager',
    title: 'Product Manager',
    slug: 'product-manager',
    focus: 'Vision & Strategy',
    description: 'Guide product strategy and lead cross-functional teams to deliver impact',
    domain: 'Web',
    difficulty: 'Intermediate',
    salaryRangeMin: 110000,
    salaryRangeMax: 200000,
    demandLevel: 'High',
    icon: '📱',
    skills: ['Product Strategy', 'User Research', 'Data Analysis', 'Technical Fundamentals', 'Leadership', 'Analytics'],
    roadmapNodes: ['jsBasics', 'apis', 'databases', 'design', 'sql', 'testing'],
    requiredProjects: ['resume-builder', 'calculator'],
    sortOrder: 10,
    isActive: true,
    syllabus: createSyllabus(
      ['jsBasics', 'databases', 'apis', 'design', 'testing'],
      [
        { month: 1, project: 'calculator' },
        { month: 2, project: 'resume-builder' },
      ]
    ),
  },
]

/**
 * Utility: Get a career role by ID
 */
export function getCareerRoleById(id: string): CareerRoleData | undefined {
  return CAREER_ROLES.find(role => role.id === id)
}

/**
 * Utility: Get all active career roles
 */
export function getActiveCareerRoles(): CareerRoleData[] {
  return CAREER_ROLES.filter(role => role.isActive)
}

/**
 * Utility: Get roles by domain
 */
export function getRolesByDomain(domain: string): CareerRoleData[] {
  return CAREER_ROLES.filter(role => role.domain === domain)
}

/**
 * Type export for use in UI components
 */
export type { CareerRoleData as CareerRole }
