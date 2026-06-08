import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-950 text-slate-100">
      {toolbar}
      {questionPicker}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(220px,280px)_1fr_minmax(220px,300px)]">
        <div className="min-h-[200px] lg:min-h-0">{problemPanel}</div>

        <div className="flex min-h-[320px] flex-col border-x border-slate-800 lg:min-h-0">
          <div className="min-h-0 flex-1">{editorPanel}</div>
          {livePreview && (
            <div className="border-t border-slate-800 p-3 lg:hidden">{livePreview}</div>
          )}
        </div>

        <div className="flex min-h-[200px] flex-col lg:min-h-0">
          {livePreview && (
            <div className="hidden border-b border-slate-800 p-3 lg:block">{livePreview}</div>
          )}
          <div className="min-h-0 flex-1">{outputPanel}</div>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950">
        <div className="flex gap-1 border-b border-slate-800 px-2">
          {BOTTOM_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBottomTab(tab.id)}
              className={cn(
                'px-3 py-2 text-xs font-medium transition-colors',
                bottomTab === tab.id
                  ? 'border-b-2 border-sky-500 text-sky-300'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="max-h-44 overflow-y-auto">
          {bottomTab === 'tests' && testResults}
          {bottomTab === 'hints' && hints}
          {bottomTab === 'mistakes' && mistakes}
          {bottomTab === 'history' && attemptHistory}
        </div>
      </div>
    </div>
  )
}
