import {
  Briefcase,
  CalendarBlank,
  ChartBar,
  ChatCircle,
  ClockCounterClockwise,
  EnvelopeSimple,
  Kanban,
  ListChecks,
  ListMagnifyingGlass,
  ShieldCheck,
  UsersThree,
} from '@phosphor-icons/react'
import type { ReactNode } from 'react'

import type { AdminSection } from './types'

export const adminNavItems: Array<{ key: AdminSection; label: string; icon: ReactNode }> = [
  { key: 'dashboard', label: 'Dashboard', icon: <ChartBar size={16} /> },
  { key: 'board', label: 'Workflow Board', icon: <Kanban size={16} /> },
  { key: 'students', label: 'Students', icon: <UsersThree size={16} /> },
  { key: 'classes', label: 'Classes', icon: <CalendarBlank size={16} /> },
  { key: 'jobspy-ops', label: 'JobSpy Ops', icon: <Briefcase size={16} /> },
  { key: 'email-station', label: 'Email Station', icon: <EnvelopeSimple size={16} /> },
  { key: 'job-enrichment', label: 'Job Enrichment', icon: <ListMagnifyingGlass size={16} /> },
  { key: 'quizzes', label: 'Quizzes', icon: <ListChecks size={16} /> },
  { key: 'activity', label: 'Activity', icon: <ClockCounterClockwise size={16} /> },
  { key: 'feedback', label: 'Feedback', icon: <ChatCircle size={16} /> },
  { key: 'access', label: 'Access Control', icon: <ShieldCheck size={16} /> },
]
