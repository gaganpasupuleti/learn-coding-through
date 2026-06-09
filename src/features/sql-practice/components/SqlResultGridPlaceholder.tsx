import { useState } from 'react'
import { cn } from '@/lib/utils'

type BottomTab = 'results' | 'expected' | 'history' | 'mistakes'

export function SqlResultGridPlaceholder() {
  const [tab, setTab] = useState<BottomTab>('results')

  return (
    <section className="border-t border-slate-800 bg-slate-950">
      <div className="flex gap-1 border-b border-slate-800 px-3">
        {(
          [
            { id: 'results' as const, label: 'Result grid' },
            { id: 'expected' as const, label: 'Expected output' },
            { id: 'history' as const, label: 'Query history' },
            { id: 'mistakes' as const, label: 'Old SQL mistakes' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'px-3.5 py-2.5 text-sm font-medium transition-colors',
              tab === item.id
                ? 'border-b-2 border-emerald-500 text-emerald-300'
                : 'text-slate-500 hover:text-slate-300',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="max-h-52 overflow-auto p-4 font-mono text-sm leading-relaxed text-slate-500">
        {tab === 'results' && (
          <p>Run Query is disabled. Results will appear here when sql.js execution is added (Issue #30).</p>
        )}
        {tab === 'expected' && (
          <pre className="text-slate-400">
{`name          | department_id
--------------+--------------
(placeholder sample rows)`}
          </pre>
        )}
        {tab === 'history' && <p>No queries run yet.</p>}
        {tab === 'mistakes' && (
          <p>SQL mistake tracking will connect here in Issue #30. Legacy practice hub mistakes are not shown.</p>
        )}
      </div>
    </section>
  )
}
