import { useMemo } from 'react'
import { Eye } from 'lucide-react'
import { SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'
import type { CodePracticeLanguageMode } from '../types/codePractice.types'
import { buildSandpackAppCode } from '../utils/sandpackReact'

interface LivePreviewPanelProps {
  language: CodePracticeLanguageMode
  code: string
  questionTitle?: string
}

export function LivePreviewPanel({ language, code, questionTitle }: LivePreviewPanelProps) {
  const isReact = language === 'react'

  const sandpackFiles = useMemo(() => {
    if (!isReact) return null
    return {
      '/App.js': {
        code: buildSandpackAppCode(code),
        active: true,
      },
    }
  }, [code, isReact])

  if (!isReact) {
    return (
      <div className="rounded-md border border-dashed border-slate-700 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <Eye className="h-4 w-4 text-violet-400" />
          Live preview
        </div>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Live preview is available for React practice.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[220px] flex-col rounded-md border border-slate-800 bg-slate-950 overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Eye className="h-4 w-4 text-violet-400" />
          Live Preview
        </div>
        <span className="text-xs text-slate-500">Powered by Sandpack</span>
      </div>
      {questionTitle && (
        <p className="border-b border-slate-800 px-4 py-2 text-xs text-slate-500 truncate">
          {questionTitle}
        </p>
      )}
      <div className="min-h-[180px] flex-1 [&_.sp-preview-container]:!rounded-none [&_.sp-preview-iframe]:!bg-white">
        <SandpackProvider
          template="react"
          theme="dark"
          files={sandpackFiles ?? undefined}
          options={{
            autorun: true,
            recompileMode: 'immediate',
            recompileDelay: 300,
          }}
        >
          <SandpackPreview
            showNavigator={false}
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
          />
        </SandpackProvider>
      </div>
    </div>
  )
}
