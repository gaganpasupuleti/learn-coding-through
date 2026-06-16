import { CalendarDays } from 'lucide-react';
import CQCalendarMini from '../ui/CQCalendarMini';
import CQTimeline from '../ui/CQTimeline';
import CQActionButton from '../ui/CQActionButton';
import CQSectionTitle from '../ui/CQSectionTitle';

const defaultTimeline = [
  { time: '10:00 AM', label: 'Python Class', tone: 'yellow', timeClass: 'top-[7px]' },
  { time: '12:30 PM', label: 'SQL Practice', tone: 'pink', timeClass: 'top-1' },
  { time: '03:00 PM', label: 'Assignment Review', tone: 'sage' },
  { time: '05:00 PM', label: 'Aptitude Test', tone: 'blue' },
];

export function SimpleListPanel({ title, items }) {
  return (
    <div>
      <CQSectionTitle>{title}</CQSectionTitle>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="px-3 py-2 bg-cream-soft border border-slate/20 rounded-full text-[13px] font-medium text-charcoal"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CalendarTimelinePanel({ timeline = defaultTimeline }) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            Study Calendar
          </h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-card-pink/50 border border-slate/15 text-slate">
            May 2024
          </span>
        </div>
        <CQCalendarMini hideHeader />
        <CQActionButton variant="ghost" className="w-full mt-1">
          Add Study Plan
        </CQActionButton>
      </div>
      <div>
        <CQSectionTitle>Today&apos;s Timeline</CQSectionTitle>
        <CQTimeline items={timeline} />
      </div>
      <CQActionButton variant="ghost" className="w-full mt-auto">
        View all details
      </CQActionButton>
    </>
  );
}
