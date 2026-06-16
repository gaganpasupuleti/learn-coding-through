import CodeQuestPage from '../components/layout/CodeQuestPage';
import CodeQuestTopHeader from '../components/layout/CodeQuestTopHeader';
import CQCard from '../components/ui/CQCard';
import CQSectionTitle from '../components/ui/CQSectionTitle';
import CQStatCard from '../components/ui/CQStatCard';
import { SimpleListPanel } from '../components/panels/SharedPanels';
import { ROUTES } from '../config/navigation';

const categories = [
  { title: 'Python Practice', detail: 'Loops, lists, functions', tone: 'yellow', href: ROUTES.pythonLab },
  { title: 'SQL Practice', detail: 'SELECT, GROUP BY, JOINs', tone: 'blue', href: ROUTES.sqlStudio },
  { title: 'Aptitude Practice', detail: 'Percentages, ratios, logic', tone: 'sage', href: ROUTES.aptitude },
  { title: 'Typing Practice', detail: 'Speed and accuracy drills', tone: 'pink', href: ROUTES.practiceStudio },
  { title: 'Mock Tests', detail: 'Timed skill assessments', tone: 'lavender', href: ROUTES.mockTests },
];

export default function PracticeStudioPage() {
  return (
    <CodeQuestPage
      activeKey="practice-studio"
      rightPanel={
        <>
          <SimpleListPanel title="Practice Streak" items={['6-day streak active', 'Best streak: 12 days']} />
          <SimpleListPanel title="Weak Areas" items={['SQL JOINs', 'Aptitude percentages', 'Python functions']} />
        </>
      }
    >
      <CodeQuestTopHeader
        title="Practice Studio"
        subtitle="Build momentum with focused practice sets, recent mistake review, and recommended drills."
      />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <CQCard key={cat.title} tone={cat.tone} className="min-h-[145px] flex flex-col">
            <h3 className="text-sm font-semibold">{cat.title}</h3>
            <p className="text-[13px] text-slate mt-1 flex-1">{cat.detail}</p>
            <a href={cat.href} className="text-[13px] font-semibold text-cta hover:text-cta-hover mt-3">
              Open practice →
            </a>
          </CQCard>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CQStatCard label="Weekly Momentum" value="24 sets" detail="Completed this week" tone="yellow" />
        <CQStatCard label="Recent Mistakes" value="8 items" detail="Review recommended" tone="pink" />
        <CQStatCard label="Recommended" value="SQL GROUP BY" detail="Based on weak areas" tone="blue" />
      </section>

      <CQSectionTitle>Recommended Practice</CQSectionTitle>
      <CQCard tone="lavender">
        <p className="text-sm font-semibold">SQL Aggregations Practice Set</p>
        <p className="text-[13px] text-slate mt-1">Strengthen GROUP BY confidence with scenario-based queries.</p>
      </CQCard>
    </CodeQuestPage>
  );
}
