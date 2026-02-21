/**
 * SyllabusTimeline – reusable Month 1–4 timeline/stepper component.
 *
 * Pass a RoleSyllabus (from syllabus-config) or leave roleKey undefined
 * to show the default general syllabus.
 */

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Lock, CalendarBlank } from '@phosphor-icons/react'
import { getSyllabusByRoleKey, defaultSyllabus, type SyllabusMonth } from '@/lib/syllabus-config'

interface SyllabusTimelineProps {
  /** Career role key (e.g. 'data-analyst'). Defaults to general track when omitted. */
  roleKey?: string
  /** Highlight months up to and including this value as "completed". Default 0 = none. */
  completedMonths?: number
  /** Active month to expand by default. Defaults to first incomplete or month 1. */
  defaultActiveMonth?: number
  className?: string
}

const MONTH_COLORS = [
  'bg-primary/10 text-primary border-primary/30',
  'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  'bg-violet-500/10 text-violet-700 border-violet-500/30',
]

const CONNECTOR_COLORS = ['bg-primary/30', 'bg-blue-400/40', 'bg-emerald-400/40', 'bg-violet-400/40']

function MonthCard({
  month,
  index,
  isCompleted,
  isActive,
  isLocked,
  onClick,
}: {
  month: SyllabusMonth
  index: number
  isCompleted: boolean
  isActive: boolean
  isLocked: boolean
  onClick: () => void
}) {
  const colorClass = MONTH_COLORS[index % MONTH_COLORS.length]

  return (
    <div className="flex flex-col items-center">
      {/* connector above (not for month 1) */}
      {index > 0 && (
        <div className={`w-0.5 h-6 ${CONNECTOR_COLORS[index % CONNECTOR_COLORS.length]}`} />
      )}

      <button
        type="button"
        className={`w-full text-left rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isActive
            ? 'border-primary shadow-sm -translate-y-0.5'
            : 'border-border hover:border-primary/40'
        } ${isLocked ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
        onClick={isLocked ? undefined : onClick}
        aria-expanded={isActive}
      >
        <div className="p-4 flex items-start gap-3">
          {/* badge */}
          <div className={`flex-shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${colorClass}`}>
            M{month.month}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-sm">{month.title}</span>
              {isCompleted ? (
                <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" weight="fill" />
              ) : isLocked ? (
                <Lock size={16} className="text-muted-foreground flex-shrink-0" />
              ) : (
                <Badge variant="outline" className="text-xs rounded-full px-2 py-0.5">
                  {isActive ? 'Open' : 'View'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{month.theme}</p>
          </div>
        </div>

        {/* expanded content */}
        {isActive && !isLocked && (
          <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3">
            <div className="grid sm:grid-cols-2 gap-2">
              {month.weeks.map((week) => (
                <div key={week.week} className="rounded-lg border bg-background/60 p-3">
                  <p className="text-xs font-semibold mb-1">Week {week.week}: {week.topic}</p>
                  <ul className="space-y-0.5">
                    {week.activities.map((act) => (
                      <li key={act} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs font-semibold text-primary mb-1">Month Capstone</p>
              <p className="text-xs text-muted-foreground">{month.capstone}</p>
            </div>
          </div>
        )}
      </button>
    </div>
  )
}

export function SyllabusTimeline({
  roleKey,
  completedMonths = 0,
  defaultActiveMonth,
  className = '',
}: SyllabusTimelineProps) {
  const syllabus = (roleKey ? getSyllabusByRoleKey(roleKey) : null) ?? defaultSyllabus

  const initialActive =
    defaultActiveMonth ??
    (completedMonths < 4 ? completedMonths + 1 : 1)

  const [activeMonth, setActiveMonth] = useState(initialActive)

  const toggle = (month: number) => {
    setActiveMonth((prev) => (prev === month ? 0 : month))
  }

  return (
    <Card className={`border-border/60 bg-card/90 backdrop-blur ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarBlank size={18} className="text-primary" weight="duotone" />
            4-Month Syllabus
          </CardTitle>
          <Badge variant="secondary" className="rounded-full text-xs">
            {syllabus.roleLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Click any month to expand the weekly breakdown and capstone deliverable.
        </p>
      </CardHeader>

      <CardContent className="space-y-0">
        {syllabus.months.map((month, index) => {
          const isCompleted = month.month <= completedMonths
          // Only the current month (completedMonths + 1) is accessible;
          // future months are locked until the preceding month is completed.
          const isLocked = month.month > completedMonths + 1
          const isActive = activeMonth === month.month

          return (
            <MonthCard
              key={month.month}
              month={month}
              index={index}
              isCompleted={isCompleted}
              isActive={isActive}
              isLocked={isLocked}
              onClick={() => toggle(month.month)}
            />
          )
        })}
      </CardContent>
    </Card>
  )
}
