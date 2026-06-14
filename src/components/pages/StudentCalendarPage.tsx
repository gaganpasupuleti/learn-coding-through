import type { AuthUser } from '@/lib/auth'

import { AssignmentList } from '@/components/student-calendar/AssignmentList'
import { CalendarResources } from '@/components/student-calendar/CalendarResources'
import { ClassCalendar } from '@/components/student-calendar/ClassCalendar'
import { DayClassNotes } from '@/components/student-calendar/DayClassNotes'
import { useLearningPlanner } from '@/components/learning-planner/useLearningPlanner'
import { useStudentDashboardSnapshot } from '@/components/student-dashboard/useStudentDashboardSnapshot'
import { STUDENT_PAGE_BG } from '@/components/student-dashboard/dashboard-styles'

interface StudentCalendarPageProps {
  user: AuthUser
}

export function StudentCalendarPage({ user }: StudentCalendarPageProps) {
  const planner = useLearningPlanner(user)
  const snapshot = useStudentDashboardSnapshot(user)

  return (
    <div className={`${STUDENT_PAGE_BG} p-4 md:p-6`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Class calendar</h1>
          <p className="mt-1 text-sm text-slate-600">
            Month view, class notes, assignments, and resources for your batch schedule.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <ClassCalendar
              viewMonth={planner.viewMonth}
              onViewMonthChange={planner.setViewMonth}
              selectedDate={planner.selectedDate}
              onSelectDate={planner.setSelectedDate}
              markedDates={planner.markedDates}
              markedDatesByType={planner.markedDatesByType}
            />
          </div>

          <div className="space-y-6 lg:col-span-7">
            <DayClassNotes
              selectedDate={planner.selectedDate}
              dayPlan={planner.dayPlan}
              loading={planner.loading}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <AssignmentList
                selectedDate={planner.selectedDate}
                deadlines={snapshot.deadlines}
                loading={snapshot.loading}
              />
              <CalendarResources selectedDate={planner.selectedDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
