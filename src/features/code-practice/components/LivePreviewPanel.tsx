import { Eye } from 'lucide-react'
import type { CodePracticeLanguageMode } from '../types/codePractice.types'

interface LivePreviewPanelProps {
  language: CodePracticeLanguageMode
}

export function LivePreviewPanel({ language }: LivePreviewPanelProps) {
  const isReact = language === 'react'

  return (
    <div className="rounded-md border border-dashed border-slate-700 bg-slate-900/50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Eye className="h-3.5 w-3.5 text-violet-400" />
        Live preview
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
        {isReact
          ? 'Live React preview will be connected in Phase 3 using Sandpack.'
          : 'Live preview is available for React / frontend sandbox mode in Phase 3.'}
      </p>
      {isReact && (
        <div className="mt-3 rounded border border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-600">
          Component preview area
        </div>
      )}
    </div>
  )
}
