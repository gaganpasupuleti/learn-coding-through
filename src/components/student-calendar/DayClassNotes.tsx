import { BookOpen } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DayLearningPlan } from '@/lib/learning-planner-derive'
import {
  getDemoNotesForDate,
  type CalendarClassNote,
} from '@/components/student-calendar/calendar-demo-data'
import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from '@/components/student-dashboard/dashboard-styles'
import { cn } from '@/lib/utils'

interface DayClassNotesProps {
  selectedDate: string
  dayPlan: DayLearningPlan | null
  loading: boolean
}

function NoteContent({ note }: { note: CalendarClassNote }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-slate-900">{note.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{note.summary}</p>
      </div>
      {note.bullets.length > 0 && (
        <ul className="space-y-1.5 text-sm text-slate-700">
          {note.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="text-slate-400">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function NotesSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}

export function DayClassNotes({ selectedDate, dayPlan, loading }: DayClassNotesProps) {
  const demoNote = getDemoNotesForDate(selectedDate)

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" aria-hidden />
          <h3 className="text-base font-semibold text-slate-900">Instructor notes</h3>
        </div>

        {loading ? (
          <NotesSkeleton />
        ) : demoNote ? (
          <NoteContent note={demoNote} />
        ) : dayPlan && dayPlan.objectives.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-800">{dayPlan.topic}</p>
            <ul className="space-y-1.5 text-sm text-slate-700">
              {dayPlan.objectives.map((obj) => (
                <li key={obj} className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
            {dayPlan.estimatedMinutes > 0 && (
              <p className="text-xs text-slate-500 tabular-nums">
                ~{dayPlan.estimatedMinutes} min planned study
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No class notes for this day</p>
            <p className="mt-1 text-xs text-slate-500">
              Notes appear after live sessions or when your instructor posts materials.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
