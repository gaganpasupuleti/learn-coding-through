import { MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { WORKFLOW_STAGE_STORAGE_KEY, workflowStageMeta } from '../constants'
import type { StudentWorkflowStage } from '../types'

import {
  adminPaneScrollBodyClass,
  adminSectionRootClass,
  adminToolbarClass,
  vizTileClass,
} from './dashboardPolish'

const BOARD_STAGES: StudentWorkflowStage[] = ['new', 'enrolled', 'in_progress', 'needs_attention']

export function BoardView() {
  const {
    boardQuery,
    setBoardQuery,
    workflowColumns,
    selectedStudentId,
    setSelectedStudentId,
    setDraggedStudentId,
    setDragOverStage,
    dragOverStage,
    handleDropToStage,
    setManualWorkflowStages,
  } = useAdminWorkspaceContext()

  const renderBoardColumn = (stage: StudentWorkflowStage) => {
    const column = workflowColumns[stage]
    const meta = workflowStageMeta[stage]

    return (
      <div
        key={stage}
        className={cn(
          vizTileClass,
          'flex min-h-0 min-w-0 flex-col overflow-hidden p-2 transition',
          dragOverStage === stage ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : '',
        )}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOverStage(stage)
        }}
        onDragLeave={() => setDragOverStage((current) => (current === stage ? null : current))}
        onDrop={(event) => {
          event.preventDefault()
          handleDropToStage(stage)
        }}
      >
        <div className="shrink-0 space-y-0.5 border-b border-slate-200/80 pb-2 dark:border-border">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-xs font-semibold tracking-tight text-slate-900 dark:text-foreground">{meta.title}</p>
            <span className="shrink-0 text-[10px] font-medium tabular-nums text-muted-foreground">{column.length}</span>
          </div>
          <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">{meta.hint}</p>
        </div>

        <div className={cn(adminPaneScrollBodyClass, 'space-y-2')}>
          {column.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => setSelectedStudentId(student.id)}
              draggable
              onDragStart={(event) => {
                setDraggedStudentId(student.id)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', String(student.id))
              }}
              onDragEnd={() => {
                setDraggedStudentId(null)
                setDragOverStage(null)
              }}
              className={cn(
                'w-full cursor-move rounded-md border bg-background p-2 text-left text-xs transition',
                selectedStudentId === student.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30',
              )}
            >
              <p className="truncate font-semibold tracking-tight text-slate-900 dark:text-foreground">{student.full_name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{student.email}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {student.batch_name || student.cohort_name || 'Unassigned'} · XP {student.xp_points}
              </p>
            </button>
          ))}
          {column.length === 0 && <p className="text-[10px] text-muted-foreground">Drop student cards here</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={adminSectionRootClass}>
      <div className={adminToolbarClass}>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-muted-foreground">Workflow</p>
          <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-foreground">Student board</h2>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="relative">
            <MagnifyingGlass
              size={14}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={boardQuery}
              onChange={(event) => setBoardQuery(event.target.value)}
              placeholder="Filter…"
              className="h-8 w-[11rem] pl-7 text-xs sm:w-[14rem]"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setManualWorkflowStages({})
              localStorage.removeItem(WORKFLOW_STAGE_STORAGE_KEY)
              toast.success('Workflow board reset.')
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden sm:grid-cols-2 xl:grid-cols-4 xl:grid-rows-1">
        {BOARD_STAGES.map(renderBoardColumn)}
      </div>
    </div>
  )
}
