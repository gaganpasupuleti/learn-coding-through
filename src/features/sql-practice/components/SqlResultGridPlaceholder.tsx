import { useState } from 'react'
import { cn } from '@/lib/utils'
import { wb } from '@/lib/workbench-theme'

type BottomTab = 'results' | 'expected' | 'history' | 'mistakes'

export function SqlResultGridPlaceholder() {
  const [tab, setTab] = useState<BottomTab>('results')

  return (
    <section className={cn('border-t', wb.panel, wb.border)}>
      <div className={cn('flex gap-0.5 border-b px-3', wb.border)}>
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
              'px-4 py-3 text-sm font-medium transition-colors',
              tab === item.id
                ? 'border-b-2 border-emerald-400 bg-emerald-950/25 text-emerald-100'
                : wb.tabInactive,
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={cn('max-h-56 overflow-auto p-4 font-mono text-sm leading-relaxed', wb.textMuted)}>
        {tab === 'results' && (
          <p>Run Query is disabled. Results will appear here when sql.js execution is added (Issue #30).</p>
        )}
        {tab === 'expected' && (
          <pre className={wb.textSecondary}>
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
