import { CodeEditor } from '@/components/CodeEditor'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlEditorPanelProps {
  sql: string
  onChange: (sql: string) => void
}

export function SqlEditorPanel({ sql, onChange }: SqlEditorPanelProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col', wb.editor)}>
      <div className={cn('flex items-center justify-between border-b px-4 py-3', wb.border, 'bg-[#252526]')}>
        <span className={cn('text-sm font-semibold', wb.textPrimary)}>Query Editor</span>
        <span className={cn('text-xs', wb.textMuted)}>SQL · Monaco</span>
      </div>
      <div className="sql-practice-editor min-h-0 flex-1 overflow-hidden">
        <CodeEditor
          code={sql}
          onChange={onChange}
          language="sql"
          monacoTheme="vs-dark"
          showExecutionControls={false}
          showOutputPanel={false}
          showEditorChrome={false}
          fontSize={16}
          lineHeight={26}
        />
      </div>
    </div>
  )
}
