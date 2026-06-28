import CodeQuestShell from './CodeQuestShell';
import CodeQuestSidebar from './CodeQuestSidebar';
import CodeQuestRightPanel from './CodeQuestRightPanel';

export default function CodeQuestPage({ activeKey, rightPanel, children }) {
  const panel = rightPanel ? <CodeQuestRightPanel>{rightPanel}</CodeQuestRightPanel> : null;

  return (
    <CodeQuestShell
      sidebar={<CodeQuestSidebar activeKey={activeKey} />}
      main={
        <main className="min-w-0 max-lg:overflow-visible lg:overflow-y-auto p-5 xl:p-6">
          <div className="w-full max-w-none flex flex-col gap-5">{children}</div>
        </main>
      }
      rightPanel={panel}
    />
  );
}
