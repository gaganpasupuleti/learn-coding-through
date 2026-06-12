import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { wb } from '@/lib/workbench-theme'

interface SqlPracticeLayoutProps {
  topBar: ReactNode
  objectExplorer: ReactNode
  editorPanel: ReactNode
  questionPanel: ReactNode
  bottomPanel: ReactNode
  statusBar: ReactNode
}

export function SqlPracticeLayout({
  topBar,
  objectExplorer,
  editorPanel,
  questionPanel,
  bottomPanel,
  statusBar,
}: SqlPracticeLayoutProps) {
  return (
    <div className={cn('flex min-h-[calc(100vh-4rem)] flex-col', wb.root)}>
      {topBar}
      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(260px,300px)_1fr_minmax(280px,340px)]">
        <div className="min-h-[240px] border-b xl:min-h-0 xl:border-b-0 xl:border-r">{objectExplorer}</div>
        <div className={cn('flex min-h-[360px] flex-col xl:min-h-0', wb.border, 'border-b xl:border-b-0')}>
          {editorPanel}
        </div>
        <div className="min-h-[240px] xl:min-h-0 xl:border-l">{questionPanel}</div>
      </div>
      {bottomPanel}
      {statusBar}
    </div>
  )
}
