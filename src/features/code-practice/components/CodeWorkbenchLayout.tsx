import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { wb } from '@/lib/workbench-theme'

type BottomTab = 'tests' | 'hints' | 'mistakes' | 'history'

interface CodeWorkbenchLayoutProps {
  toolbar: ReactNode
  problemPanel: ReactNode
  editorPanel: ReactNode
  outputPanel: ReactNode
  livePreview?: ReactNode
  testResults: ReactNode
  hints: ReactNode
  mistakes: ReactNode
  attemptHistory: ReactNode
  questionPicker?: ReactNode
}

const BOTTOM_TABS: Array<{ id: BottomTab; label: string }> = [
  { id: 'tests', label: 'Test results' },
  { id: 'hints', label: 'Hints' },
  { id: 'mistakes', label: 'Old mistakes' },
  { id: 'history', label: 'Attempt history' },
]

export function CodeWorkbenchLayout({
  toolbar,
  problemPanel,
  editorPanel,
  outputPanel,
  livePreview,
  testResults,
  hints,
  mistakes,
  attemptHistory,
  questionPicker,
}: CodeWorkbenchLayoutProps) {
  const [bottomTab, setBottomTab] = useState<BottomTab>('tests')

  return (
    <div className={cn('flex min-h-[calc(100vh-4rem)] flex-col', wb.root)}>
      {toolbar}
      {questionPicker}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(260px,320px)_1fr_minmax(260px,340px)]">
        <div className="min-h-[240px] lg:min-h-0">{problemPanel}</div>

        <div className={cn('flex min-h-[360px] flex-col border-x lg:min-h-0', wb.border)}>
          <div className="min-h-0 flex-1">{editorPanel}</div>
          {livePreview && (
            <div className={cn('border-t p-4 lg:hidden', wb.border)}>{livePreview}</div>
          )}
        </div>

        <div className="flex min-h-[240px] flex-col lg:min-h-0">
          {livePreview && (
            <div className={cn('hidden border-b p-4 lg:block', wb.border)}>{livePreview}</div>
          )}
          <div className="min-h-0 flex-1">{outputPanel}</div>
        </div>
      </div>

      <div className={cn('border-t', wb.panel, wb.border)}>
        <div className={cn('flex gap-0.5 border-b px-3', wb.border)}>
          {BOTTOM_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBottomTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium transition-colors',
                bottomTab === tab.id ? wb.tabActive : wb.tabInactive,
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="max-h-56 overflow-y-auto">
          {bottomTab === 'tests' && testResults}
          {bottomTab === 'hints' && hints}
          {bottomTab === 'mistakes' && mistakes}
          {bottomTab === 'history' && attemptHistory}
        </div>
      </div>
    </div>
  )
}
