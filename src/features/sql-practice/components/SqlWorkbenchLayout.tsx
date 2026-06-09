import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { wb } from '@/lib/workbench-theme'

interface SqlWorkbenchLayoutProps {
  toolbar: ReactNode
  schemaPanel: ReactNode
  editorPanel: ReactNode
  questionPanel: ReactNode
  bottomPanel: ReactNode
}

export function SqlWorkbenchLayout({
  toolbar,
  schemaPanel,
  editorPanel,
  questionPanel,
  bottomPanel,
}: SqlWorkbenchLayoutProps) {
  return (
    <div className={cn('flex min-h-[calc(100vh-4rem)] flex-col', wb.root)}>
      {toolbar}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(240px,280px)_1fr_minmax(260px,320px)]">
        <div className="min-h-[220px] lg:min-h-0">{schemaPanel}</div>
        <div className={cn('min-h-[320px] border-x lg:min-h-0', wb.border)}>{editorPanel}</div>
        <div className="min-h-[220px] lg:min-h-0">{questionPanel}</div>
      </div>
      {bottomPanel}
    </div>
  )
}
