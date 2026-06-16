import { useState } from 'react';
import CodeQuestPage from '../components/layout/CodeQuestPage';
import CodeQuestTopHeader from '../components/layout/CodeQuestTopHeader';
import CQStatCard from '../components/ui/CQStatCard';
import CQProgressBar from '../components/ui/CQProgressBar';
import CQCard from '../components/ui/CQCard';
import CQSectionTitle from '../components/ui/CQSectionTitle';
import CQActionButton from '../components/ui/CQActionButton';
import { CalendarTimelinePanel } from '../components/panels/SharedPanels';
import { ROUTES } from '../config/navigation';

export default function DashboardPage() {
  const [pill, setPill] = useState('All');

  return (
    <CodeQuestPage activeKey="dashboard" rightPanel={<CalendarTimelinePanel />}>
      <CodeQuestTopHeader
        title="Good morning, Gk"
        subtitle="Your learning plan is ready. Continue today's classes, practice goals, and progress checkpoints."
        pills={['All', 'Python', 'SQL', 'Aptitude', 'Resume']}
        activePill={pill}
        onPillChange={setPill}
      />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full min-w-0">
        <CQStatCard
          label="Today's Plan"
          value="2 live sessions"
          detail="Python Fundamentals · SQL Aggregations"
          tone="yellow"
          footer={
            <div className="space-y-1.5">
              <CQProgressBar label="Python" value={65} />
              <CQProgressBar label="SQL" value={40} />
            </div>
          }
        />
        <CQStatCard label="Weekly Mastery" value="68%" detail="+12% this week" detailHighlight tone="pink" />
        <CQStatCard label="Practice Streak" value="6 days" detail="Keep your momentum going" tone="sage" />
        <CQStatCard label="Course Progress" value="74%" detail="Python fundamentals track" tone="blue" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: 'Continue Python', href: ROUTES.pythonLab, tone: 'yellow' },
          { title: 'Open SQL Studio', href: ROUTES.sqlStudio, tone: 'blue' },
          { title: 'Start Aptitude', href: ROUTES.aptitude, tone: 'sage' },
          { title: 'Improve Resume', href: ROUTES.resumeLab, tone: 'lavender' },
        ].map((card) => (
          <CQCard key={card.title} tone={card.tone} className="flex flex-col gap-3">
            <p className="text-sm font-semibold">{card.title}</p>
            <a href={card.href} className="text-[13px] font-semibold text-cta hover:text-cta-hover">
              Continue learning →
            </a>
          </CQCard>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <div>
          <CQSectionTitle>Upcoming Classes</CQSectionTitle>
          <div className="flex flex-col gap-2">
            <CQCard tone="cream" className="border-slate/20">
              <p className="text-sm font-semibold">Python Loops · 10:00 AM</p>
              <p className="text-[13px] text-slate mt-1">Live session with practice checkpoints</p>
            </CQCard>
            <CQCard tone="cream" className="border-slate/20">
              <p className="text-sm font-semibold">SQL GROUP BY · 12:30 PM</p>
              <p className="text-[13px] text-slate mt-1">Aggregation practice and query review</p>
            </CQCard>
          </div>
        </div>
        <div>
          <CQSectionTitle>Learning Summary</CQSectionTitle>
          <CQCard tone="lavender">
            <p className="text-[13px] text-slate leading-relaxed">
              Complete today&apos;s SQL practice set, review Python loops notes, and submit pending assignments
              before your aptitude session.
            </p>
            <CQActionButton className="mt-4 self-start" onClick={() => { window.location.href = '/progress'; }}>
              View learning plan
            </CQActionButton>
          </CQCard>
        </div>
      </section>
    </CodeQuestPage>
  );
}
