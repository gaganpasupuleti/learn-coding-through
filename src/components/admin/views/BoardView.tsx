import { MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { WORKFLOW_STAGE_STORAGE_KEY, workflowStageMeta } from '../constants'
import type { StudentWorkflowStage } from '../types'

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
        className={`rounded-lg border p-3 space-y-3 transition ${dragOverStage === stage ? 'bg-primary/10 border-primary' : 'bg-muted/20'}`}
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
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-tight">{meta.title}</p>
          <span className="text-xs text-muted-foreground font-medium">{column.length}</span>
        </div>
        <p className="text-xs text-muted-foreground">{meta.hint}</p>

        <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
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
              className={`w-full rounded-md border bg-background p-3 text-left transition cursor-move ${selectedStudentId === student.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}
            >
              <p className="text-sm font-semibold tracking-tight">{student.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{student.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Batch: {student.batch_name || student.cohort_name || 'Unassigned'} · XP: {student.xp_points}
              </p>
            </button>
          ))}
          {column.length === 0 && <p className="text-xs text-muted-foreground">Drop student cards here</p>}
        </div>
      </div>
    )
  }

  return (
    <Card className="admin-surface admin-bento-tile space-y-4 rounded-3xl p-4 md:p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Student Workflow Board</h3>
          <p className="text-sm text-muted-foreground">Jira-style board with drag-and-drop columns</p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={boardQuery}
              onChange={(event) => setBoardQuery(event.target.value)}
              placeholder="Filter students"
              className="pl-8 w-[220px]"
            />
          </div>
          <Button
            variant="outline"
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

      <div className="grid gap-3 xl:grid-cols-4">{BOARD_STAGES.map(renderBoardColumn)}</div>
    </Card>
  )
}
