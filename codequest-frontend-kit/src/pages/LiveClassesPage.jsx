import { CalendarDays, ClipboardList, FileText } from 'lucide-react';
import CodeQuestPage from '../components/layout/CodeQuestPage';
import CodeQuestTopHeader from '../components/layout/CodeQuestTopHeader';
import CQCard from '../components/ui/CQCard';
import CQSectionTitle from '../components/ui/CQSectionTitle';
import CQActionButton from '../components/ui/CQActionButton';
import { CalendarTimelinePanel } from '../components/panels/SharedPanels';

/** Set both arrays to [] to test empty state. */
const todayClasses = [
  {
    id: 'today-python-live',
    title: 'Python Functions & Loops',
    batch: 'Python Foundation Batch',
    instructor: 'CodeQuest Mentor',
    time: '07:00 PM - 08:00 PM',
    status: 'live',
    topic: 'Functions, loops, and practice problems',
    notesStatus: 'Notes placeholder',
    assignmentStatus: 'Assignment placeholder',
  },
  {
    id: 'today-aptitude-done',
    title: 'Aptitude Warm-up',
    batch: 'Core Skills Batch',
    instructor: 'CodeQuest Mentor',
    time: '05:00 PM - 05:45 PM',
    status: 'completed',
    topic: 'Percentages and ratios review',
    notesStatus: 'Notes available (placeholder)',
    assignmentStatus: 'Submitted (placeholder)',
  },
];

const upcomingClasses = [
  {
    id: 'upcoming-sql-groupby',
    title: 'SQL GROUP BY Practice',
    batch: 'Data Analytics Batch',
    instructor: 'CodeQuest Mentor',
    date: 'Tomorrow',
    time: '07:00 PM - 08:00 PM',
    status: 'upcoming',
    topic: 'Aggregations, GROUP BY, HAVING',
  },
  {
    id: 'upcoming-python-recursion',
    title: 'Python Recursion Deep Dive',
    batch: 'Python Foundation Batch',
    instructor: 'CodeQuest Mentor',
    date: 'Wed, Jun 25',
    time: '07:00 PM - 08:00 PM',
    status: 'upcoming',
    topic: 'Recursion patterns and stack traces',
  },
];

const STATUS_STYLES = {
  live: {
    badge: 'bg-red-500/15 text-red-600 ring-1 ring-red-500/30',
    label: 'Live now',
    card: 'ring-2 ring-red-500/25',
  },
  upcoming: {
    badge: 'bg-cta/10 text-cta ring-1 ring-cta/20',
    label: 'Upcoming',
    card: '',
  },
  completed: {
    badge: 'bg-slate/10 text-slate line-through decoration-slate/40',
    label: 'Completed',
    card: 'opacity-75',
  },
};

function ClassStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.upcoming;
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}>
      {status === 'live' && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" aria-hidden />
      )}
      {style.label}
    </span>
  );
}

function PlaceholderRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-dashed border-slate/25 bg-cream/60 px-3 py-2 text-[13px]">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="font-medium text-charcoal">{label}</p>
        <p className="text-slate">{value}</p>
      </div>
    </div>
  );
}

function TodayClassCard({ classItem }) {
  const style = STATUS_STYLES[classItem.status] || STATUS_STYLES.upcoming;
  const tone = classItem.status === 'live' ? 'yellow' : classItem.status === 'completed' ? 'sage' : 'cream';

  return (
    <CQCard tone={tone} className={`flex flex-col gap-3 ${style.card}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug">{classItem.title}</h3>
          <p className="mt-0.5 text-[13px] text-slate">{classItem.batch}</p>
        </div>
        <ClassStatusBadge status={classItem.status} />
      </div>

      <dl className="grid gap-1 text-[13px]">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <dt className="font-medium text-slate">Instructor</dt>
          <dd>{classItem.instructor}</dd>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <dt className="font-medium text-slate">Time</dt>
          <dd>{classItem.time}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate">Topic</dt>
          <dd className="mt-0.5">{classItem.topic}</dd>
        </div>
      </dl>

      <div className="grid gap-2 sm:grid-cols-2">
        <PlaceholderRow icon={FileText} label="Notes / resources" value={classItem.notesStatus} />
        <PlaceholderRow icon={ClipboardList} label="Assignment" value={classItem.assignmentStatus} />
      </div>

      {classItem.status === 'live' && (
        <CQActionButton className="self-start">Join live session (placeholder)</CQActionButton>
      )}
    </CQCard>
  );
}

function UpcomingClassCard({ classItem }) {
  return (
    <CQCard tone="blue" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-snug">{classItem.title}</h3>
        <ClassStatusBadge status={classItem.status} />
      </div>
      <p className="text-[13px] text-slate">{classItem.batch}</p>
      <div className="flex flex-wrap gap-x-4 text-[13px]">
        <span className="font-medium text-charcoal">{classItem.date}</span>
        <span className="text-slate">{classItem.time}</span>
      </div>
      <p className="text-[13px]">
        <span className="font-medium text-slate">Instructor: </span>
        {classItem.instructor}
      </p>
      <p className="text-[13px] text-slate">{classItem.topic}</p>
    </CQCard>
  );
}

function CQEmptyState() {
  return (
    <CQCard tone="cream" className="flex flex-col items-center border-slate/20 py-10 text-center">
      <CalendarDays className="mb-3 h-10 w-10 text-slate/50" strokeWidth={1.5} />
      <p className="text-base font-semibold text-charcoal">No classes scheduled yet.</p>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-slate">
        Your live sessions, notes, and assignments will appear here once added.
      </p>
    </CQCard>
  );
}

export default function LiveClassesPage() {
  const hasToday = todayClasses.length > 0;
  const hasUpcoming = upcomingClasses.length > 0;
  const isEmpty = !hasToday && !hasUpcoming;

  return (
    <CodeQuestPage activeKey="classes" rightPanel={<CalendarTimelinePanel />}>
      <CodeQuestTopHeader
        title="Live Classes"
        subtitle="Track today's sessions, upcoming classes, notes, and assignments in one place."
        profileInitials="Gk"
      />

      {isEmpty ? (
        <CQEmptyState />
      ) : (
        <div className="flex flex-col gap-6">
          {hasToday && (
            <section>
              <CQSectionTitle>Today&apos;s Classes</CQSectionTitle>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {todayClasses.map((classItem) => (
                  <TodayClassCard key={classItem.id} classItem={classItem} />
                ))}
              </div>
            </section>
          )}

          {hasUpcoming && (
            <section>
              <CQSectionTitle>Upcoming Classes</CQSectionTitle>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {upcomingClasses.map((classItem) => (
                  <UpcomingClassCard key={classItem.id} classItem={classItem} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </CodeQuestPage>
  );
}
