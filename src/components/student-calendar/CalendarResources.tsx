import { ExternalLink } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { getDemoResourcesForDate } from '@/components/student-calendar/calendar-demo-data'
import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from '@/components/student-dashboard/dashboard-styles'
import { cn } from '@/lib/utils'

interface CalendarResourcesProps {
  selectedDate: string
}

const KIND_LABEL = {
  slides: 'Slides',
  recording: 'Recording',
  doc: 'Document',
  repo: 'Repository',
} as const

export function CalendarResources({ selectedDate }: CalendarResourcesProps) {
  const resources = getDemoResourcesForDate(selectedDate)

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Resources & links</h2>

        {resources.length === 0 ? (
          <p className="text-sm text-slate-500">No resources linked for this date.</p>
        ) : (
          <ul className="space-y-2">
            {resources.map((resource) => (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 hover:border-blue-300 hover:bg-blue-50/50"
                >
                  <span>
                    {resource.label}
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      {KIND_LABEL[resource.kind]}
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-[11px] text-slate-400">Demo links — TODO: faculty-uploaded resources</p>
      </div>
    </Card>
  )
}
