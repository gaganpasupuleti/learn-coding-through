/** Maps Book_Reports topic families → Code Quest job roles (mirrors job_role_seed.py). */
export const BOOK_REPORT_FAMILY_ROLES: Record<string, string[]> = {
  '01-python-beginners-core': [
    'ROLE_PYTHON_DEV',
    'ROLE_FULLSTACK_WEB',
    'ROLE_QA_TESTING',
    'ROLE_IT_SUPPORT',
  ],
  '02-python-crash-courses': [
    'ROLE_PYTHON_DEV',
    'ROLE_FULLSTACK_WEB',
    'ROLE_DATA_ANALYST',
  ],
  '03-combo-crash-paths': [
    'ROLE_PYTHON_DEV',
    'ROLE_FULLSTACK_WEB',
    'ROLE_DATA_ANALYST',
    'ROLE_ML_AI',
  ],
  '04-data-analysis': [
    'ROLE_DATA_ANALYST',
    'ROLE_POWERBI_ANALYST',
    'ROLE_BUSINESS_ANALYST',
    'ROLE_DATA_ENGINEER',
  ],
  '05-data-science': [
    'ROLE_DATA_ANALYST',
    'ROLE_DATA_ENGINEER',
    'ROLE_ML_AI',
    'ROLE_POWERBI_ANALYST',
  ],
  '06-machine-learning': [
    'ROLE_ML_AI',
    'ROLE_GEN_AI',
    'ROLE_DATA_ENGINEER',
    'ROLE_DATA_ANALYST',
  ],
  '07-deep-learning-and-ai': [
    'ROLE_ML_AI',
    'ROLE_GEN_AI',
    'ROLE_AGENTIC_AI',
  ],
  '08-multi-language-programming': [
    'ROLE_FULLSTACK_WEB',
    'ROLE_FRONTEND_REACT',
    'ROLE_JAVA_BACKEND',
    'ROLE_PYTHON_DEV',
  ],
  '09-kids-and-makers': ['ROLE_PYTHON_DEV', 'ROLE_IT_SUPPORT'],
  '10-comprehensive-and-projects': [
    'ROLE_PYTHON_DEV',
    'ROLE_FULLSTACK_WEB',
    'ROLE_DATA_ANALYST',
    'ROLE_DATA_ENGINEER',
  ],
}

export const BOOK_REPORT_FAMILY_LABELS: Record<string, string> = {
  '01-python-beginners-core': 'Python Beginners Core',
  '02-python-crash-courses': 'Python Crash Courses',
  '03-combo-crash-paths': 'Combo Learning Paths',
  '04-data-analysis': 'Data Analysis',
  '05-data-science': 'Data Science',
  '06-machine-learning': 'Machine Learning',
  '07-deep-learning-and-ai': 'Deep Learning & AI',
  '08-multi-language-programming': 'Multi-Language Programming',
  '09-kids-and-makers': 'Kids & Makers',
  '10-comprehensive-and-projects': 'Comprehensive & Projects',
}

export function rolesForBookFamily(familyId: string): string[] {
  return BOOK_REPORT_FAMILY_ROLES[familyId] ?? []
}

export function familyLabel(familyId: string): string {
  return BOOK_REPORT_FAMILY_LABELS[familyId] ?? familyId
}
