import { useMemo } from 'react'
import { Eye } from 'lucide-react'
import { SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'
import type { CodePracticeLanguageMode } from '../types/codePractice.types'
import { buildSandpackAppCode } from '../utils/sandpackReact'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

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
      <div className={cn('rounded-lg border border-dashed p-4', wb.border, 'bg-[#111827]')}>
        <div className={cn('flex items-center gap-2 text-sm font-medium', wb.textSecondary)}>
          <Eye className="h-4 w-4 text-violet-300" />
          Live preview
        </div>
        <p className={cn('mt-2 text-sm leading-relaxed', wb.textMuted)}>
          Live preview is available for React practice.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex min-h-[220px] flex-col overflow-hidden rounded-lg border', wb.border, wb.panel)}>
      <div className={cn('flex items-center justify-between gap-2 border-b px-4 py-3', wb.border, 'bg-[#111827]')}>
        <div className={cn('flex items-center gap-2 text-sm font-semibold', wb.textPrimary)}>
          <Eye className="h-4 w-4 text-violet-300" />
          Live Preview
        </div>
        <span className={cn('text-xs', wb.textMuted)}>Powered by Sandpack</span>
      </div>
      {questionTitle && (
        <p className={cn('border-b px-4 py-2 text-sm truncate', wb.border, wb.textMuted)}>
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
