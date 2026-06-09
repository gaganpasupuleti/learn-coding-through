import { CodeEditor } from '@/components/CodeEditor'
import { CODE_PRACTICE_LANGUAGE_MODES, type CodePracticeEditorTheme } from '../types/codePractice.types'

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
    <div className="flex h-full min-h-0 flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2.5">
        <span className="text-sm font-medium text-slate-300">{label} · editor</span>
        <span className="text-xs text-slate-500">Monaco</span>
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
          fontSize={15}
          lineHeight={24}
        />
      </div>
    </div>
  )
}
