import { FileText, Film, FolderGit2, Presentation } from 'lucide-react'

import { Card } from '@/components/ui/card'
import {
  getDemoResourcesForDate,
  type CalendarResourceLink,
} from '@/components/student-calendar/calendar-demo-data'
import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from '@/components/student-dashboard/dashboard-styles'
import { cn } from '@/lib/utils'

interface CalendarResourcesProps {
  selectedDate: string
}

const KIND_META: Record<
  CalendarResourceLink['kind'],
  { label: string; icon: React.ReactNode }
> = {
  slides: { label: 'Slide deck', icon: <Presentation className="h-4 w-4" aria-hidden /> },
  recording: { label: 'Recording', icon: <Film className="h-4 w-4" aria-hidden /> },
  doc: { label: 'Handout', icon: <FileText className="h-4 w-4" aria-hidden /> },
  repo: { label: 'Code repo', icon: <FolderGit2 className="h-4 w-4" aria-hidden /> },
}

export function CalendarResources({ selectedDate }: CalendarResourcesProps) {
  const resources = getDemoResourcesForDate(selectedDate)

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        {resources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No resources for this day</p>
            <p className="mt-1 text-xs text-slate-500">
              Slides, recordings, and handouts appear here when shared for a class session.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {resources.map((resource) => {
              const meta = KIND_META[resource.kind]
              return (
                <li key={resource.label}>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{resource.label}</p>
                      <p className="text-xs text-slate-500">{meta.label}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}
