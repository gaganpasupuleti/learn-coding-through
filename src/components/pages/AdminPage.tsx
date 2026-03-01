import { useEffect, useMemo, useState } from 'react'
import {
  Briefcase,
  CalendarBlank,
  ChartBar,
  ClockCounterClockwise,
  Kanban,
  MagnifyingGlass,
  UsersThree,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AdminActivityLog,
  AdminBatch,
  AdminClassInsights,
  AdminJobCreatePayload,
  AdminJobPost,
  AdminMetrics,
  AdminMonthlyKpis,
  AdminRoleSplitInsights,
  AdminStudent,
  AdminStudentCreatePayload,
  createAdminJob,
  createAdminStudent,
  fetchAdminActivity,
  fetchAdminBatches,
  fetchAdminClassInsights,
  fetchAdminJobs,
  fetchAdminMetrics,
  fetchAdminMonthlyKpis,
  fetchAdminRoleSplitInsights,
  fetchDatabaseHealth,
  fetchAdminStudents,
  updateAdminStudent,
} from '@/lib/api'
import { getAuthToken } from '@/lib/auth'

type AdminSection = 'dashboard' | 'board' | 'students' | 'classes' | 'jobs' | 'activity'
type StudentWorkflowStage = 'new' | 'enrolled' | 'in_progress' | 'needs_attention'

const WORKFLOW_STAGE_STORAGE_KEY = 'admin-student-workflow-stages'

const workflowStageMeta: Record<StudentWorkflowStage, { title: string; hint: string }> = {
  new: { title: 'New Enquiries', hint: 'Fresh students with no assignment yet' },
  enrolled: { title: 'Enrolled', hint: 'Assigned to class and onboarding' },
  in_progress: { title: 'In Progress', hint: 'Actively learning and progressing' },
  needs_attention: { title: 'Needs Attention', hint: 'Inactive or blocked students' },
}

const defaultCreatePayload: AdminStudentCreatePayload = {
  email: '',
  full_name: '',
  password: '',
  role: 'student',
  xp_points: 0,
  streak_days: 0,
  credit_balance: 100,
  selected_role_id: null,
  cohort_name: null,
  batch_name: null,
  is_active: true,
}

const defaultJobPayload: AdminJobCreatePayload = {
  title: '',
  company_name: '',
  location: '',
  employment_type: 'Full-time',
  description: '',
  eligible_batch_id: null,
}

function resolveStudentWorkflowStage(student: AdminStudent): StudentWorkflowStage {
  const hasBatchAssignment = Boolean(student.batch_name || student.cohort_name)

  if (!student.is_active) {
    return 'needs_attention'
  }

  if (!hasBatchAssignment) {
    return 'new'
  }

  if ((student.xp_points ?? 0) >= 100) {
    return 'in_progress'
  }

  return 'enrolled'
}

const sectionTitle: Record<AdminSection, string> = {
  dashboard: 'Executive Dashboard',
  board: 'Workflow Board',
  students: 'Students',
  classes: 'Classes & Timings',
  jobs: 'Job Portal',
  activity: 'Admin Activity',
}

export function AdminPage() {
  const [section, setSection] = useState<AdminSection>('dashboard')
  const [token, setToken] = useState(() => getAuthToken() ?? '')
  const [search, setSearch] = useState('')
  const [boardQuery, setBoardQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [students, setStudents] = useState<AdminStudent[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [manualWorkflowStages, setManualWorkflowStages] = useState<Record<number, StudentWorkflowStage>>({})
  const [draggedStudentId, setDraggedStudentId] = useState<number | null>(null)
  const [dragOverStage, setDragOverStage] = useState<StudentWorkflowStage | null>(null)

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [monthlyKpis, setMonthlyKpis] = useState<AdminMonthlyKpis | null>(null)
  const [roleSplitInsights, setRoleSplitInsights] = useState<AdminRoleSplitInsights | null>(null)
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([])

  const [batches, setBatches] = useState<AdminBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)
  const [classInsights, setClassInsights] = useState<AdminClassInsights | null>(null)

  const [jobs, setJobs] = useState<AdminJobPost[]>([])
  const [jobPayload, setJobPayload] = useState<AdminJobCreatePayload>(defaultJobPayload)
  const [createPayload, setCreatePayload] = useState<AdminStudentCreatePayload>(defaultCreatePayload)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WORKFLOW_STAGE_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, StudentWorkflowStage>
      const normalized: Record<number, StudentWorkflowStage> = {}
      for (const [key, value] of Object.entries(parsed)) {
        const studentId = Number(key)
        if (!Number.isFinite(studentId)) continue
        if (!['new', 'enrolled', 'in_progress', 'needs_attention'].includes(value)) continue
        normalized[studentId] = value
      }
      setManualWorkflowStages(normalized)
    } catch {
      setManualWorkflowStages({})
    }
  }, [])

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [students, selectedStudentId]
  )

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.id === selectedBatchId) ?? null,
    [batches, selectedBatchId]
  )

  const getWorkflowStage = (student: AdminStudent): StudentWorkflowStage => {
    return manualWorkflowStages[student.id] ?? resolveStudentWorkflowStage(student)
  }

  const boardStudents = useMemo(() => {
    const query = boardQuery.trim().toLowerCase()
    if (!query) return students
    return students.filter((student) => {
      const haystack = `${student.full_name} ${student.email} ${student.batch_name ?? ''} ${student.cohort_name ?? ''}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [students, boardQuery])

  const workflowColumns = useMemo(() => {
    const columns: Record<StudentWorkflowStage, AdminStudent[]> = {
      new: [],
      enrolled: [],
      in_progress: [],
      needs_attention: [],
    }

    for (const student of boardStudents) {
      columns[getWorkflowStage(student)].push(student)
    }

    return columns
  }, [boardStudents, manualWorkflowStages])

  const moveStudentToStage = (studentId: number, stage: StudentWorkflowStage) => {
    setManualWorkflowStages((prev) => {
      const next = { ...prev, [studentId]: stage }
      localStorage.setItem(WORKFLOW_STAGE_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const handleDropToStage = (stage: StudentWorkflowStage) => {
    if (!draggedStudentId) {
      setDragOverStage(null)
      return
    }
    moveStudentToStage(draggedStudentId, stage)
    setDraggedStudentId(null)
    setDragOverStage(null)
  }

  const loadAdminData = async () => {
    if (!token.trim()) {
      toast.error('Paste an admin bearer token first.')
      return
    }

    try {
      setIsLoading(true)
      const [studentList, adminMetrics, kpis, splitInsights, activity, batchList, jobList] = await Promise.all([
        fetchAdminStudents(token, search),
        fetchAdminMetrics(token),
        fetchAdminMonthlyKpis(token),
        fetchAdminRoleSplitInsights(token),
        fetchAdminActivity(token, 30),
        fetchAdminBatches(token),
        fetchAdminJobs(token),
      ])

      setStudents(studentList)
      setMetrics(adminMetrics)
      setMonthlyKpis(kpis)
      setRoleSplitInsights(splitInsights)
      setActivityLogs(activity)
      setBatches(batchList)
      setJobs(jobList)

      if (studentList.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentList[0].id)
      }
      if (batchList.length > 0 && !selectedBatchId) {
        setSelectedBatchId(batchList[0].id)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load admin data'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const openClassDetail = async (batchId: number) => {
    if (!token.trim()) {
      toast.error('Paste an admin bearer token first.')
      return
    }

    try {
      setIsLoading(true)
      const insights = await fetchAdminClassInsights(token, batchId)
      setClassInsights(insights)
      setSelectedBatchId(batchId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load class detail'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateStudent = async () => {
    if (!token.trim()) {
      toast.error('Paste an admin bearer token first.')
      return
    }

    try {
      setIsLoading(true)
      const createdStudent = await createAdminStudent(token, createPayload)
      setCreatePayload(defaultCreatePayload)
      toast.success(`Student created: ${createdStudent.full_name}`)
      await loadAdminData()
      setSelectedStudentId(createdStudent.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create student'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStudent = async () => {
    if (!token.trim() || !selectedStudent) {
      toast.error('Select a student and provide an admin token.')
      return
    }

    try {
      setIsLoading(true)
      await updateAdminStudent(token, selectedStudent.id, {
        full_name: selectedStudent.full_name,
        role: selectedStudent.role,
        xp_points: selectedStudent.xp_points,
        streak_days: selectedStudent.streak_days,
        credit_balance: selectedStudent.credit_balance,
        selected_role_id: selectedStudent.selected_role_id,
        cohort_name: selectedStudent.cohort_name,
        batch_name: selectedStudent.batch_name,
        is_active: selectedStudent.is_active,
      })
      toast.success('Student updated successfully')
      await loadAdminData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update student'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateJob = async () => {
    if (!token.trim()) {
      toast.error('Paste an admin bearer token first.')
      return
    }
    if (!jobPayload.title?.trim() || !jobPayload.company_name?.trim() || !jobPayload.location?.trim()) {
      toast.error('Title, company, and location are required.')
      return
    }

    try {
      setIsLoading(true)
      await createAdminJob(token, {
        ...jobPayload,
        title: jobPayload.title.trim(),
        company_name: jobPayload.company_name.trim(),
        location: jobPayload.location.trim(),
      })
      setJobPayload(defaultJobPayload)
      setJobs(await fetchAdminJobs(token))
      toast.success('Job created successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create job'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoFillToken = () => {
    const storedToken = getAuthToken()
    if (!storedToken) {
      toast.error('No stored login token found. Please log in first.')
      return
    }

    setToken(storedToken)
    toast.success('Admin token auto-filled from your current login session.')
  }

  const handleDatabaseCheck = async () => {
    try {
      const result = await fetchDatabaseHealth()
      if (result.status === 'ok') {
        toast.success('Supabase DB connected successfully.')
      } else {
        toast.error(result.detail || 'Database is not reachable.')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database health check failed'
      toast.error(message)
    }
  }

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
              <p className="text-xs text-muted-foreground mt-1">Batch: {student.batch_name || student.cohort_name || 'Unassigned'} · XP: {student.xp_points}</p>
            </button>
          ))}
          {column.length === 0 && <p className="text-xs text-muted-foreground">Drop student cards here</p>}
        </div>
      </div>
    )
  }

  const navItems: Array<{ key: AdminSection; label: string; icon: React.ReactNode }> = [
    { key: 'dashboard', label: 'Dashboard', icon: <ChartBar size={16} /> },
    { key: 'board', label: 'Workflow Board', icon: <Kanban size={16} /> },
    { key: 'students', label: 'Students', icon: <UsersThree size={16} /> },
    { key: 'classes', label: 'Classes', icon: <CalendarBlank size={16} /> },
    { key: 'jobs', label: 'Jobs', icon: <Briefcase size={16} /> },
    { key: 'activity', label: 'Activity', icon: <ClockCounterClockwise size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1500px] p-4 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <Card className="admin-sidebar admin-surface p-4 space-y-4 h-fit lg:sticky lg:top-24">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold">Admin Workspace</p>
              <h1 className="text-xl font-semibold mt-1">CodeQuest Control Center</h1>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  variant={section === item.key ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSection(item.key)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="rounded-md border bg-muted/30 p-3 space-y-1">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Quick Snapshot</p>
              <p className="text-sm">Students: <span className="font-semibold">{metrics?.total_students ?? '-'}</span></p>
              <p className="text-sm">Open Jobs: <span className="font-semibold">{monthlyKpis?.open_jobs ?? '-'}</span></p>
              <p className="text-sm">Running Classes: <span className="font-semibold">{monthlyKpis?.active_classes_running ?? '-'}</span></p>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="admin-surface p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold">Section</p>
                  <h2 className="text-2xl font-semibold tracking-tight">{sectionTitle[section]}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="Paste admin bearer token"
                    type="password"
                    className="w-[280px]"
                  />
                  <Button variant="outline" onClick={handleAutoFillToken}>Auto Fill Token</Button>
                  <Button variant="outline" onClick={handleDatabaseCheck}>DB Check</Button>
                  <Button onClick={loadAdminData} disabled={isLoading}>Load Data</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setToken('')
                      setStudents([])
                      setMetrics(null)
                      setMonthlyKpis(null)
                      setRoleSplitInsights(null)
                      setJobs([])
                      setBatches([])
                      setActivityLogs([])
                      setClassInsights(null)
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </Card>

            {section === 'dashboard' && (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Enrolled Students</p><p className="text-2xl font-semibold mt-1">{monthlyKpis?.total_enrolled_students ?? '-'}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Enquiries This Month</p><p className="text-2xl font-semibold mt-1">{monthlyKpis?.enquiries_this_month ?? '-'}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Classes Completing This Month</p><p className="text-2xl font-semibold mt-1">{monthlyKpis?.classes_completing_this_month ?? '-'}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Hires This Month</p><p className="text-2xl font-semibold mt-1">{monthlyKpis?.hires_this_month ?? '-'}</p></Card>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Total Students</p><p className="text-2xl font-semibold mt-1">{metrics?.total_students ?? '-'}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Active Students</p><p className="text-2xl font-semibold mt-1">{metrics?.active_students ?? '-'}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Open Jobs</p><p className="text-2xl font-semibold mt-1">{monthlyKpis?.open_jobs ?? '-'}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">KPI Month</p><p className="text-2xl font-semibold mt-1">{monthlyKpis?.month_label ?? '-'}</p></Card>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Card className="p-4 space-y-3">
                    <h3 className="text-lg font-semibold">Student Insights</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(roleSplitInsights?.student_insights ?? []).map((item) => (
                        <div key={item.label} className="rounded border p-3">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-xl font-semibold mt-1">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-4 space-y-3">
                    <h3 className="text-lg font-semibold">Faculty Insights</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(roleSplitInsights?.faculty_insights ?? []).map((item) => (
                        <div key={item.label} className="rounded border p-3">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-xl font-semibold mt-1">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {section === 'board' && (
              <Card className="admin-surface p-4 space-y-4 border-2">
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

                <div className="grid gap-3 xl:grid-cols-4">
                  {(['new', 'enrolled', 'in_progress', 'needs_attention'] as StudentWorkflowStage[]).map(renderBoardColumn)}
                </div>
              </Card>
            )}

            {section === 'students' && (
              <div className="grid gap-4 xl:grid-cols-3">
                <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
                  <div className="flex items-center gap-2">
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" />
                    <Button variant="outline" onClick={loadAdminData} disabled={isLoading}>Search</Button>
                  </div>
                  <div className="space-y-2 max-h-[600px] overflow-auto pr-1">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        className={`w-full rounded-md border p-3 text-left transition ${selectedStudentId === student.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}
                        onClick={() => setSelectedStudentId(student.id)}
                      >
                        <p className="text-sm font-semibold">{student.full_name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">{student.role} · {student.batch_name || 'No batch'}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
                  <h3 className="text-lg font-semibold">Edit Student</h3>
                  {!selectedStudent && <p className="text-sm text-muted-foreground">Select a student from left panel.</p>}
                  {selectedStudent && (
                    <div className="space-y-3">
                      <Input value={selectedStudent.full_name} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, full_name: event.target.value } : item))} placeholder="Full name" />
                      <Input value={selectedStudent.role} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, role: event.target.value } : item))} placeholder="Role" />
                      <Input value={String(selectedStudent.credit_balance)} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, credit_balance: Number(event.target.value || 0) } : item))} placeholder="Credits" type="number" />
                      <Input value={String(selectedStudent.xp_points)} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, xp_points: Number(event.target.value || 0) } : item))} placeholder="XP" type="number" />
                      <Input value={selectedStudent.cohort_name ?? ''} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, cohort_name: event.target.value || null } : item))} placeholder="Cohort" />
                      <Input value={selectedStudent.batch_name ?? ''} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, batch_name: event.target.value || null } : item))} placeholder="Batch" />
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={selectedStudent.is_active} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, is_active: event.target.checked } : item))} />
                        Active
                      </label>
                      <Button onClick={handleUpdateStudent} disabled={isLoading}>Save Changes</Button>
                    </div>
                  )}
                </Card>

                <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
                  <h3 className="text-lg font-semibold">Create Student</h3>
                  <Input value={createPayload.full_name} onChange={(event) => setCreatePayload((prev) => ({ ...prev, full_name: event.target.value }))} placeholder="Full name" />
                  <Input value={createPayload.email} onChange={(event) => setCreatePayload((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email" type="email" />
                  <Input value={createPayload.password} onChange={(event) => setCreatePayload((prev) => ({ ...prev, password: event.target.value }))} placeholder="Password" type="password" />
                  <Input value={createPayload.role} onChange={(event) => setCreatePayload((prev) => ({ ...prev, role: event.target.value }))} placeholder="Role" />
                  <Input value={String(createPayload.credit_balance)} onChange={(event) => setCreatePayload((prev) => ({ ...prev, credit_balance: Number(event.target.value || 0) }))} placeholder="Credits" type="number" />
                  <Input value={String(createPayload.xp_points)} onChange={(event) => setCreatePayload((prev) => ({ ...prev, xp_points: Number(event.target.value || 0) }))} placeholder="XP" type="number" />
                  <Input value={createPayload.cohort_name ?? ''} onChange={(event) => setCreatePayload((prev) => ({ ...prev, cohort_name: event.target.value || null }))} placeholder="Cohort" />
                  <Input value={createPayload.batch_name ?? ''} onChange={(event) => setCreatePayload((prev) => ({ ...prev, batch_name: event.target.value || null }))} placeholder="Batch" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={createPayload.is_active} onChange={(event) => setCreatePayload((prev) => ({ ...prev, is_active: event.target.checked }))} />
                    Active
                  </label>
                  <Button onClick={handleCreateStudent} disabled={isLoading}>Create Student</Button>
                </Card>
              </div>
            )}

            {section === 'classes' && (
              <div className="grid gap-4 xl:grid-cols-2">
                <Card className="admin-surface p-4 space-y-3">
                  <h3 className="text-lg font-semibold">Class Batches</h3>
                  <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                    {batches.map((batch) => (
                      <button
                        key={batch.id}
                        className={`w-full rounded-md border p-3 text-left transition ${selectedBatchId === batch.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}
                        onClick={() => {
                          setSelectedBatchId(batch.id)
                          openClassDetail(batch.id)
                        }}
                      >
                        <p className="text-sm font-semibold">{batch.name}</p>
                        <p className="text-xs text-muted-foreground">{batch.track}</p>
                        <p className="text-xs text-muted-foreground mt-1">{batch.days} · {batch.time_ist} · Seats {batch.seats_filled}/{batch.seats_total}</p>
                      </button>
                    ))}
                    {batches.length === 0 && <p className="text-sm text-muted-foreground">No batches loaded.</p>}
                  </div>
                </Card>

                <Card className="admin-surface p-4 space-y-3">
                  <h3 className="text-lg font-semibold">Class Detail</h3>
                  {!selectedBatch && <p className="text-sm text-muted-foreground">Select a batch from left panel.</p>}
                  {selectedBatch && (
                    <div className="space-y-2">
                      <p className="text-sm"><span className="text-muted-foreground">Batch:</span> {selectedBatch.name}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Track:</span> {selectedBatch.track}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Schedule:</span> {selectedBatch.days} · {selectedBatch.time_ist}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Start:</span> {selectedBatch.start_date}</p>

                      <div className="pt-2 border-t mt-2">
                        <p className="text-sm font-medium mb-2">Students</p>
                        <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                          {(classInsights?.students ?? []).map((student) => (
                            <div key={student.user_id} className="rounded-md border p-2">
                              <p className="text-sm font-semibold">{student.full_name}</p>
                              <p className="text-xs text-muted-foreground">{student.enrollment_role} · Attendance {student.attendance_pct}% · {student.project_status}</p>
                            </div>
                          ))}
                          {(classInsights?.students?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">Load a batch to view class details.</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {section === 'jobs' && (
              <div className="grid gap-4 xl:grid-cols-3">
                <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
                  <h3 className="text-lg font-semibold">Create Job</h3>
                  <Input value={jobPayload.title} onChange={(event) => setJobPayload((prev) => ({ ...prev, title: event.target.value }))} placeholder="Job title" />
                  <Input value={jobPayload.company_name} onChange={(event) => setJobPayload((prev) => ({ ...prev, company_name: event.target.value }))} placeholder="Company" />
                  <Input value={jobPayload.location} onChange={(event) => setJobPayload((prev) => ({ ...prev, location: event.target.value }))} placeholder="Location" />
                  <Input value={jobPayload.employment_type ?? ''} onChange={(event) => setJobPayload((prev) => ({ ...prev, employment_type: event.target.value }))} placeholder="Employment type" />
                  <Input value={jobPayload.description ?? ''} onChange={(event) => setJobPayload((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" />
                  <Button onClick={handleCreateJob} disabled={isLoading}>Create Job</Button>
                </Card>

                <Card className="admin-surface p-4 space-y-3 xl:col-span-2">
                  <h3 className="text-lg font-semibold">Open Job Pipeline</h3>
                  <div className="space-y-2 max-h-[620px] overflow-auto pr-1">
                    {jobs.map((job) => (
                      <div key={job.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{job.title}</p>
                          <span className="text-xs rounded bg-primary/10 px-2 py-1 text-primary font-semibold">{job.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{job.company_name} · {job.location} · {job.employment_type}</p>
                        <p className="text-xs text-muted-foreground mt-1">Batch: {job.eligible_batch_name || 'Any'} · Applications: {job.applications_count}</p>
                      </div>
                    ))}
                    {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs loaded.</p>}
                  </div>
                </Card>
              </div>
            )}

            {section === 'activity' && (
              <Card className="admin-surface p-4 space-y-3">
                <h3 className="text-lg font-semibold">Recent Admin Activity</h3>
                <div className="space-y-2 max-h-[700px] overflow-auto pr-1">
                  {activityLogs.map((entry) => (
                    <div key={entry.id} className="rounded-md border p-3">
                      <p className="text-sm font-semibold">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">{entry.details || 'No details'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Admin #{entry.admin_user_id} · Target #{entry.target_user_id ?? '-'} · {new Date(entry.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                  {activityLogs.length === 0 && <p className="text-sm text-muted-foreground">No activity found.</p>}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
