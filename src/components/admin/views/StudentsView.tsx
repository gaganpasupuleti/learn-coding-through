import { Eye, Plus, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { StatusBadge } from '../widgets/StatusBadge'

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
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
        <div className="flex items-center gap-2">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" />
          <Button variant="outline" onClick={loadAdminData} disabled={isLoading}>
            Search
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {students.length} student{students.length !== 1 ? 's' : ''} loaded
        </p>
        <div className="space-y-2 max-h-[600px] overflow-auto pr-1">
          {students.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              No students loaded. Use <span className="font-medium text-foreground">Search</span> to refresh from the
              API, or create one in the panel on the right.
            </div>
          )}
          {students.map((student) => (
            <div
              key={student.id}
              className={`rounded-md border p-3 transition ${selectedStudentId === student.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}
            >
              <button type="button" className="w-full text-left" onClick={() => setSelectedStudentId(student.id)}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{student.full_name}</p>
                  {!student.is_active && <StatusBadge text="Inactive" variant="danger" />}
                </div>
                <p className="text-xs text-muted-foreground">{student.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {student.role} · {student.batch_name || 'No batch'} · XP {student.xp_points}
                </p>
              </button>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="ghost" onClick={() => setSelectedStudentId(student.id)}>
                  <Eye size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
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

      <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
        <h3 className="text-lg font-semibold">Edit Student</h3>
        {!selectedStudent && <p className="text-sm text-muted-foreground">Select a student from left panel.</p>}
        {selectedStudent && (
          <div className="space-y-3">
            <Input
              value={selectedStudent.full_name}
              onChange={(event) =>
                setStudents((prev) =>
                  prev.map((item) => (item.id === selectedStudent.id ? { ...item, full_name: event.target.value } : item)),
                )
              }
              placeholder="Full name"
            />
            <Input
              value={selectedStudent.role}
              onChange={(event) =>
                setStudents((prev) =>
                  prev.map((item) => (item.id === selectedStudent.id ? { ...item, role: event.target.value } : item)),
                )
              }
              placeholder="Role"
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
            />
            <label className="flex items-center gap-2 text-sm">
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
            <Button onClick={handleUpdateStudent} disabled={isLoading}>
              Save Changes
            </Button>
          </div>
        )}
      </Card>

      <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
        <h3 className="text-lg font-semibold">Create Student</h3>
        <Input
          value={createPayload.full_name}
          onChange={(event) => setCreatePayload((prev) => ({ ...prev, full_name: event.target.value }))}
          placeholder="Full name"
        />
        <Input
          value={createPayload.email}
          onChange={(event) => setCreatePayload((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="Email"
          type="email"
        />
        <Input
          value={createPayload.password}
          onChange={(event) => setCreatePayload((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="Password"
          type="password"
        />
        <Input
          value={createPayload.role}
          onChange={(event) => setCreatePayload((prev) => ({ ...prev, role: event.target.value }))}
          placeholder="Role"
        />
        <Input
          value={String(createPayload.credit_balance)}
          onChange={(event) => setCreatePayload((prev) => ({ ...prev, credit_balance: Number(event.target.value || 0) }))}
          placeholder="Credits"
          type="number"
        />
        <Input
          value={String(createPayload.xp_points)}
          onChange={(event) => setCreatePayload((prev) => ({ ...prev, xp_points: Number(event.target.value || 0) }))}
          placeholder="XP"
          type="number"
        />
        <Input
          value={createPayload.cohort_name ?? ''}
          onChange={(event) => setCreatePayload((prev) => ({ ...prev, cohort_name: event.target.value || null }))}
          placeholder="Cohort"
        />
        <Input
          value={createPayload.batch_name ?? ''}
          onChange={(event) => setCreatePayload((prev) => ({ ...prev, batch_name: event.target.value || null }))}
          placeholder="Batch"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={createPayload.is_active}
            onChange={(event) => setCreatePayload((prev) => ({ ...prev, is_active: event.target.checked }))}
          />
          Active
        </label>
        <Button onClick={handleCreateStudent} disabled={isLoading}>
          <Plus size={14} className="mr-1" /> Create Student
        </Button>
      </Card>
    </div>
  )
}
