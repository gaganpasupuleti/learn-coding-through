import { useEffect, useState } from 'react';
import CodeQuestPage from '../components/layout/CodeQuestPage';
import CodeQuestTopHeader from '../components/layout/CodeQuestTopHeader';
import CQStatCard from '../components/ui/CQStatCard';
import CQProgressBar from '../components/ui/CQProgressBar';
import CQWeeklyChart from '../components/ui/CQWeeklyChart';
import CQCard from '../components/ui/CQCard';
import CQSectionTitle from '../components/ui/CQSectionTitle';
import CQActionButton from '../components/ui/CQActionButton';
import ConnectionStatus from '../components/ui/ConnectionStatus';
import { CalendarTimelinePanel } from '../components/panels/SharedPanels';
import { ROUTES } from '../config/navigation';
import { fetchCurrentUser } from '../lib/api';
import { getStoredUser } from '../lib/auth';

const SKILL_ROWS = [
  { label: 'Python', value: '74%' },
  { label: 'SQL', value: '61%' },
  { label: 'Aptitude', value: '48%' },
];

const PRACTICE_LOG = ['24 problems solved', '8 SQL queries', '5 aptitude sets'];

export default function DashboardPage() {
  const [pill, setPill] = useState('All');
  const [userName, setUserName] = useState(() => getStoredUser()?.full_name?.split(' ')[0] || 'Gk');

  useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        if (user?.full_name) setUserName(user.full_name.split(' ')[0]);
      })
      .catch(() => {
        /* use cached or default name when API unavailable */
      });
  }, []);

  return (
    <CodeQuestPage activeKey="dashboard" rightPanel={<CalendarTimelinePanel />}>
      {import.meta.env.DEV && <ConnectionStatus />}
      <CodeQuestTopHeader
        title={`Good morning, ${userName}`}
        subtitle="Your learning plan is ready. Continue today's classes, practice goals, and progress checkpoints."
        profileInitials={userName.slice(0, 2).toUpperCase()}
        pills={['All', 'Python', 'SQL', 'Aptitude', 'Resume', 'Assignments']}
        activePill={pill}
        onPillChange={setPill}
      />

      <section className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        <CQStatCard
          label="Weekly Mastery"
          value="68%"
          tone="pink"
          footer={
            <>
              <CQWeeklyChart />
              <p className="mt-auto text-[13px] font-semibold text-progress">+12% this week</p>
            </>
          }
        />
        <CQStatCard
          label="Skill Progress"
          tone="sage"
          footer={
            <div className="mt-1 flex-1 space-y-1">
              {SKILL_ROWS.map((row) => (
                <div key={row.label} className="flex justify-between text-[13px] font-medium">
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          }
        />
        <CQStatCard
          label="Practice Log"
          tone="blue"
          footer={
            <div className="flex-1 space-y-1 text-[13px] text-slate">
              {PRACTICE_LOG.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          }
        />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <div>
          <CQSectionTitle>Upcoming Classes</CQSectionTitle>
          <div className="flex flex-col gap-2">
            <CQCard tone="cream" className="border-slate/20">
              <p className="text-sm font-semibold">Python Loops · 10:00 AM</p>
              <p className="mt-1 text-[13px] text-slate">Live session with practice checkpoints</p>
            </CQCard>
            <CQCard tone="cream" className="border-slate/20">
              <p className="text-sm font-semibold">SQL GROUP BY · 12:30 PM</p>
              <p className="mt-1 text-[13px] text-slate">Aggregation practice and query review</p>
            </CQCard>
          </div>
        </div>
        <div>
          <CQSectionTitle>Learning Summary</CQSectionTitle>
          <CQCard tone="lavender">
            <p className="text-[13px] leading-relaxed text-slate">
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
