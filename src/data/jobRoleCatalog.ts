/** Static job role catalog for Study Materials role mapping (mirrors backend job_role_seed.py). */
export interface JobRoleEntry {
  role_id: string
  role_name: string
  role_family: string
}

export const JOB_ROLE_CATALOG: JobRoleEntry[] = [
  { role_id: 'ROLE_JAVA_BACKEND', role_name: 'Java Backend Developer', role_family: 'java-backend' },
  { role_id: 'ROLE_PYTHON_DEV', role_name: 'Python Developer', role_family: 'python-dev' },
  { role_id: 'ROLE_DATA_ANALYST', role_name: 'Data Analyst', role_family: 'data-analyst' },
  { role_id: 'ROLE_POWERBI_ANALYST', role_name: 'Power BI Analyst', role_family: 'powerbi-analyst' },
  { role_id: 'ROLE_FRONTEND_REACT', role_name: 'Frontend React Developer', role_family: 'frontend-react' },
  { role_id: 'ROLE_FULLSTACK_WEB', role_name: 'Full Stack Web Developer', role_family: 'fullstack-web' },
  { role_id: 'ROLE_QA_TESTING', role_name: 'QA / Testing Engineer', role_family: 'qa-testing' },
  { role_id: 'ROLE_DATA_ENGINEER', role_name: 'Data Engineer', role_family: 'data-engineer' },
  { role_id: 'ROLE_ML_AI', role_name: 'ML / Data Science Engineer', role_family: 'ml-ai' },
  { role_id: 'ROLE_GEN_AI', role_name: 'Generative AI / LLM Engineer', role_family: 'gen-ai' },
  { role_id: 'ROLE_AGENTIC_AI', role_name: 'Agentic AI Engineer', role_family: 'agentic-ai' },
  { role_id: 'ROLE_IT_SUPPORT', role_name: 'IT Support / Helpdesk', role_family: 'it-support' },
  { role_id: 'ROLE_SERVICENOW', role_name: 'ServiceNow Developer / Admin', role_family: 'servicenow' },
  { role_id: 'ROLE_BUSINESS_ANALYST', role_name: 'Business Analyst', role_family: 'business-analyst' },
  { role_id: 'ROLE_CYBER_SECURITY', role_name: 'Cyber Security Analyst', role_family: 'cyber-security' },
  { role_id: 'ROLE_SALESFORCE', role_name: 'Salesforce Developer / Admin', role_family: 'salesforce-crm' },
  { role_id: 'ROLE_DYNAMICS_CRM', role_name: 'Microsoft Dynamics 365 CRM', role_family: 'dynamics-crm' },
  { role_id: 'ROLE_POWER_PLATFORM', role_name: 'Power Platform Developer', role_family: 'power-platform' },
]

const ROLE_NAME_BY_ID = Object.fromEntries(JOB_ROLE_CATALOG.map((r) => [r.role_id, r.role_name]))

export function roleName(roleId: string): string {
  return ROLE_NAME_BY_ID[roleId] ?? roleId
}
