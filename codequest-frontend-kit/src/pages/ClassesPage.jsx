import { useState } from 'react';
import CodeQuestPage from '../components/layout/CodeQuestPage';
import CodeQuestTopHeader from '../components/layout/CodeQuestTopHeader';
import CQCard from '../components/ui/CQCard';
import CQSectionTitle from '../components/ui/CQSectionTitle';
import CQActionButton from '../components/ui/CQActionButton';
import { SimpleListPanel } from '../components/panels/SharedPanels';

const classes = [
  { title: 'Python Loops', time: '10:00 AM', mentor: 'Mentor Session', duration: '60 min', status: 'Starting Soon', tone: 'yellow' },
  { title: 'SQL GROUP BY', time: '12:30 PM', mentor: 'Mentor Session', duration: '45 min', status: 'Pending', tone: 'pink' },
  { title: 'Aptitude Percentages', time: '5:00 PM', mentor: 'Trainer Session', duration: '40 min', status: 'Pending', tone: 'sage' },
  { title: 'Resume Workshop', time: 'Tomorrow', mentor: 'Career Lab', duration: '50 min', status: 'Scheduled', tone: 'lavender' },
];

export default function ClassesPage() {
  const [pill, setPill] = useState('All');

  return (
    <CodeQuestPage
      activeKey="classes"
      rightPanel={
        <>
          <SimpleListPanel
            title="Upcoming Classes"
            items={['Python Loops · 10:00 AM', 'SQL GROUP BY · 12:30 PM', 'Aptitude Percentages · 5:00 PM']}
          />
          <SimpleListPanel
            title="Class Reminders"
            items={['Python class starts in 25 minutes', 'Review loops notes before joining']}
          />
        </>
      }
    >
      <CodeQuestTopHeader
        title="Live Classes"
        subtitle="Join today's sessions, review class notes, and stay on track with your learning plan."
        pills={['All', 'Today', 'Python', 'SQL', 'Aptitude', 'Resume']}
        activePill={pill}
        onPillChange={setPill}
        searchPlaceholder="Search classes, mentors, topics..."
      />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((item) => (
          <CQCard key={item.title} tone={item.tone} className="flex flex-col gap-3 min-h-[160px]">
            <div className="flex justify-between gap-2">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <span className={`shrink-0 ${item.status === 'Starting Soon' ? 'cq-badge-soon' : 'cq-badge-pending'}`}>
                {item.status}
              </span>
            </div>
            <p className="text-[13px] text-slate">{item.time} · {item.duration}</p>
            <p className="text-[13px] text-slate">{item.mentor}</p>
            <div className="flex gap-2 mt-auto pt-2">
              <CQActionButton>Join</CQActionButton>
              <CQActionButton variant="ghost">View Notes</CQActionButton>
            </div>
          </CQCard>
        ))}
      </section>

      <CQSectionTitle>Class Reminders</CQSectionTitle>
      <CQCard tone="cream" className="border-slate/20">
        <p className="text-sm text-slate">Your Python class starts in 25 minutes. Review loops notes before joining.</p>
      </CQCard>
    </CodeQuestPage>
  );
}
