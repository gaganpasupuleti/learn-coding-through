import { useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

import type { AuthUser } from '@/lib/auth'
import { toIsoDate } from '@/lib/calendar-events'
import type { PlannerTimelineItem } from '@/lib/learning-planner-derive'

import { PlannerDayOverviewCard } from './PlannerDayOverviewCard'
import { PlannerDayPlanCard } from './PlannerDayPlanCard'
import { PlannerEventDrawer, type PlannerNavTarget } from './PlannerEventDrawer'
import { PlannerMonthCalendar } from './PlannerMonthCalendar'
import { PlannerRoadmapProgress } from './PlannerRoadmapProgress'
import { PlannerStickyCTA } from './PlannerStickyCTA'
import { PlannerTimelinePanel } from './PlannerTimelinePanel'
import { PLANNER_GAP, PLANNER_PAGE } from './planner-styles'
import { useLearningPlanner } from './useLearningPlanner'

interface LearningPlannerViewProps {
  user: AuthUser
  onNavigate: (page: PlannerNavTarget) => void
  embedded?: boolean
}

function InlineAlert({
  tone,
  children,
  onDismiss,
}: {
  tone: 'amber' | 'blue'
  children: ReactNode
  onDismiss?: () => void
}) {
  const styles =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-blue-200 bg-blue-50 text-blue-900'
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${styles}`}
    >
      <span className="min-w-0 truncate">{children}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 rounded p-0.5 hover:bg-black/5">
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export function LearningPlannerView({ user, onNavigate, embedded }: LearningPlannerViewProps) {
  const planner = useLearningPlanner(user)
  const [selectedEvent, setSelectedEvent] = useState<PlannerTimelineItem | null>(null)
  const [dismissRoleAlert, setDismissRoleAlert] = useState(false)
  const [dismissCareerAlert, setDismissCareerAlert] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)

  const handleSetProgramStart = () => {
    planner.setProgramStart(toIsoDate(new Date()))
  }

  const scrollToTimeline = () => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const showRoleAlert =
    !dismissRoleAlert && !planner.enrollment?.selected_role_id && !planner.loading
  const showCareerAlert = !dismissCareerAlert && !planner.careerJourney && !planner.loading

  return (
    <div
      className={
        embedded
          ? 'space-y-3'
          : `flex min-h-0 max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/40 ${PLANNER_PAGE} pb-16`
      }
    >
      <div className={embedded ? undefined : `mx-auto flex w-full max-w-7xl flex-col ${PLANNER_GAP}`}>
        {!embedded && (
          <header className="flex flex-wrap items-baseline gap-x-3 gap-y-0">
            <h1 className="text-xl font-bold text-slate-900">Learning Planner</h1>
            <p className="text-xs text-slate-500">
              Pick a date to see objectives, plan, and timeline.
            </p>
          </header>
        )}

        {!embedded && (
          <PlannerRoadmapProgress progress={planner.roadmapProgress} onNavigate={onNavigate} />
        )}

        {(showRoleAlert || showCareerAlert) && (
          <div className="space-y-1.5">
            {showRoleAlert && (
              <InlineAlert tone="amber" onDismiss={() => setDismissRoleAlert(true)}>
                Quiz and project milestones need a role assigned. Classes still show from enrollment.
              </InlineAlert>
            )}
            {showCareerAlert && (
              <InlineAlert tone="blue" onDismiss={() => setDismissCareerAlert(true)}>
                Select a career path in Career Map for syllabus plans.{' '}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => onNavigate('roadmapper')}
                >
                  Open Career Map
                </button>
              </InlineAlert>
            )}
          </div>
        )}

        <div
          className={`grid max-h-[40vh] min-h-0 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-12 lg:grid-rows-1 ${embedded ? '' : ''}`}
        >
          <div className="min-h-0 lg:col-span-5">
            <PlannerMonthCalendar
              density="planner"
              viewMonth={planner.viewMonth}
              onViewMonthChange={planner.setViewMonth}
              selectedDate={planner.selectedDate}
              onSelectDate={planner.setSelectedDate}
              markedDates={planner.markedDates}
              markedDatesByType={planner.markedDatesByType}
              className="h-full"
            />
          </div>
          <div className="min-h-0 lg:col-span-7">
            <PlannerDayOverviewCard
              selectedDate={planner.selectedDate}
              dayPlan={planner.dayPlan}
              roadmapProgress={planner.roadmapProgress}
              eventCounts={planner.eventCounts}
              timeline={planner.timeline}
              anchor={planner.anchor}
              loading={planner.loading}
              onNavigate={onNavigate}
              onSetProgramStart={
                planner.anchor.source === 'today' ? handleSetProgramStart : undefined
              }
            />
          </div>
        </div>

        <div className={`grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2 ${PLANNER_GAP}`}>
          <PlannerDayPlanCard dayPlan={planner.dayPlan} loading={planner.loading} />
          <div ref={timelineRef}>
            <PlannerTimelinePanel
              id="planner-timeline"
              compact
              timeline={planner.timeline}
              loading={planner.loading}
              onEventClick={setSelectedEvent}
            />
          </div>
        </div>
      </div>

      {!embedded && (
        <PlannerStickyCTA
          action={planner.primaryAction}
          onNavigate={onNavigate}
          onScrollToTimeline={scrollToTimeline}
        />
      )}

      <PlannerEventDrawer
        item={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onNavigate={onNavigate}
      />
    </div>
  )
}
