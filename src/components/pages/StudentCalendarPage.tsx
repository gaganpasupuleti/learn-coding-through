import { cn } from '@/lib/utils'

import type { AuthUser } from '@/lib/auth'
import { AssignmentList } from '@/components/student-calendar/AssignmentList'
import { CalendarResources } from '@/components/student-calendar/CalendarResources'
import { ClassCalendar } from '@/components/student-calendar/ClassCalendar'
import { DayClassNotes } from '@/components/student-calendar/DayClassNotes'
import { SelectedDaySummary } from '@/components/student-calendar/SelectedDaySummary'
import { useLearningPlanner } from '@/components/learning-planner/useLearningPlanner'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
import {
  DASHBOARD_SECTION_LABEL,
  STUDENT_PAGE_BG,
} from '@/components/student-dashboard/dashboard-styles'

interface StudentCalendarPageProps {
  user: AuthUser
}

function CalendarSection({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <h2 className={DASHBOARD_SECTION_LABEL}>{title}</h2>
      {children}
    </section>
  )
}

export function StudentCalendarPage({ user }: StudentCalendarPageProps) {
  const planner = useLearningPlanner(user)
  const snapshot = useStudentDashboardSnapshot(user)

  return (
    <div className={cn(STUDENT_PAGE_BG, 'p-4 md:p-6')}>
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Class calendar</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Select a day to see your class schedule, notes, assignments, and study materials.
          </p>
        </header>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12">
          <div className="order-1 lg:col-span-5">
            <ClassCalendar
              viewMonth={planner.viewMonth}
              onViewMonthChange={planner.setViewMonth}
              selectedDate={planner.selectedDate}
              onSelectDate={planner.setSelectedDate}
              markedDates={planner.markedDates}
              markedDatesByType={planner.markedDatesByType}
            />
          </div>

          <div className="order-2 flex flex-col gap-6 lg:col-span-7">
            <SelectedDaySummary
              selectedDate={planner.selectedDate}
              sessions={snapshot.upcomingSessions}
              dayPlan={planner.dayPlan}
              loading={planner.loading || snapshot.loading}
            />

            <CalendarSection title="Class notes">
              <DayClassNotes
                selectedDate={planner.selectedDate}
                dayPlan={planner.dayPlan}
                loading={planner.loading}
              />
            </CalendarSection>

            <CalendarSection title="Assignments">
              <AssignmentList
                selectedDate={planner.selectedDate}
                deadlines={snapshot.deadlines}
                loading={snapshot.loading}
              />
            </CalendarSection>

            <CalendarSection title="Resources">
              <CalendarResources selectedDate={planner.selectedDate} />
            </CalendarSection>
          </div>
        </div>
      </div>
    </div>
  )
}
