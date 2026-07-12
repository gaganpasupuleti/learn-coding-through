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

export const sectionMeta: Record<AdminSection, { title: string; icon: ReactNode }> = {
  dashboard: { title: 'Executive Dashboard', icon: <ChartBar size={18} weight="bold" /> },
  board: { title: 'Workflow Board', icon: <Kanban size={18} weight="bold" /> },
  students: { title: 'Students', icon: <UsersThree size={18} weight="bold" /> },
  classes: { title: 'Classes & Batches', icon: <CalendarBlank size={18} weight="bold" /> },
  'jobspy-ops': { title: 'Job Board Ops', icon: <Briefcase size={18} weight="bold" /> },
  'email-station': { title: 'Email Station', icon: <EnvelopeSimple size={18} weight="bold" /> },
  'job-enrichment': { title: 'Job Enrichment', icon: <ListMagnifyingGlass size={18} weight="bold" /> },
  quizzes: { title: 'Quiz Bank', icon: <ListChecks size={18} weight="bold" /> },
  activity: { title: 'Activity Log', icon: <ClockCounterClockwise size={18} weight="bold" /> },
  feedback: { title: 'Student Feedback', icon: <ChatCircle size={18} weight="bold" /> },
  access: { title: 'Access Control', icon: <ShieldCheck size={18} weight="bold" /> },
}
