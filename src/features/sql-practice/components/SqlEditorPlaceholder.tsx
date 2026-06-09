import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

const STARTER_SQL = `-- SQL Practice Ground (Issue #30 shell)
-- Execution is not enabled yet.

SELECT name, department_id
FROM employees
LIMIT 10;
`

interface SqlEditorPlaceholderProps {
  value: string
  onChange: (value: string) => void
}

export function SqlEditorPlaceholder({ value, onChange }: SqlEditorPlaceholderProps) {
  return (
    <div className={cn('flex h-full min-h-[280px] flex-col', wb.editor)}>
      <div className={cn('border-b px-4 py-3 text-xs font-bold uppercase tracking-widest', wb.border, wb.textMuted)}>
        SQL Editor
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={cn(
          'min-h-0 flex-1 resize-none p-4 font-mono text-[16px] leading-[26px] outline-none',
          wb.editor,
          wb.textPrimary,
        )}
        aria-label="SQL editor placeholder"
      />
    </div>
  )
}

export { STARTER_SQL }
