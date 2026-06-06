import { Card } from '@/components/ui/card'
import type { DayLearningPlan } from '@/lib/learning-planner-derive'
import { cn } from '@/lib/utils'

import { EVENT_BADGE, PLANNER_BODY, PLANNER_CARD, PLANNER_SECTION_TITLE } from './planner-styles'

interface PlannerDayPlanCardProps {
  dayPlan: DayLearningPlan
  loading: boolean
}

export function PlannerDayPlanCard({ dayPlan, loading }: PlannerDayPlanCardProps) {
  if (loading) {
    return (
      <Card className={cn(PLANNER_CARD, 'h-full')}>
        <div className={PLANNER_BODY}>
          <p className="text-sm text-slate-500">Loading day plan…</p>
        </div>
      </Card>
    )
  }

  const extraPractice = Math.max(0, dayPlan.practiceTasks.length - 3)

  return (
    <Card className={cn(PLANNER_CARD, 'h-full overflow-hidden')}>
      <div className={cn(PLANNER_BODY, 'space-y-3')}>
        <h3 className="text-sm font-semibold text-slate-900">Day plan</h3>

        {dayPlan.objectives.length > 0 && (
          <section>
            <p className={cn(PLANNER_SECTION_TITLE, 'mb-1')}>Objectives</p>
            <ul className="space-y-0.5">
              {dayPlan.objectives.slice(0, 2).map((obj) => (
                <li key={obj} className="line-clamp-1 text-sm text-slate-700">
                  • {obj}
                </li>
              ))}
              {dayPlan.objectives.length > 2 && (
                <li className="text-xs text-slate-400">+{dayPlan.objectives.length - 2} more</li>
              )}
            </ul>
          </section>
        )}

        {dayPlan.requiredLessons.length > 0 && (
          <section>
            <p className={cn(PLANNER_SECTION_TITLE, 'mb-1')}>Required lessons</p>
            <ul className="space-y-1">
              {dayPlan.requiredLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className={cn(
                    'rounded-md px-2 py-1.5 text-sm',
                    lesson.done
                      ? 'bg-emerald-50 text-emerald-800 line-through'
                      : 'bg-slate-50 text-slate-800',
                  )}
                >
                  {lesson.title}
                </li>
              ))}
            </ul>
          </section>
        )}

        {dayPlan.practiceTasks.length > 0 && (
          <section>
            <p className={cn(PLANNER_SECTION_TITLE, 'mb-1')}>Code Practice Ground</p>
            <p className="text-sm text-slate-700">
              {dayPlan.practiceTasks.slice(0, 3).join(' · ')}
              {extraPractice > 0 && (
                <span className="text-slate-400"> · +{extraPractice} more</span>
              )}
            </p>
          </section>
        )}

        {(dayPlan.quizStatus || dayPlan.projectStatus) && (
          <section className="flex flex-wrap gap-2">
            {dayPlan.quizStatus && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
                  EVENT_BADGE.quiz,
                )}
              >
                Quiz: {dayPlan.quizStatus.title}
                <span className="opacity-70">
                  ({dayPlan.quizStatus.passed ? 'Passed' : 'Due'})
                </span>
              </span>
            )}
            {dayPlan.projectStatus && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
                  EVENT_BADGE.project,
                )}
              >
                Project: {dayPlan.projectStatus.title}
                <span className="opacity-70">
                  ({dayPlan.projectStatus.complete ? 'Done' : 'In progress'})
                </span>
              </span>
            )}
          </section>
        )}
      </div>
    </Card>
  )
}
