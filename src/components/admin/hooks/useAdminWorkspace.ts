import type { ChangeEvent, DragEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import {
  type AdminActivityLog,
  type AdminBatch,
  type AdminBatchCreatePayload,
  type AdminClassInsights,
  type AdminJobCreatePayload,
  type AdminJobListFilter,
  type AdminJobPost,
  type AdminMetrics,
  type AdminMonthlyKpis,
  type AdminPlatformOverview,
  type AdminRegistrationWaitlistEntry,
  type AdminRoleSplitInsights,
  type AdminStudent,
  type AdminStudentCreatePayload,
  type AdminUserActivity,
  createAdminBatch,
  createAdminJob,
  createAdminStudent,
  deleteAdminBatch,
  deleteAdminJob,
  deleteAdminStudent,
  downloadAdminJobImportTemplate,
  fetchAdminActivity,
  fetchAdminBatches,
  fetchAdminClassInsights,
  fetchAdminJobs,
  reorderAdminJobs,
  seedAdminFixtureJobs,
  fetchAdminMetrics,
  fetchAdminMonthlyKpis,
  fetchAdminPlatformOverview,
  fetchAdminRegistrationWaitlist,
  fetchAdminRoleSplitInsights,
  fetchAdminUserActivity,
  fetchDatabaseHealth,
  fetchAdminStudents,
  importAdminJobsFromExcel,
  importAdminJobsFromLinkedInJson,
  updateAdminBatch,
  updateAdminJob,
  updateAdminRegistrationWaitlistStatus,
  updateAdminStudent,
} from "@/lib/api"
import { getAuthToken } from "@/lib/auth"

import {
  WORKFLOW_STAGE_STORAGE_KEY,
  defaultBatchPayload,
  defaultCreatePayload,
  defaultJobPayload,
} from "../constants"
import { resolveStudentWorkflowStage } from "../workflow"
import type { AdminSection, StudentWorkflowStage } from "../types"

function isFocusInTextField(element: Element | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false
  if (element.isContentEditable) return true
  const tag = element.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

export function useAdminWorkspace() {
  const [section, setSection] = useState<AdminSection>('dashboard')
  const [commandOpen, setCommandOpen] = useState(false)
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
  const [jobListFilter, setJobListFilter] = useState<AdminJobListFilter>('all')
  const [draggedJobId, setDraggedJobId] = useState<number | null>(null)
  const [waitlistEntries, setWaitlistEntries] = useState<AdminRegistrationWaitlistEntry[]>([])
  const [userActivityEntries, setUserActivityEntries] = useState<AdminUserActivity[]>([])
  const [jobPayload, setJobPayload] = useState<AdminJobCreatePayload>(defaultJobPayload)
  const jobImportFileRef = useRef<HTMLInputElement>(null)
  const jobImportLinkedInRef = useRef<HTMLInputElement>(null)
  const linkedinDragDepthRef = useRef(0)
  const [linkedinReplaceOpen, setLinkedinReplaceOpen] = useState(false)
  const [linkedinDropActive, setLinkedinDropActive] = useState(false)
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
      const results = await Promise.allSettled([
        fetchAdminStudents(t, search),
        fetchAdminMetrics(t),
        fetchAdminMonthlyKpis(t),
        fetchAdminRoleSplitInsights(t),
        fetchAdminActivity(t, 200),
        fetchAdminBatches(t),
        fetchAdminJobs(t, jobListFilter),
        fetchAdminRegistrationWaitlist(t),
        fetchAdminUserActivity(t, 500),
        fetchAdminPlatformOverview(t),
      ])

      const label = [
        'students',
        'metrics',
        'monthly KPIs',
        'role insights',
        'activity',
        'batches',
        'jobs',
        'waitlist',
        'user activity',
        'overview',
      ]

      const failed: string[] = []
      const pick = <T,>(index: number, fallback: T): T => {
        const result = results[index]
        if (result.status === 'fulfilled') return result.value as T
        failed.push(label[index])
        console.warn(`[Admin] ${label[index]} failed:`, result.reason)
        return fallback
      }

      const studentList = pick(0, [] as AdminStudent[])
      const adminMetrics = pick(1, null)
      const kpis = pick(2, null)
      const splitInsights = pick(3, null)
      const activity = pick(4, [] as AdminActivityLog[])
      const batchList = pick(5, [] as AdminBatch[])
      const jobList = pick(6, [] as AdminJobPost[])
      const waitlist = pick(7, [] as AdminRegistrationWaitlistEntry[])
      const userActivity = pick(8, [] as AdminUserActivity[])
      const platformOverview = pick(9, null)

      setStudents(studentList)
      if (adminMetrics) setMetrics(adminMetrics)
      if (kpis) setMonthlyKpis(kpis)
      if (splitInsights) setRoleSplitInsights(splitInsights)
      setActivityLogs(activity)
      setBatches(batchList)
      setJobs(jobList)
      setWaitlistEntries(waitlist)
      setUserActivityEntries(userActivity)
      if (platformOverview) setOverview(platformOverview)

      if (studentList.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentList[0].id)
      }
      if (batchList.length > 0 && !selectedBatchId) {
        setSelectedBatchId(batchList[0].id)
      }

      if (failed.length > 0) {
        const critical = failed.filter((f) => f === 'overview' || f === 'metrics' || f === 'students')
        if (critical.length > 0) {
          toast.error(`Admin data partially failed (${failed.length}): ${failed.join(', ')}`)
        } else {
          toast.message(`Some admin sections did not load: ${failed.join(', ')}`)
        }
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key?.toLowerCase() !== 'k') return
      if (!(event.ctrlKey || event.metaKey)) return
      if (!commandOpen && isFocusInTextField(document.activeElement)) return
      event.preventDefault()
      setCommandOpen((open) => !open)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [commandOpen])

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
    if (
      !window.confirm(
        'Deactivate this student on the server? They will lose access until an admin restores the account.',
      )
    ) {
      return
    }
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

  const reloadJobs = useCallback(
    async (authToken?: string, filter: AdminJobListFilter = jobListFilter) => {
      const t = (authToken ?? (token.trim() || getAuthToken() || '')).trim()
      if (!t) return
      setJobs(await fetchAdminJobs(t, filter))
    },
    [jobListFilter, token],
  )

  const handleJobListFilterChange = async (filter: AdminJobListFilter) => {
    setJobListFilter(filter)
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    try {
      setIsLoading(true)
      setJobs(await fetchAdminJobs(t, filter))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load jobs')
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
      await reloadJobs(t)
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
      await reloadJobs(t)
      toast.success(`Job ${newStatus === 'open' ? 'reopened' : 'closed'}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update job')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleJobFixture = async (job: AdminJobPost) => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    try {
      setIsLoading(true)
      await updateAdminJob(t, job.id, { is_fixture: !job.is_fixture })
      await reloadJobs(t)
      toast.success(job.is_fixture ? 'Marked as live listing' : 'Marked as fixture listing')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update job')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedFixtureJobs = async () => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    try {
      setIsLoading(true)
      const result = await seedAdminFixtureJobs(t)
      await reloadJobs(t, 'all')
      setJobListFilter('all')
      toast.success(result.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load fixture jobs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDropJobOn = async (targetJobId: number) => {
    const t = token.trim() || getAuthToken() || ''
    if (!t || !draggedJobId || draggedJobId === targetJobId) {
      setDraggedJobId(null)
      return
    }
    if (jobListFilter !== 'all') {
      toast.error('Switch filter to All to reorder the job board.')
      setDraggedJobId(null)
      return
    }
    const ordered = [...jobs].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    const from = ordered.findIndex((j) => j.id === draggedJobId)
    const to = ordered.findIndex((j) => j.id === targetJobId)
    if (from < 0 || to < 0) {
      setDraggedJobId(null)
      return
    }
    const next = [...ordered]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    try {
      setIsLoading(true)
      setJobs(await reorderAdminJobs(t, next.map((j) => j.id)))
      toast.success('Job order updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reorder jobs')
    } finally {
      setDraggedJobId(null)
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    try {
      setIsLoading(true)
      await deleteAdminJob(t, jobId)
      await reloadJobs(t)
      toast.success('Job deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete job')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadJobImportTemplate = async () => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) return
    try {
      const blob = await downloadAdminJobImportTemplate(t)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'job_import_template.xlsx'
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('Template downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Download failed')
    }
  }

  const handleJobImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const t = token.trim() || getAuthToken() || ''
    if (!t) {
      toast.error('Not signed in. Use Access Control to log in, then try the upload again.')
      return
    }
    try {
      setIsLoading(true)
      const result = await importAdminJobsFromExcel(t, file)
      toast.success(`Imported ${result.created} job(s). Empty rows skipped: ${result.skipped}.`)
      await reloadJobs(t)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsLoading(false)
    }
  }

  const processLinkedInJsonFile = useCallback(
    async (file: File) => {
      const lower = file.name.toLowerCase()
      const jsonMime = ['application/json', 'text/json', 'application/x-json'].includes(file.type)
      if (!lower.endsWith('.json') && !jsonMime) {
        toast.error('Choose a .json file (UTF-8 export from the LinkedIn scraper).')
        return
      }
      const t = token.trim() || getAuthToken() || ''
      if (!t) {
        toast.error('Session missing. Open Access Control, sign in as admin, then upload again.')
        return
      }
      try {
        setIsLoading(true)
        const result = await importAdminJobsFromLinkedInJson(t, file, linkedinReplaceOpen)
        const closed = result.closed_previous ?? 0
        toast.success(
          `Imported ${result.created} job(s). Skipped: ${result.skipped}.${closed ? ` Closed ${closed} previous open job(s).` : ''}`,
        )
        if (result.errors?.length) {
          toast.message('Import finished with row warnings', {
            description: `${result.errors.length} issue(s). Check server logs or re-export the scraper file.`,
          })
        }
        await reloadJobs(t)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Import failed')
      } finally {
        setIsLoading(false)
      }
    },
    [linkedinReplaceOpen, reloadJobs, token],
  )

  const handleLinkedInJsonInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    void processLinkedInJsonFile(file)
  }

  const onLinkedinDragEnter = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    linkedinDragDepthRef.current += 1
    setLinkedinDropActive(true)
  }

  const onLinkedinDragLeave = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    linkedinDragDepthRef.current -= 1
    if (linkedinDragDepthRef.current <= 0) {
      linkedinDragDepthRef.current = 0
      setLinkedinDropActive(false)
    }
  }

  const onLinkedinDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    linkedinDragDepthRef.current = 0
    setLinkedinDropActive(false)
    if (isLoading) return
    const f = event.dataTransfer.files?.[0]
    if (!f) {
      toast.error('No file received. Drop one .json file, or click the area to browse.')
      return
    }
    void processLinkedInJsonFile(f)
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

  const checkDbHealth = handleDatabaseCheck

  return {
    section,
    setSection,
    commandOpen,
    setCommandOpen,
    token,
    setToken,
    search,
    setSearch,
    boardQuery,
    setBoardQuery,
    isLoading,
    students,
    setStudents,
    selectedStudentId,
    setSelectedStudentId,
    manualWorkflowStages,
    setManualWorkflowStages,
    draggedStudentId,
    setDraggedStudentId,
    dragOverStage,
    setDragOverStage,
    metrics,
    monthlyKpis,
    roleSplitInsights,
    activityLogs,
    overview,
    batches,
    selectedBatchId,
    setSelectedBatchId,
    classInsights,
    batchFormMode,
    setBatchFormMode,
    batchPayload,
    setBatchPayload,
    editingBatchId,
    setEditingBatchId,
    jobs,
    jobListFilter,
    draggedJobId,
    setDraggedJobId,
    waitlistEntries,
    userActivityEntries,
    jobPayload,
    setJobPayload,
    jobImportFileRef,
    jobImportLinkedInRef,
    linkedinReplaceOpen,
    setLinkedinReplaceOpen,
    linkedinDropActive,
    createPayload,
    setCreatePayload,
    selectedStudent,
    selectedBatch,
    getWorkflowStage,
    boardStudents,
    workflowColumns,
    moveStudentToStage,
    handleDropToStage,
    loadAdminData,
    handleUpdateWaitlistStatus,
    openClassDetail,
    handleCreateStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    handleCreateJob,
    handleJobListFilterChange,
    handleToggleJobStatus,
    handleToggleJobFixture,
    handleSeedFixtureJobs,
    handleDropJobOn,
    handleDeleteJob,
    handleDownloadJobImportTemplate,
    handleJobImportFile,
    processLinkedInJsonFile,
    handleLinkedInJsonInputChange,
    onLinkedinDragEnter,
    onLinkedinDragLeave,
    onLinkedinDrop,
    handleCreateBatch,
    handleUpdateBatch,
    handleDeleteBatch,
    startEditBatch,
    checkDbHealth,
  }
}

export type AdminWorkspaceValue = ReturnType<typeof useAdminWorkspace>
