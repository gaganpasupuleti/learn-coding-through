/** Maps Book_Reports role family slugs → Code Quest job roles (mirrors job_role_seed.py). */
import { JOB_ROLE_CATALOG } from '@/data/jobRoleCatalog'

export function rolesForBookFamily(familyId: string): string[] {
  const role = JOB_ROLE_CATALOG.find((r) => r.role_family === familyId)
  return role ? [role.role_id] : []
}

export function familyLabel(familyId: string): string {
  const role = JOB_ROLE_CATALOG.find((r) => r.role_family === familyId)
  return role?.role_name ?? familyId
}
