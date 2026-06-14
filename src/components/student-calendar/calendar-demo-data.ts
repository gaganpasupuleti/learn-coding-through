// Sample calendar data for dates without backend notes/resources yet.

export interface CalendarClassNote {
  date: string
  title: string
  summary: string
  bullets: string[]
}

export interface CalendarResourceLink {
  date: string
  label: string
  url: string
  kind: 'slides' | 'recording' | 'doc' | 'repo'
}

export interface CalendarAssignmentDue {
  date: string
  title: string
  type: 'quiz' | 'project' | 'practice'
  done: boolean
}

function offsetDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const CALENDAR_DEMO_NOTES: CalendarClassNote[] = [
  {
    date: offsetDate(0),
    title: 'Live class recap',
    summary: 'Review joins, aggregations, and subqueries from today’s SQL module.',
    bullets: ['Finish 2 SQL practice questions', 'Re-run failed queries from mistakes panel', 'Prepare quiz on GROUP BY'],
  },
  {
    date: offsetDate(1),
    title: 'Python functions & modules',
    summary: 'Hands-on with reusable code and small utilities.',
    bullets: ['Read module imports section', 'Complete one Code Workbench easy task'],
  },
  {
    date: offsetDate(3),
    title: 'Portfolio project checkpoint',
    summary: 'Submit milestone 1 draft for mentor feedback.',
    bullets: ['Push code to GitHub', 'Write README summary', 'Attach demo link'],
  },
]

export const CALENDAR_DEMO_RESOURCES: CalendarResourceLink[] = [
  {
    date: offsetDate(0),
    label: 'SQL joins slide deck',
    url: '',
    kind: 'slides',
  },
  {
    date: offsetDate(0),
    label: 'Class recording',
    url: '',
    kind: 'recording',
  },
  {
    date: offsetDate(1),
    label: 'Python cheat sheet',
    url: '',
    kind: 'doc',
  },
]

export const CALENDAR_DEMO_ASSIGNMENTS: CalendarAssignmentDue[] = [
  { date: offsetDate(0), title: 'SQL Practice: 3 passed questions', type: 'practice', done: false },
  { date: offsetDate(0), title: 'Module quiz — Data modeling', type: 'quiz', done: false },
  { date: offsetDate(2), title: 'Mini project submission', type: 'project', done: false },
  { date: offsetDate(5), title: 'Typing speed check (40+ WPM)', type: 'practice', done: false },
]

export function getDemoNotesForDate(date: string): CalendarClassNote | null {
  return CALENDAR_DEMO_NOTES.find((n) => n.date === date) ?? null
}

export function getDemoResourcesForDate(date: string): CalendarResourceLink[] {
  return CALENDAR_DEMO_RESOURCES.filter((r) => r.date === date)
}

export function getDemoAssignmentsForDate(date: string): CalendarAssignmentDue[] {
  return CALENDAR_DEMO_ASSIGNMENTS.filter((a) => a.date === date)
}
