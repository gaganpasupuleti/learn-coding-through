import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { CodeEditor } from '@/components/CodeEditor'
import {
  CODE_PRACTICE_LANGUAGE_MODES,
  type CodePracticeEditorTheme,
  type CodePracticeLanguageMode,
} from '../types/codePractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

const FONT_STORAGE_KEY = 'codequest-workbench-editor-font'

type EditorFontPreset = 'small' | 'medium' | 'large'

const FONT_PRESETS: Record<EditorFontPreset, { fontSize: number; lineHeight: number; label: string }> = {
  small: { fontSize: 14, lineHeight: 22, label: 'Small' },
  medium: { fontSize: 16, lineHeight: 26, label: 'Medium' },
  large: { fontSize: 18, lineHeight: 30, label: 'Large' },
}

function readFontPreset(): EditorFontPreset {
  if (typeof window === 'undefined') return 'medium'
  const stored = window.localStorage.getItem(FONT_STORAGE_KEY)
  if (stored === 'small' || stored === 'medium' || stored === 'large') return stored
  return 'medium'
}

interface CodeEditorPanelProps {
  code: string
  languageId: string
  monacoLanguage: string
  editorTheme: CodePracticeEditorTheme
  onChange: (code: string) => void
}

export function CodeEditorPanel({ code, languageId, monacoLanguage, editorTheme, onChange }: CodeEditorPanelProps) {
  const label = CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === languageId)?.label ?? languageId
  const practiceLanguage = languageId as CodePracticeLanguageMode
  const suggestionsActive = ['python', 'javascript', 'react', 'java'].includes(languageId)

  const [fontPreset, setFontPreset] = useState<EditorFontPreset>(readFontPreset)
  const { fontSize, lineHeight } = FONT_PRESETS[fontPreset]

  useEffect(() => {
    window.localStorage.setItem(FONT_STORAGE_KEY, fontPreset)
  }, [fontPreset])

  return (
    <div className={`flex h-full min-h-0 flex-col ${wb.editor}`}>
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 ${wb.panelHeader} ${wb.border}`}>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className={`text-sm font-semibold ${wb.textPrimary}`}>{label} · editor</span>
          {suggestionsActive && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-700/50 bg-sky-950/40 px-2.5 py-1 text-xs text-sky-200"
              title="Rule-based suggestions work offline — no AI"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-300" aria-hidden />
              Suggestions enabled
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn('hidden text-xs sm:inline', wb.textMuted)} title="Open suggestion list">
            Ctrl+Space for suggestions · offline rules
          </span>
          <div className="flex items-center gap-1 rounded-md border border-[#26324A] bg-[#111827] p-0.5">
            {(Object.keys(FONT_PRESETS) as EditorFontPreset[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFontPreset(key)}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                  fontPreset === key
                    ? 'bg-sky-600 text-white'
                    : cn(wb.textMuted, 'hover:bg-[#1a2332] hover:text-[#CBD5E1]'),
                )}
              >
                {FONT_PRESETS[key].label}
              </button>
            ))}
          </div>
        </div>
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
          fontSize={fontSize}
          lineHeight={lineHeight}
          enablePracticeSuggestions={suggestionsActive}
          practiceLanguage={practiceLanguage}
        />
      </div>
    </div>
  )
}
