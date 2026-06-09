import { CodeEditor } from '@/components/CodeEditor'
import { CODE_PRACTICE_LANGUAGE_MODES, type CodePracticeEditorTheme } from '../types/codePractice.types'
import { wb } from '@/lib/workbench-theme'

interface CodeEditorPanelProps {
  code: string
  languageId: string
  monacoLanguage: string
  editorTheme: CodePracticeEditorTheme
  onChange: (code: string) => void
}

export function CodeEditorPanel({ code, languageId, monacoLanguage, editorTheme, onChange }: CodeEditorPanelProps) {
  const label = CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === languageId)?.label ?? languageId

  return (
    <div className={`flex h-full min-h-0 flex-col ${wb.editor}`}>
      <div className={`flex items-center justify-between border-b px-4 py-3 ${wb.panelHeader} ${wb.border}`}>
        <span className={`text-sm font-medium ${wb.textSecondary}`}>{label} · editor</span>
        <span className={`text-xs ${wb.textMuted}`}>Monaco</span>
      </div>
      <div className="code-practice-editor min-h-0 flex-1 overflow-hidden">
        <CodeEditor
          code={code}
          onChange={onChange}
          language={monacoLanguage}
          monacoTheme={editorTheme}
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
