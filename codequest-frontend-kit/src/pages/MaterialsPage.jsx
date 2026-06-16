import { useState } from 'react';
import CodeQuestPage from '../components/layout/CodeQuestPage';
import CodeQuestTopHeader from '../components/layout/CodeQuestTopHeader';
import CQCard from '../components/ui/CQCard';
import CQProgressBar from '../components/ui/CQProgressBar';
import CQActionButton from '../components/ui/CQActionButton';
import { SimpleListPanel } from '../components/panels/SharedPanels';

const materials = [
  { title: 'Beginner Python Notes', topic: 'Python', difficulty: 'Beginner', time: '12 min', progress: 65, tone: 'yellow' },
  { title: 'SQL Aggregations Guide', topic: 'SQL', difficulty: 'Intermediate', time: '18 min', progress: 40, tone: 'blue' },
  { title: 'Excel Formulas Cheat Sheet', topic: 'Excel', difficulty: 'Beginner', time: '10 min', progress: 20, tone: 'sage' },
  { title: 'Aptitude Percentages Notes', topic: 'Aptitude', difficulty: 'Intermediate', time: '15 min', progress: 55, tone: 'pink' },
  { title: 'Resume Keywords Guide', topic: 'Resume', difficulty: 'All levels', time: '8 min', progress: 30, tone: 'lavender' },
];

export default function MaterialsPage() {
  const [pill, setPill] = useState('Python');

  return (
    <CodeQuestPage
      activeKey="materials"
      rightPanel={
        <>
          <SimpleListPanel title="Continue Reading" items={['SQL Aggregations Guide', 'Beginner Python Notes']} />
          <SimpleListPanel title="Saved Notes" items={['Python Loops summary', 'JOINs reference sheet']} />
        </>
      }
    >
      <CodeQuestTopHeader
        title="Study Materials"
        subtitle="Review notes, guides, and reference sheets across your Code Quest learning tracks."
        pills={['Python', 'SQL', 'Excel', 'Power BI', 'Aptitude', 'Resume']}
        activePill={pill}
        onPillChange={setPill}
        searchPlaceholder="Search study materials..."
      />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.map((m) => (
          <CQCard key={m.title} tone={m.tone} className="flex flex-col gap-3 min-h-[145px]">
            <h3 className="text-sm font-semibold">{m.title}</h3>
            <p className="text-[13px] text-slate">{m.topic} · {m.difficulty} · {m.time} read</p>
            <CQProgressBar value={m.progress} />
            <CQActionButton variant="ghost" className="self-start">Open Material</CQActionButton>
          </CQCard>
        ))}
      </section>
    </CodeQuestPage>
  );
}
