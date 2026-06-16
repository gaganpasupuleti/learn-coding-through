/** Approved Code Quest shell — matches locked /progress baseline layout. */
export default function CodeQuestShell({ sidebar, main, rightPanel }) {
  const gridCols = rightPanel
    ? 'lg:grid-cols-[240px_minmax(0,1fr)_310px]'
    : 'lg:grid-cols-[240px_minmax(0,1fr)]';

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-cream p-4 font-sans text-charcoal antialiased">
      <div
        className={`grid min-h-[calc(100vh-32px)] w-full grid-cols-1 overflow-hidden overflow-x-hidden rounded-shell border border-slate/20 bg-cream-soft shadow-shell ${gridCols}`}
      >
        {sidebar}
        {main}
        {rightPanel}
      </div>
    </div>
  );
}
