import type { AdminStudent } from '@/lib/api'

import type { StudentWorkflowStage } from './types'

export function resolveStudentWorkflowStage(student: AdminStudent): StudentWorkflowStage {
  const hasBatchAssignment = Boolean(student.batch_name || student.cohort_name)

  if (!student.is_active) {
    return 'needs_attention'
  }

  if (!hasBatchAssignment) {
    return 'new'
  }

  if ((student.xp_points ?? 0) >= 100) {
    return 'in_progress'
  }

  return 'enrolled'
}
