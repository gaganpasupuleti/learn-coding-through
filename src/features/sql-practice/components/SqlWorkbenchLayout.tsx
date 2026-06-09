import type { ReactNode } from 'react'

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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-950 text-slate-100">
      {toolbar}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(200px,240px)_1fr_minmax(220px,280px)]">
        <div className="min-h-[180px] lg:min-h-0">{schemaPanel}</div>
        <div className="min-h-[280px] border-x border-slate-800 lg:min-h-0">{editorPanel}</div>
        <div className="min-h-[180px] lg:min-h-0">{questionPanel}</div>
      </div>
      {bottomPanel}
    </div>
  )
}
