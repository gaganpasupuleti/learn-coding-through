import { Eye, Plus, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { StatusBadge } from '../widgets/StatusBadge'

import {
  adminPaneCardClass,
  adminPaneHeaderClass,
  adminPaneScrollBodyClass,
  adminSectionRootClass,
} from './dashboardPolish'

export function StudentsView() {
  const {
    search,
    setSearch,
    students,
    setStudents,
    selectedStudentId,
    setSelectedStudentId,
    selectedStudent,
    createPayload,
    setCreatePayload,
    isLoading,
    loadAdminData,
    handleUpdateStudent,
    handleCreateStudent,
    handleDeleteStudent,
  } = useAdminWorkspaceContext()

  return (
    <div className={adminSectionRootClass}>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden xl:grid-cols-3 xl:grid-rows-1">
        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0')}>
          <div className={adminPaneHeaderClass}>Directory</div>
          <div className="flex shrink-0 flex-col gap-2 border-b border-slate-200/80 p-2 dark:border-border">
            <div className="flex gap-2">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search…"
                className="h-8 flex-1 text-xs"
              />
              <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 text-xs" onClick={loadAdminData} disabled={isLoading}>
                Load
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">{students.length}</span> loaded
            </p>
          </div>
          <div className={cn(adminPaneScrollBodyClass, 'space-y-2')}>
            {students.length === 0 && (
              <div className="rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-6 text-center text-[11px] text-muted-foreground">
                No students. Use <span className="font-medium text-foreground">Load</span> or create on the right.
              </div>
            )}
            {students.map((student) => (
              <div
                key={student.id}
                className={`rounded-md border p-2 transition ${selectedStudentId === student.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}
              >
                <button type="button" className="w-full text-left" onClick={() => setSelectedStudentId(student.id)}>
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-xs font-semibold">{student.full_name}</p>
                    {!student.is_active && <StatusBadge text="Inactive" variant="danger" />}
                  </div>
                  <p className="truncate text-[10px] text-muted-foreground">{student.email}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {student.role} · {student.batch_name || 'No batch'} · XP {student.xp_points}
                  </p>
                </button>
                <div className="mt-1.5 flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelectedStudentId(student.id)}>
                    <Eye size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteStudent(student.id)}
                    disabled={isLoading}
                  >
                    <Trash size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0')}>
          <div className={adminPaneHeaderClass}>Edit student</div>
          <div className={adminPaneScrollBodyClass}>
            {!selectedStudent && <p className="text-[11px] text-muted-foreground">Select a student from the directory.</p>}
            {selectedStudent && (
              <div className="space-y-2">
                <Input
                  value={selectedStudent.full_name}
                  onChange={(event) =>
                    setStudents((prev) =>
                      prev.map((item) => (item.id === selectedStudent.id ? { ...item, full_name: event.target.value } : item)),
                    )
                  }
                  placeholder="Full name"
                  className="h-8 text-xs"
                />
                <Input
                  value={selectedStudent.role}
                  onChange={(event) =>
                    setStudents((prev) =>
                      prev.map((item) => (item.id === selectedStudent.id ? { ...item, role: event.target.value } : item)),
                    )
                  }
                  placeholder="Role"
                  className="h-8 text-xs"
                />
                <Input
                  value={String(selectedStudent.credit_balance)}
                  onChange={(event) =>
                    setStudents((prev) =>
                      prev.map((item) =>
                        item.id === selectedStudent.id ? { ...item, credit_balance: Number(event.target.value || 0) } : item,
                      ),
                    )
                  }
                  placeholder="Credits"
                  type="number"
                  className="h-8 text-xs"
                />
                <Input
                  value={String(selectedStudent.xp_points)}
                  onChange={(event) =>
                    setStudents((prev) =>
                      prev.map((item) =>
                        item.id === selectedStudent.id ? { ...item, xp_points: Number(event.target.value || 0) } : item,
                      ),
                    )
                  }
                  placeholder="XP"
                  type="number"
                  className="h-8 text-xs"
                />
                <Input
                  value={selectedStudent.cohort_name ?? ''}
                  onChange={(event) =>
                    setStudents((prev) =>
                      prev.map((item) =>
                        item.id === selectedStudent.id ? { ...item, cohort_name: event.target.value || null } : item,
                      ),
                    )
                  }
                  placeholder="Cohort"
                  className="h-8 text-xs"
                />
                <Input
                  value={selectedStudent.batch_name ?? ''}
                  onChange={(event) =>
                    setStudents((prev) =>
                      prev.map((item) =>
                        item.id === selectedStudent.id ? { ...item, batch_name: event.target.value || null } : item,
                      ),
                    )
                  }
                  placeholder="Batch"
                  className="h-8 text-xs"
                />
                <label className="flex items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    checked={selectedStudent.is_active}
                    onChange={(event) =>
                      setStudents((prev) =>
                        prev.map((item) =>
                          item.id === selectedStudent.id ? { ...item, is_active: event.target.checked } : item,
                        ),
                      )
                    }
                  />
                  Active
                </label>
                <Button type="button" size="sm" className="h-8 w-full text-xs" onClick={handleUpdateStudent} disabled={isLoading}>
                  Save
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0')}>
          <div className={adminPaneHeaderClass}>Create student</div>
          <div className={adminPaneScrollBodyClass}>
            <div className="space-y-2">
              <Input
                value={createPayload.full_name}
                onChange={(event) => setCreatePayload((prev) => ({ ...prev, full_name: event.target.value }))}
                placeholder="Full name"
                className="h-8 text-xs"
              />
              <Input
                value={createPayload.email}
                onChange={(event) => setCreatePayload((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email"
                type="email"
                className="h-8 text-xs"
              />
              <Input
                value={createPayload.password}
                onChange={(event) => setCreatePayload((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Password"
                type="password"
                className="h-8 text-xs"
              />
              <Input
                value={createPayload.role}
                onChange={(event) => setCreatePayload((prev) => ({ ...prev, role: event.target.value }))}
                placeholder="Role"
                className="h-8 text-xs"
              />
              <Input
                value={String(createPayload.credit_balance)}
                onChange={(event) => setCreatePayload((prev) => ({ ...prev, credit_balance: Number(event.target.value || 0) }))}
                placeholder="Credits"
                type="number"
                className="h-8 text-xs"
              />
              <Input
                value={String(createPayload.xp_points)}
                onChange={(event) => setCreatePayload((prev) => ({ ...prev, xp_points: Number(event.target.value || 0) }))}
                placeholder="XP"
                type="number"
                className="h-8 text-xs"
              />
              <Input
                value={createPayload.cohort_name ?? ''}
                onChange={(event) => setCreatePayload((prev) => ({ ...prev, cohort_name: event.target.value || null }))}
                placeholder="Cohort"
                className="h-8 text-xs"
              />
              <Input
                value={createPayload.batch_name ?? ''}
                onChange={(event) => setCreatePayload((prev) => ({ ...prev, batch_name: event.target.value || null }))}
                placeholder="Batch"
                className="h-8 text-xs"
              />
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={createPayload.is_active}
                  onChange={(event) => setCreatePayload((prev) => ({ ...prev, is_active: event.target.checked }))}
                />
                Active
              </label>
              <Button type="button" size="sm" className="h-8 w-full text-xs" onClick={handleCreateStudent} disabled={isLoading}>
                <Plus size={14} className="mr-1" /> Create
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
