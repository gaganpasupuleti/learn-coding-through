export function SqlQuestionPanel() {
  return (
    <aside className="flex h-full flex-col border-l border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Task
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed text-slate-300 space-y-4">
        <p className="text-base font-medium text-slate-200">List employee names</p>
        <p className="text-slate-400">
          Write a query that returns each employee&apos;s <code className="text-emerald-300">name</code> and{' '}
          <code className="text-emerald-300">department_id</code> from the sample{' '}
          <code className="text-emerald-300">employees</code> table.
        </p>
        <div className="rounded border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-500">
          Expected columns: name, department_id
        </div>
        <p className="text-sm text-amber-500/90 leading-relaxed">
          SQL Practice Ground is being rebuilt as a separate workbench under Issue #30.
        </p>
      </div>
    </aside>
  )
}
