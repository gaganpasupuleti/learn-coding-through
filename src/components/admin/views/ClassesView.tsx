import { Pencil, Plus, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { defaultBatchPayload } from '../constants'
import { StatusBadge } from '../widgets/StatusBadge'

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
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Batches</h3>
          <span className="text-xs text-muted-foreground">{batches.length} total</span>
        </div>
        <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className={`rounded-md border p-3 transition ${selectedBatchId === batch.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => {
                  setSelectedBatchId(batch.id)
                  void openClassDetail(batch.id)
                }}
              >
                <p className="text-sm font-semibold">{batch.name}</p>
                <p className="text-xs text-muted-foreground">{batch.track}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {batch.days} · {batch.time_ist}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge text={batch.mode} />
                  <span className="text-xs text-muted-foreground">
                    Seats {batch.seats_filled}/{batch.seats_total}
                  </span>
                </div>
              </button>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="ghost" onClick={() => startEditBatch(batch)}>
                  <Pencil size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteBatch(batch.id)}
                  disabled={isLoading}
                >
                  <Trash size={12} />
                </Button>
              </div>
            </div>
          ))}
          {batches.length === 0 && <p className="text-sm text-muted-foreground">No batches loaded.</p>}
        </div>
      </Card>

      <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{batchFormMode === 'create' ? 'Create Batch' : 'Edit Batch'}</h3>
          {batchFormMode === 'edit' && (
            <Button
              size="sm"
              variant="ghost"
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
        <Input
          value={batchPayload.name}
          onChange={(event) => setBatchPayload((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Batch name"
        />
        <Input
          value={batchPayload.track}
          onChange={(event) => setBatchPayload((prev) => ({ ...prev, track: event.target.value }))}
          placeholder="Track (e.g. Full Stack + DSA)"
        />
        <Input
          value={batchPayload.days}
          onChange={(event) => setBatchPayload((prev) => ({ ...prev, days: event.target.value }))}
          placeholder="Days (e.g. Mon-Wed-Fri)"
        />
        <Input
          value={batchPayload.time_ist}
          onChange={(event) => setBatchPayload((prev) => ({ ...prev, time_ist: event.target.value }))}
          placeholder="Time IST (e.g. 7:00 PM - 9:00 PM)"
        />
        <div className="flex gap-2">
          <select
            value={batchPayload.mode}
            onChange={(event) => setBatchPayload((prev) => ({ ...prev, mode: event.target.value }))}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <Input
            value={String(batchPayload.seats_total)}
            onChange={(event) => setBatchPayload((prev) => ({ ...prev, seats_total: Number(event.target.value || 30) }))}
            placeholder="Seats"
            type="number"
            className="w-[100px]"
          />
        </div>
        <Input
          value={batchPayload.start_date}
          onChange={(event) => setBatchPayload((prev) => ({ ...prev, start_date: event.target.value }))}
          placeholder="Start date (YYYY-MM-DD)"
          type="date"
        />
        {batchFormMode === 'create' ? (
          <Button onClick={handleCreateBatch} disabled={isLoading}>
            <Plus size={14} className="mr-1" /> Create Batch
          </Button>
        ) : (
          <Button onClick={handleUpdateBatch} disabled={isLoading}>
            Save Changes
          </Button>
        )}
      </Card>

      <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
        <h3 className="text-lg font-semibold">Class Detail</h3>
        {!selectedBatch && <p className="text-sm text-muted-foreground">Select a batch to view details.</p>}
        {selectedBatch && (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Batch:</span> {selectedBatch.name}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Track:</span> {selectedBatch.track}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Schedule:</span> {selectedBatch.days} · {selectedBatch.time_ist}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Mode:</span> <StatusBadge text={selectedBatch.mode} />
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Start:</span> {selectedBatch.start_date}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Mentor:</span> {selectedBatch.mentor_name ?? 'Not assigned'}
            </p>

            {classInsights && classInsights.attendance_pie.length > 0 && (
              <div className="pt-2 border-t mt-2">
                <p className="text-sm font-medium mb-2">Attendance Breakdown</p>
                <div className="flex flex-wrap gap-2">
                  {classInsights.attendance_pie.map((slice) => (
                    <div key={slice.label} className="rounded border px-2 py-1">
                      <p className="text-xs text-muted-foreground">{slice.label}</p>
                      <p className="text-sm font-semibold">{slice.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {classInsights && classInsights.project_status_pie.length > 0 && (
              <div className="pt-2 border-t mt-2">
                <p className="text-sm font-medium mb-2">Project Status</p>
                <div className="flex flex-wrap gap-2">
                  {classInsights.project_status_pie.map((slice) => (
                    <div key={slice.label} className="rounded border px-2 py-1">
                      <p className="text-xs text-muted-foreground">{slice.label}</p>
                      <p className="text-sm font-semibold">{slice.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t mt-2">
              <p className="text-sm font-medium mb-2">Students in Batch</p>
              <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
                {(classInsights?.students ?? []).map((student) => (
                  <div key={student.user_id} className="rounded-md border p-2">
                    <p className="text-sm font-semibold">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.enrollment_role} · Attendance {student.attendance_pct}% · {student.project_status}
                    </p>
                  </div>
                ))}
                {(classInsights?.students?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">Load a batch to view students.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
