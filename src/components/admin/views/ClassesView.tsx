import { Pencil, Plus, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { defaultBatchPayload } from '../constants'
import { StatusBadge } from '../widgets/StatusBadge'

import {
  adminPaneCardClass,
  adminPaneHeaderClass,
  adminPaneScrollBodyClass,
  adminSectionRootClass,
} from './dashboardPolish'

export function ClassesView() {
  const {
    batches,
    selectedBatchId,
    setSelectedBatchId,
    selectedBatch,
    classInsights,
    batchFormMode,
    setBatchFormMode,
    batchPayload,
    setBatchPayload,
    setEditingBatchId,
    isLoading,
    openClassDetail,
    handleCreateBatch,
    handleUpdateBatch,
    handleDeleteBatch,
    startEditBatch,
  } = useAdminWorkspaceContext()

  return (
    <div className={adminSectionRootClass}>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden xl:grid-cols-3 xl:grid-rows-1">
        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0')}>
          <div className={cn(adminPaneHeaderClass, 'flex items-center justify-between')}>
            <span>Batches</span>
            <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground">{batches.length} total</span>
          </div>
          <div className={cn(adminPaneScrollBodyClass, 'space-y-2')}>
            {batches.map((batch) => (
              <div
                key={batch.id}
                className={`rounded-md border p-2 transition ${selectedBatchId === batch.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    setSelectedBatchId(batch.id)
                    void openClassDetail(batch.id)
                  }}
                >
                  <p className="truncate text-xs font-semibold">{batch.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{batch.track}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {batch.days} · {batch.time_ist}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <StatusBadge text={batch.mode} />
                    <span className="text-[10px] text-muted-foreground">
                      {batch.seats_filled}/{batch.seats_total}
                    </span>
                  </div>
                </button>
                <div className="mt-1.5 flex gap-1">
                  <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={() => startEditBatch(batch)}>
                    <Pencil size={12} />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteBatch(batch.id)}
                    disabled={isLoading}
                  >
                    <Trash size={12} />
                  </Button>
                </div>
              </div>
            ))}
            {batches.length === 0 && <p className="text-[11px] text-muted-foreground">No batches.</p>}
          </div>
        </Card>

        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0')}>
          <div className={cn(adminPaneHeaderClass, 'flex items-center justify-between gap-2')}>
            <span>{batchFormMode === 'create' ? 'Create batch' : 'Edit batch'}</span>
            {batchFormMode === 'edit' && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 shrink-0 px-2 text-[10px]"
                onClick={() => {
                  setBatchFormMode('create')
                  setBatchPayload(defaultBatchPayload)
                  setEditingBatchId(null)
                }}
              >
                Cancel
              </Button>
            )}
          </div>
          <div className={adminPaneScrollBodyClass}>
            <div className="space-y-2">
              <Input
                value={batchPayload.name}
                onChange={(event) => setBatchPayload((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Batch name"
                className="h-8 text-xs"
              />
              <Input
                value={batchPayload.track}
                onChange={(event) => setBatchPayload((prev) => ({ ...prev, track: event.target.value }))}
                placeholder="Track"
                className="h-8 text-xs"
              />
              <Input
                value={batchPayload.days}
                onChange={(event) => setBatchPayload((prev) => ({ ...prev, days: event.target.value }))}
                placeholder="Days"
                className="h-8 text-xs"
              />
              <Input
                value={batchPayload.time_ist}
                onChange={(event) => setBatchPayload((prev) => ({ ...prev, time_ist: event.target.value }))}
                placeholder="Time IST"
                className="h-8 text-xs"
              />
              <div className="flex gap-2">
                <select
                  value={batchPayload.mode}
                  onChange={(event) => setBatchPayload((prev) => ({ ...prev, mode: event.target.value }))}
                  className="flex h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-xs"
                >
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <Input
                  value={String(batchPayload.seats_total)}
                  onChange={(event) => setBatchPayload((prev) => ({ ...prev, seats_total: Number(event.target.value || 30) }))}
                  placeholder="Seats"
                  type="number"
                  className="h-8 w-[5.5rem] shrink-0 text-xs"
                />
              </div>
              <Input
                value={batchPayload.start_date}
                onChange={(event) => setBatchPayload((prev) => ({ ...prev, start_date: event.target.value }))}
                placeholder="Start date"
                type="date"
                className="h-8 text-xs"
              />
              {batchFormMode === 'create' ? (
                <Button type="button" size="sm" className="h-8 w-full text-xs" onClick={handleCreateBatch} disabled={isLoading}>
                  <Plus size={14} className="mr-1" /> Create
                </Button>
              ) : (
                <Button type="button" size="sm" className="h-8 w-full text-xs" onClick={handleUpdateBatch} disabled={isLoading}>
                  Save
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0')}>
          <div className={adminPaneHeaderClass}>Class detail</div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {!selectedBatch && (
              <div className="p-2">
                <p className="text-[11px] text-muted-foreground">Select a batch.</p>
              </div>
            )}
            {selectedBatch && (
              <>
                <div className="shrink-0 space-y-1 border-b border-slate-200/80 p-2 text-[11px] dark:border-border">
                  <p>
                    <span className="text-muted-foreground">Batch:</span> <span className="font-medium">{selectedBatch.name}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Track:</span> {selectedBatch.track}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Schedule:</span> {selectedBatch.days} · {selectedBatch.time_ist}
                  </p>
                  <p className="flex flex-wrap items-center gap-1">
                    <span className="text-muted-foreground">Mode:</span> <StatusBadge text={selectedBatch.mode} />
                  </p>
                  <p>
                    <span className="text-muted-foreground">Start:</span> {selectedBatch.start_date}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Mentor:</span> {selectedBatch.mentor_name ?? '—'}
                  </p>

                  {classInsights && classInsights.attendance_pie.length > 0 && (
                    <div className="border-t border-slate-200/80 pt-2 dark:border-border">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Attendance</p>
                      <div className="flex flex-wrap gap-1">
                        {classInsights.attendance_pie.map((slice) => (
                          <div key={slice.label} className="rounded border px-1.5 py-0.5">
                            <p className="text-[9px] text-muted-foreground">{slice.label}</p>
                            <p className="text-xs font-semibold tabular-nums">{slice.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {classInsights && classInsights.project_status_pie.length > 0 && (
                    <div className="border-t border-slate-200/80 pt-2 dark:border-border">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Projects</p>
                      <div className="flex flex-wrap gap-1">
                        {classInsights.project_status_pie.map((slice) => (
                          <div key={slice.label} className="rounded border px-1.5 py-0.5">
                            <p className="text-[9px] text-muted-foreground">{slice.label}</p>
                            <p className="text-xs font-semibold tabular-nums">{slice.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-slate-200/80 dark:border-border">
                  <p className="shrink-0 border-b border-slate-200/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground dark:border-border">
                    Students in batch
                  </p>
                  <div className={cn(adminPaneScrollBodyClass, 'space-y-2')}>
                    {(classInsights?.students ?? []).map((student) => (
                      <div key={student.user_id} className="rounded-md border p-2">
                        <p className="text-xs font-semibold">{student.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {student.enrollment_role} · {student.attendance_pct}% · {student.project_status}
                        </p>
                      </div>
                    ))}
                    {(classInsights?.students?.length ?? 0) === 0 && (
                      <p className="text-[11px] text-muted-foreground">No roster rows for this batch.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
