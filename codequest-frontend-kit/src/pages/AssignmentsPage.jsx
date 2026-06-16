import CodeQuestPage from '../components/layout/CodeQuestPage';
import CodeQuestTopHeader from '../components/layout/CodeQuestTopHeader';
import CQStatCard from '../components/ui/CQStatCard';
import CQListRow from '../components/ui/CQListRow';
import CQActionButton from '../components/ui/CQActionButton';
import { SimpleListPanel } from '../components/panels/SharedPanels';

const assignments = [
  { title: 'Python List Practice', due: 'Due today', tag: 'Python', status: 'Pending', badgeVariant: 'soon', dot: 'bg-gold' },
  { title: 'SQL Joins Worksheet', due: 'Due tomorrow', tag: 'SQL', status: 'Pending', badgeVariant: 'pending', dot: 'bg-slate/50' },
  { title: 'Aptitude Percentage Quiz', due: 'Due Friday', tag: 'Aptitude', status: 'Submitted', badgeVariant: 'pending', dot: 'bg-progress' },
  { title: 'Resume Project Summary', due: 'Due Monday', tag: 'Resume', status: 'Reviewed', badgeVariant: 'pending', dot: 'bg-gold' },
];

export default function AssignmentsPage() {
  return (
    <CodeQuestPage
      activeKey="assignments"
      rightPanel={
        <>
          <SimpleListPanel title="Due Today" items={['Python List Practice']} />
          <SimpleListPanel title="Upcoming Deadlines" items={['SQL Joins Worksheet', 'Aptitude Percentage Quiz']} />
        </>
      }
    >
      <CodeQuestTopHeader
        title="Assignments"
        subtitle="Track pending work, submissions, reviews, and upcoming deadlines across your learning plan."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CQStatCard label="Pending" value="2" tone="yellow" />
        <CQStatCard label="Submitted" value="1" tone="blue" />
        <CQStatCard label="Reviewed" value="1" tone="sage" />
        <CQStatCard label="Overdue" value="0" tone="pink" />
      </section>

      <div className="flex flex-col gap-2">
        {assignments.map((a) => (
          <CQListRow
            key={a.title}
            dotColor={a.dot}
            title={a.title}
            meta={`${a.due} · ${a.tag}`}
            badge={a.status}
            badgeVariant={a.badgeVariant}
            action={<CQActionButton variant="ghost" className="px-3 py-1 text-[11px] shrink-0">Open</CQActionButton>}
          />
        ))}
      </div>
    </CodeQuestPage>
  );
}
