export default function CodeQuestRightPanel({ children }) {
  if (!children) return null;
  return (
    <aside className="flex flex-col gap-5 min-w-0 w-full shrink-0 overflow-x-hidden max-lg:overflow-visible lg:overflow-y-auto lg:min-h-0 p-4 lg:p-5 max-lg:border-t max-lg:border-slate/20 lg:border-t-0 lg:border-l lg:border-slate/20">
      {children}
    </aside>
  );
}
