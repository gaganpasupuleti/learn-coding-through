import { CodeEditor } from '@/components/CodeEditor'
import { CODE_PRACTICE_LANGUAGE_MODES } from '../types/codePractice.types'

interface CodeEditorPanelProps {
  code: string
  languageId: string
  monacoLanguage: string
  onChange: (code: string) => void
}

export function CodeEditorPanel({ code, languageId, monacoLanguage, onChange }: CodeEditorPanelProps) {
  const label = CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === languageId)?.label ?? languageId

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-3 py-2">
        <span className="text-xs font-medium text-slate-400">{label} · editor</span>
        <span className="text-[10px] text-slate-600">Monaco</span>
      </div>
      <div className="code-practice-editor min-h-0 flex-1 overflow-hidden">
        <CodeEditor
          code={code}
          onChange={onChange}
          language={monacoLanguage}
          showExecutionControls={false}
          showOutputPanel={false}
        />
      </div>
    </div>
  )
}
