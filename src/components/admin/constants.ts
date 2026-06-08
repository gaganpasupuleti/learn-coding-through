import type { AdminBatchCreatePayload, AdminStudentCreatePayload } from '@/lib/api'

import type { StudentWorkflowStage } from './types'

export const WORKFLOW_STAGE_STORAGE_KEY = 'admin-student-workflow-stages'

export const ADMIN_LINKEDIN_JSON_INPUT_ID = 'admin-linkedin-json-upload'

export const defaultCreatePayload: AdminStudentCreatePayload = {
  email: '',
  full_name: '',
  password: '',
  role: 'student',
  xp_points: 0,
  streak_days: 0,
  credit_balance: 100,
  selected_role_id: null,
  cohort_name: null,
  batch_name: null,
  is_active: true,
}

export const defaultBatchPayload: AdminBatchCreatePayload = {
  name: '',
  track: '',
  days: '',
  time_ist: '',
  mode: 'online',
  start_date: '',
  seats_total: 30,
}

export const workflowStageMeta: Record<StudentWorkflowStage, { title: string; hint: string }> = {
  new: { title: 'New Enquiries', hint: 'Fresh students with no assignment yet' },
  enrolled: { title: 'Enrolled', hint: 'Assigned to class and onboarding' },
  in_progress: { title: 'In Progress', hint: 'Actively learning and progressing' },
  needs_attention: { title: 'Needs Attention', hint: 'Inactive or blocked students' },
}

export const bentoPanelClass =
  'admin-bento-tile bg-card text-card-foreground p-6 transition-transform hover:-translate-y-0.5'
