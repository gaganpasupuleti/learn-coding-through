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
    <div className="flex h-full min-h-[240px] flex-col bg-slate-950">
      <div className="border-b border-slate-800 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-600">
        SQL Editor
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-200 outline-none"
        aria-label="SQL editor placeholder"
      />
    </div>
  )
}

export { STARTER_SQL }
