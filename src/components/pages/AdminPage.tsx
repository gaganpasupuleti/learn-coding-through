import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Briefcase,
  CalendarBlank,
  ChartBar,
  ClockCounterClockwise,
  Kanban,
  MagnifyingGlass,
  Plus,
  Trash,
  UsersThree,
  ShieldCheck,
  Pencil,
  Eye,
  Database,
  Lightning,
  BookOpen,
  Cube,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AdminActivityLog,
  AdminBatch,
  AdminBatchCreatePayload,
  AdminClassInsights,
  AdminJobCreatePayload,
  AdminJobPost,
  AdminMetrics,
  AdminMonthlyKpis,
  AdminPlatformOverview,
  AdminRegistrationWaitlistEntry,
  AdminRoleSplitInsights,
  AdminStudent,
  AdminStudentCreatePayload,
  AdminUserActivity,
  createAdminBatch,
  createAdminJob,
  createAdminStudent,
  deleteAdminBatch,
  deleteAdminJob,
  deleteAdminStudent,
  fetchAdminActivity,
  fetchAdminBatches,
  fetchAdminClassInsights,
  fetchAdminJobs,
  fetchAdminMetrics,
  fetchAdminMonthlyKpis,
  fetchAdminPlatformOverview,
  fetchAdminRoleSplitInsights,
  fetchAdminRegistrationWaitlist,
  fetchAdminUserActivity,
  fetchDatabaseHealth,
  fetchAdminStudents,
  updateAdminBatch,
  updateAdminJob,
  updateAdminRegistrationWaitlistStatus,
  updateAdminStudent,
} from '@/lib/api'
import { getAuthToken } from '@/lib/auth'

type AdminSection = 'dashboard' | 'board' | 'students' | 'classes' | 'jobs' | 'activity' | 'access'
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

const defaultBatchPayload: AdminBatchCreatePayload = {
  name: '',
  track: '',
  days: '',
  time_ist: '',
  mode: 'online',
  start_date: '',
  seats_total: 30,
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

const sectionMeta: Record<AdminSection, { title: string; icon: React.ReactNode }> = {
  dashboard: { title: 'Executive Dashboard', icon: <ChartBar size={18} weight="bold" /> },
  board: { title: 'Workflow Board', icon: <Kanban size={18} weight="bold" /> },
  students: { title: 'Students', icon: <UsersThree size={18} weight="bold" /> },
  classes: { title: 'Classes & Batches', icon: <CalendarBlank size={18} weight="bold" /> },
  jobs: { title: 'Job Portal', icon: <Briefcase size={18} weight="bold" /> },
  activity: { title: 'Activity Log', icon: <ClockCounterClockwise size={18} weight="bold" /> },
  access: { title: 'Access Control', icon: <ShieldCheck size={18} weight="bold" /> },
}

/* ─────────────────────── tiny stat card ─────────────────────── */

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon?: React.ReactNode; accent?: string }) {
  return (
    <Card className={`p-4 flex items-start gap-3 ${accent ?? ''}`}>
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
      </div>
    </Card>
  )
}

/* ─────────────────────── badge ─────────────────────── */

function StatusBadge({ text, variant = 'default' }: { text: string; variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const cls: Record<string, string> = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return <span className={`text-xs font-semibold rounded-md px-2 py-0.5 ${cls[variant]}`}>{text}</span>
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
  const [overview, setOverview] = useState<AdminPlatformOverview | null>(null)

  const [batches, setBatches] = useState<AdminBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)
  const [classInsights, setClassInsights] = useState<AdminClassInsights | null>(null)
  const [batchFormMode, setBatchFormMode] = useState<'create' | 'edit'>('create')
  const [batchPayload, setBatchPayload] = useState<AdminBatchCreatePayload>(defaultBatchPayload)
  const [editingBatchId, setEditingBatchId] = useState<number | null>(null)

  const [jobs, setJobs] = useState<AdminJobPost[]>([])
  const [waitlistEntries, setWaitlistEntries] = useState<AdminRegistrationWaitlistEntry[]>([])
  const [userActivityEntries, setUserActivityEntries] = useState<AdminUserActivity[]>([])
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

  const getWorkflowStage = useCallback((student: AdminStudent): StudentWorkflowStage => {
    return manualWorkflowStages[student.id] ?? resolveStudentWorkflowStage(student)
  }, [manualWorkflowStages])

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
  }, [boardStudents, getWorkflowStage])

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
    const t = token.trim() || getAuthToken() || ''
    if (!t) {
      toast.error('No admin token available. Please log in.')
      return
    }
    if (!token.trim()) setToken(t)

    try {
      setIsLoading(true)
      const [
        studentList,
        adminMetrics,
        kpis,
        splitInsights,
        activity,
        batchList,
        jobList,
        waitlist,
        userActivity,
        platformOverview,
      ] = await Promise.all([
        fetchAdminStudents(t, search),
        fetchAdminMetrics(t),
        fetchAdminMonthlyKpis(t),
        fetchAdminRoleSplitInsights(t),
        fetchAdminActivity(t, 30),
        fetchAdminBatches(t),
        fetchAdminJobs(t),
        fetchAdminRegistrationWaitlist(t),
        fetchAdminUserActivity(t, 80),
        fetchAdminPlatformOverview(t),
      ])

      setStudents(studentList)
      setMetrics(adminMetrics)
      setMonthlyKpis(kpis)
      setRoleSplitInsights(splitInsights)
      setActivityLogs(activity)
      setBatches(batchList)
      setJobs(jobList)
      setWaitlistEntries(waitlist)
      setUserActivityEntries(userActivity)
      setOverview(platformOverview)

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

  // Auto-load on mount when token is available
  useEffect(() => {
    const t = getAuthToken()
    if (t) {
      setToken(t)
      const id = setTimeout(() => loadAdminData(), 100)
      return () => clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdateWaitlistStatus = async (entryId: number, status: 'pending' | 'approved' | 'rejected') => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return

    try {
      setIsLoading(true)
      await updateAdminRegistrationWaitlistStatus(t, entryId, status)
      setWaitlistEntries(await fetchAdminRegistrationWaitlist(t))
      toast.success(`Waitlist updated to ${status}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update waitlist'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const openClassDetail = async (batchId: number) => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return

    try {
      setIsLoading(true)
      const insights = await fetchAdminClassInsights(t, batchId)
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
    const t = token.trim() || getAuthToken() || ''
    if (!t) return

    try {
      setIsLoading(true)
      const createdStudent = await createAdminStudent(t, createPayload)
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
    const t = token.trim() || getAuthToken() || ''
    if (!t || !selectedStudent) return

    try {
      setIsLoading(true)
      await updateAdminStudent(t, selectedStudent.id, {
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
      toast.success('Student updated')
      await loadAdminData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update student'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStudent = async (studentId: number) => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    try {
      setIsLoading(true)
      await deleteAdminStudent(t, studentId)
      toast.success('Student deactivated')
      await loadAdminData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate student')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateJob = async () => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    if (!jobPayload.title?.trim() || !jobPayload.company_name?.trim() || !jobPayload.location?.trim()) {
      toast.error('Title, company, and location are required.')
      return
    }

    try {
      setIsLoading(true)
      await createAdminJob(t, {
        ...jobPayload,
        title: jobPayload.title.trim(),
        company_name: jobPayload.company_name.trim(),
        location: jobPayload.location.trim(),
      })
      setJobPayload(defaultJobPayload)
      setJobs(await fetchAdminJobs(t))
      toast.success('Job created')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create job'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleJobStatus = async (job: AdminJobPost) => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    const newStatus = job.status === 'open' ? 'closed' : 'open'
    try {
      setIsLoading(true)
      await updateAdminJob(t, job.id, { status: newStatus as 'open' | 'closed' })
      setJobs(await fetchAdminJobs(t))
      toast.success(`Job ${newStatus === 'open' ? 'reopened' : 'closed'}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update job')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    try {
      setIsLoading(true)
      await deleteAdminJob(t, jobId)
      setJobs(await fetchAdminJobs(t))
      toast.success('Job deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete job')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBatch = async () => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    if (!batchPayload.name?.trim() || !batchPayload.track?.trim() || !batchPayload.start_date?.trim()) {
      toast.error('Name, track, and start date are required.')
      return
    }
    try {
      setIsLoading(true)
      await createAdminBatch(t, batchPayload)
      setBatchPayload(defaultBatchPayload)
      setBatches(await fetchAdminBatches(t))
      toast.success('Batch created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create batch')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateBatch = async () => {
    const t = token.trim() || getAuthToken() || ''
    if (!t || !editingBatchId) return
    try {
      setIsLoading(true)
      await updateAdminBatch(t, editingBatchId, batchPayload)
      setBatchFormMode('create')
      setBatchPayload(defaultBatchPayload)
      setEditingBatchId(null)
      setBatches(await fetchAdminBatches(t))
      toast.success('Batch updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update batch')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBatch = async (batchId: number) => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    try {
      setIsLoading(true)
      await deleteAdminBatch(t, batchId)
      setBatches(await fetchAdminBatches(t))
      if (selectedBatchId === batchId) {
        setSelectedBatchId(null)
        setClassInsights(null)
      }
      toast.success('Batch deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete batch')
    } finally {
      setIsLoading(false)
    }
  }

  const startEditBatch = (batch: AdminBatch) => {
    setBatchFormMode('edit')
    setEditingBatchId(batch.id)
    setBatchPayload({
      name: batch.name,
      track: batch.track,
      days: batch.days,
      time_ist: batch.time_ist,
      mode: batch.mode,
      start_date: batch.start_date,
      seats_total: batch.seats_total,
    })
  }

  const handleDatabaseCheck = async () => {
    try {
      const result = await fetchDatabaseHealth()
      if (result.status === 'ok') {
        toast.success('Database connected successfully.')
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
    { key: 'access', label: 'Access Control', icon: <ShieldCheck size={16} /> },
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
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold">Quick Snapshot</p>
              <p className="text-sm">Users: <span className="font-semibold">{overview?.total_users ?? metrics?.total_students ?? '-'}</span></p>
              <p className="text-sm">Active Batches: <span className="font-semibold">{overview?.active_batches ?? monthlyKpis?.active_classes_running ?? '-'}</span></p>
              <p className="text-sm">Open Jobs: <span className="font-semibold">{overview?.total_jobs_open ?? monthlyKpis?.open_jobs ?? '-'}</span></p>
              <p className="text-sm">Courses: <span className="font-semibold">{overview ? overview.catalog_quizzes + overview.catalog_projects : '-'}</span></p>
              <p className="text-sm">Waitlist: <span className="font-semibold">{overview?.waitlist_pending ?? '-'}</span> pending</p>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="admin-surface p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  {sectionMeta[section].icon}
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold">Section</p>
                    <h2 className="text-2xl font-semibold tracking-tight">{sectionMeta[section].title}</h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleDatabaseCheck}><Database size={14} className="mr-1" /> DB Check</Button>
                  <Button size="sm" onClick={loadAdminData} disabled={isLoading}>
                    <Lightning size={14} className="mr-1" /> {isLoading ? 'Loading…' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </Card>

            {section === 'dashboard' && (
              <div className="space-y-4">
                {/* Platform Overview */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  <StatCard label="Total Users" value={overview?.total_users ?? '-'} icon={<UsersThree size={20} />} />
                  <StatCard label="Active Users" value={overview?.active_users ?? '-'} icon={<Lightning size={20} />} />
                  <StatCard label="Admins" value={overview?.total_admins ?? '-'} icon={<ShieldCheck size={20} />} />
                  <StatCard label="Quizzes (Catalog)" value={overview?.catalog_quizzes ?? '-'} icon={<BookOpen size={20} />} />
                  <StatCard label="Projects (Catalog)" value={overview?.catalog_projects ?? '-'} icon={<Cube size={20} />} />
                </div>

                {/* KPIs Row */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Enrolled Students" value={monthlyKpis?.total_enrolled_students ?? '-'} />
                  <StatCard label="Enquiries This Month" value={monthlyKpis?.enquiries_this_month ?? '-'} />
                  <StatCard label="Classes Completing" value={monthlyKpis?.classes_completing_this_month ?? '-'} />
                  <StatCard label="Hires This Month" value={monthlyKpis?.hires_this_month ?? '-'} />
                </div>

                {/* Batches & Jobs */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Total Batches" value={overview?.total_batches ?? '-'} icon={<CalendarBlank size={20} />} />
                  <StatCard label="Active Batches" value={overview?.active_batches ?? '-'} icon={<CalendarBlank size={20} />} />
                  <StatCard label="Open Jobs" value={overview?.total_jobs_open ?? '-'} icon={<Briefcase size={20} />} />
                  <StatCard label="Total Job Apps" value={overview?.total_job_applications ?? '-'} icon={<Briefcase size={20} />} />
                </div>

                {/* Waitlist Summary */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card className="p-4 border-amber-200 dark:border-amber-900">
                    <p className="text-xs text-muted-foreground">Waitlist Pending</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{overview?.waitlist_pending ?? '-'}</p>
                  </Card>
                  <Card className="p-4 border-green-200 dark:border-green-900">
                    <p className="text-xs text-muted-foreground">Waitlist Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{overview?.waitlist_approved ?? '-'}</p>
                  </Card>
                  <Card className="p-4 border-red-200 dark:border-red-900">
                    <p className="text-xs text-muted-foreground">Waitlist Rejected</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{overview?.waitlist_rejected ?? '-'}</p>
                  </Card>
                </div>

                {/* Insights */}
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

                {/* Metrics */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Avg Credits</p><p className="text-2xl font-semibold mt-1">{metrics?.average_credits ?? '-'}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Avg XP</p><p className="text-2xl font-semibold mt-1">{metrics?.average_xp_points ?? '-'}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">KPI Month</p><p className="text-2xl font-semibold mt-1">{monthlyKpis?.month_label ?? '-'}</p></Card>
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
                  <p className="text-xs text-muted-foreground">{students.length} student{students.length !== 1 ? 's' : ''} loaded</p>
                  <div className="space-y-2 max-h-[600px] overflow-auto pr-1">
                    {students.map((student) => (
                      <div key={student.id} className={`rounded-md border p-3 transition ${selectedStudentId === student.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}>
                        <button className="w-full text-left" onClick={() => setSelectedStudentId(student.id)}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{student.full_name}</p>
                            {!student.is_active && <StatusBadge text="Inactive" variant="danger" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">{student.role} · {student.batch_name || 'No batch'} · XP {student.xp_points}</p>
                        </button>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedStudentId(student.id)}><Eye size={12} /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteStudent(student.id)} disabled={isLoading}><Trash size={12} /></Button>
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
                  <Button onClick={handleCreateStudent} disabled={isLoading}><Plus size={14} className="mr-1" /> Create Student</Button>
                </Card>
              </div>
            )}

            {section === 'classes' && (
              <div className="grid gap-4 xl:grid-cols-3">
                {/* Batch list */}
                <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Batches</h3>
                    <span className="text-xs text-muted-foreground">{batches.length} total</span>
                  </div>
                  <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                    {batches.map((batch) => (
                      <div key={batch.id} className={`rounded-md border p-3 transition ${selectedBatchId === batch.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}>
                        <button className="w-full text-left" onClick={() => { setSelectedBatchId(batch.id); openClassDetail(batch.id) }}>
                          <p className="text-sm font-semibold">{batch.name}</p>
                          <p className="text-xs text-muted-foreground">{batch.track}</p>
                          <p className="text-xs text-muted-foreground mt-1">{batch.days} · {batch.time_ist}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge text={batch.mode} />
                            <span className="text-xs text-muted-foreground">Seats {batch.seats_filled}/{batch.seats_total}</span>
                          </div>
                        </button>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="ghost" onClick={() => startEditBatch(batch)}><Pencil size={12} /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteBatch(batch.id)} disabled={isLoading}><Trash size={12} /></Button>
                        </div>
                      </div>
                    ))}
                    {batches.length === 0 && <p className="text-sm text-muted-foreground">No batches loaded.</p>}
                  </div>
                </Card>

                {/* Create / Edit batch */}
                <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{batchFormMode === 'create' ? 'Create Batch' : 'Edit Batch'}</h3>
                    {batchFormMode === 'edit' && (
                      <Button size="sm" variant="ghost" onClick={() => { setBatchFormMode('create'); setBatchPayload(defaultBatchPayload); setEditingBatchId(null) }}>Cancel</Button>
                    )}
                  </div>
                  <Input value={batchPayload.name} onChange={(event) => setBatchPayload((prev) => ({ ...prev, name: event.target.value }))} placeholder="Batch name" />
                  <Input value={batchPayload.track} onChange={(event) => setBatchPayload((prev) => ({ ...prev, track: event.target.value }))} placeholder="Track (e.g. Full Stack + DSA)" />
                  <Input value={batchPayload.days} onChange={(event) => setBatchPayload((prev) => ({ ...prev, days: event.target.value }))} placeholder="Days (e.g. Mon-Wed-Fri)" />
                  <Input value={batchPayload.time_ist} onChange={(event) => setBatchPayload((prev) => ({ ...prev, time_ist: event.target.value }))} placeholder="Time IST (e.g. 7:00 PM - 9:00 PM)" />
                  <div className="flex gap-2">
                    <select value={batchPayload.mode} onChange={(event) => setBatchPayload((prev) => ({ ...prev, mode: event.target.value }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                    <Input value={String(batchPayload.seats_total)} onChange={(event) => setBatchPayload((prev) => ({ ...prev, seats_total: Number(event.target.value || 30) }))} placeholder="Seats" type="number" className="w-[100px]" />
                  </div>
                  <Input value={batchPayload.start_date} onChange={(event) => setBatchPayload((prev) => ({ ...prev, start_date: event.target.value }))} placeholder="Start date (YYYY-MM-DD)" type="date" />
                  {batchFormMode === 'create' ? (
                    <Button onClick={handleCreateBatch} disabled={isLoading}><Plus size={14} className="mr-1" /> Create Batch</Button>
                  ) : (
                    <Button onClick={handleUpdateBatch} disabled={isLoading}>Save Changes</Button>
                  )}
                </Card>

                {/* Class detail */}
                <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
                  <h3 className="text-lg font-semibold">Class Detail</h3>
                  {!selectedBatch && <p className="text-sm text-muted-foreground">Select a batch to view details.</p>}
                  {selectedBatch && (
                    <div className="space-y-2">
                      <p className="text-sm"><span className="text-muted-foreground">Batch:</span> {selectedBatch.name}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Track:</span> {selectedBatch.track}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Schedule:</span> {selectedBatch.days} · {selectedBatch.time_ist}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Mode:</span> <StatusBadge text={selectedBatch.mode} /></p>
                      <p className="text-sm"><span className="text-muted-foreground">Start:</span> {selectedBatch.start_date}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Mentor:</span> {selectedBatch.mentor_name ?? 'Not assigned'}</p>

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
                              <p className="text-xs text-muted-foreground">{student.enrollment_role} · Attendance {student.attendance_pct}% · {student.project_status}</p>
                            </div>
                          ))}
                          {(classInsights?.students?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">Load a batch to view students.</p>}
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
                  <Button onClick={handleCreateJob} disabled={isLoading}><Plus size={14} className="mr-1" /> Create Job</Button>
                </Card>

                <Card className="admin-surface p-4 space-y-3 xl:col-span-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Job Pipeline</h3>
                    <span className="text-xs text-muted-foreground">{jobs.length} jobs</span>
                  </div>
                  <div className="space-y-2 max-h-[620px] overflow-auto pr-1">
                    {jobs.map((job) => (
                      <div key={job.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{job.title}</p>
                          <StatusBadge text={job.status} variant={job.status === 'open' ? 'success' : 'danger'} />
                        </div>
                        <p className="text-xs text-muted-foreground">{job.company_name} · {job.location} · {job.employment_type}</p>
                        <p className="text-xs text-muted-foreground mt-1">Batch: {job.eligible_batch_name || 'Any'} · Applications: {job.applications_count}</p>
                        <p className="text-xs text-muted-foreground">Created: {new Date(job.created_at).toLocaleDateString()}</p>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="outline" onClick={() => handleToggleJobStatus(job)} disabled={isLoading}>
                            {job.status === 'open' ? 'Close' : 'Reopen'}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteJob(job.id)} disabled={isLoading}><Trash size={12} /></Button>
                        </div>
                      </div>
                    ))}
                    {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs loaded.</p>}
                  </div>
                </Card>
              </div>
            )}

            {section === 'activity' && (
              <Card className="admin-surface p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Admin Activity</h3>
                  <span className="text-xs text-muted-foreground">{activityLogs.length} entries</span>
                </div>
                <div className="space-y-2 max-h-[700px] overflow-auto pr-1">
                  {activityLogs.map((entry) => (
                    <div key={entry.id} className="rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge text={entry.action} />
                        <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
                      </div>
                      <p className="text-sm mt-1">{entry.details || 'No details'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Admin #{entry.admin_user_id} {entry.target_user_id ? `→ User #${entry.target_user_id}` : ''}</p>
                    </div>
                  ))}
                  {activityLogs.length === 0 && <p className="text-sm text-muted-foreground">No activity found.</p>}
                </div>
              </Card>
            )}

            {section === 'access' && (
              <div className="grid gap-4 xl:grid-cols-2">
                <Card className="admin-surface p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">Registration Waitlist</h3>
                    <span className="text-xs text-muted-foreground">{waitlistEntries.length} entries</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Approve one-by-one to allow sign-up beyond the 1500-user cap</p>
                  <div className="space-y-2 max-h-[640px] overflow-auto pr-1">
                    {waitlistEntries.map((entry) => (
                      <div key={entry.id} className="rounded-md border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{entry.email}</p>
                            <p className="text-xs text-muted-foreground">{entry.full_name || 'No name'} · {entry.source} · attempts {entry.attempt_count}</p>
                            <p className="text-xs text-muted-foreground">Last tried: {new Date(entry.last_attempted_at).toLocaleString()}</p>
                          </div>
                          <StatusBadge
                            text={entry.status}
                            variant={entry.status === 'approved' ? 'success' : entry.status === 'rejected' ? 'danger' : 'warning'}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="default" onClick={() => handleUpdateWaitlistStatus(entry.id, 'approved')} disabled={isLoading || entry.status === 'approved'}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateWaitlistStatus(entry.id, 'pending')} disabled={isLoading || entry.status === 'pending'}>Pending</Button>
                          <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleUpdateWaitlistStatus(entry.id, 'rejected')} disabled={isLoading || entry.status === 'rejected'}>Reject</Button>
                        </div>
                      </div>
                    ))}
                    {waitlistEntries.length === 0 && <p className="text-sm text-muted-foreground">No waitlist entries found.</p>}
                  </div>
                </Card>

                <Card className="admin-surface p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">Recent User Activity</h3>
                    <span className="text-xs text-muted-foreground">{userActivityEntries.length} entries</span>
                  </div>
                  <div className="space-y-2 max-h-[640px] overflow-auto pr-1">
                    {userActivityEntries.map((entry) => (
                      <div key={entry.id} className="rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge text={entry.event_type} variant={entry.status_code && entry.status_code >= 400 ? 'danger' : 'default'} />
                          <p className="text-xs font-mono text-muted-foreground truncate">{entry.method ?? ''} {entry.route}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          User #{entry.user_id ?? 'anon'} · {entry.status_code ?? '-'} · {entry.duration_ms ?? 0}ms · {new Date(entry.occurred_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {userActivityEntries.length === 0 && <p className="text-sm text-muted-foreground">No user activity found.</p>}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
