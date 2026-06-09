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
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(220px,260px)_1fr_minmax(240px,300px)]">
        <div className="min-h-[200px] lg:min-h-0">{schemaPanel}</div>
        <div className="min-h-[300px] border-x border-slate-800 lg:min-h-0">{editorPanel}</div>
        <div className="min-h-[200px] lg:min-h-0">{questionPanel}</div>
      </div>
      {bottomPanel}
    </div>
  )
}
