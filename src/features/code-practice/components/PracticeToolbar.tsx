import { Play, RotateCcw, Save, Send, Palette } from 'lucide-react'
import { LanguageSelector } from './LanguageSelector'
import type { CodePracticeEditorTheme, CodePracticeLanguageMode } from '../types/codePractice.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PracticeToolbarProps {
  language: CodePracticeLanguageMode
  theme: CodePracticeEditorTheme
  isRunning: boolean
  onLanguageChange: (language: CodePracticeLanguageMode) => void
  onThemeChange: (theme: CodePracticeEditorTheme) => void
  onRun: () => void
  onSubmit: () => void
  onReset: () => void
  onSaveAttempt: () => void
}

const THEMES: Array<{ id: CodePracticeEditorTheme; label: string }> = [
  { id: 'vs-dark', label: 'VS Dark' },
  { id: 'vs', label: 'VS Light' },
  { id: 'hc-black', label: 'High Contrast' },
]

const TOOLBAR_BTN =
  'inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800'

export function PracticeToolbar({
  language,
  theme: editorTheme,
  isRunning,
  onLanguageChange,
  onThemeChange,
  onRun,
  onSubmit,
  onReset,
  onSaveAttempt,
}: PracticeToolbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/90 px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-semibold uppercase tracking-wider text-sky-400">Code Workbench</span>
        <LanguageSelector
          value={language}
          onChange={onLanguageChange}
          onComingSoon={onLanguageChange}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={TOOLBAR_BTN}>
              <Palette className="h-4 w-4" />
              Theme ({editorTheme === 'vs' ? 'Light' : editorTheme === 'hc-black' ? 'HC' : 'Dark'})
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700 text-slate-200">
            {THEMES.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => onThemeChange(t.id)} className="text-sm">
                {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button type="button" onClick={onReset} className={TOOLBAR_BTN}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>

        <button type="button" onClick={onSaveAttempt} className={TOOLBAR_BTN}>
          <Save className="h-4 w-4" />
          Save attempt
        </button>

        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {isRunning ? 'Running…' : 'Run'}
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Submit
        </button>
      </div>
    </header>
  )
}
