import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  type AdminActivityLog,
  type AdminFeedbackItem,
  type AdminBatch,
  type AdminBatchCreatePayload,
  type AdminClassInsights,
  type AdminMetrics,
  type AdminMonthlyKpis,
  type AdminPlatformOverview,
  type AdminRegistrationWaitlistEntry,
  type AdminRoleSplitInsights,
  type AdminStudent,
  type AdminStudentCreatePayload,
  type AdminUserActivity,
  createAdminBatch,
  createAdminStudent,
  deleteAdminBatch,
  deleteAdminStudent,
  fetchAdminActivity,
  fetchAdminFeedback,
  fetchAdminBatches,
  fetchAdminClassInsights,
  fetchAdminMetrics,
  fetchAdminMonthlyKpis,
  fetchAdminPlatformOverview,
  fetchAdminRegistrationWaitlist,
  fetchAdminRoleSplitInsights,
  fetchAdminUserActivity,
  fetchDatabaseHealth,
  fetchAdminStudents,
  updateAdminBatch,
  updateAdminRegistrationWaitlistStatus,
  updateAdminStudent,
  reviewAdminFeedback,
} from "@/lib/api"
import { getAuthToken } from "@/lib/auth"

import {
  WORKFLOW_STAGE_STORAGE_KEY,
  defaultBatchPayload,
  defaultCreatePayload,
} from "../constants"
import { blendAdminDashboardData } from "../utils/dashboardKpiBlend"
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
  const [feedbackEntries, setFeedbackEntries] = useState<AdminFeedbackItem[]>([])
  const [overview, setOverview] = useState<AdminPlatformOverview | null>(null)

  const [batches, setBatches] = useState<AdminBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)
  const [classInsights, setClassInsights] = useState<AdminClassInsights | null>(null)
  const [batchFormMode, setBatchFormMode] = useState<'create' | 'edit'>('create')
  const [batchPayload, setBatchPayload] = useState<AdminBatchCreatePayload>(defaultBatchPayload)
  const [editingBatchId, setEditingBatchId] = useState<number | null>(null)

  const [waitlistEntries, setWaitlistEntries] = useState<AdminRegistrationWaitlistEntry[]>([])
  const [userActivityEntries, setUserActivityEntries] = useState<AdminUserActivity[]>([])
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
        fetchAdminRegistrationWaitlist(t),
        fetchAdminUserActivity(t, 500),
        fetchAdminPlatformOverview(t),
        fetchAdminFeedback(t, { status: 'all', limit: 200 }),
      ])

      const label = [
        'students',
        'metrics',
        'monthly KPIs',
        'role insights',
        'activity',
        'batches',
        'waitlist',
        'user activity',
        'overview',
        'feedback',
      ]

      const failed: string[] = []
      const pick = <T,>(index: number, fallback: T): T => {
        const result = results[index]
        if (!result) {
          failed.push(label[index] ?? `request-${index}`)
          return fallback
        }
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
      const waitlist = pick(6, [] as AdminRegistrationWaitlistEntry[])
      const userActivity = pick(7, [] as AdminUserActivity[])
      const platformOverview = pick(8, null)
      const feedbackList = pick(9, [] as AdminFeedbackItem[])

      const blended = blendAdminDashboardData({
        overview: platformOverview,
        metrics: adminMetrics,
        monthlyKpis: kpis,
        students: studentList,
        batches: batchList,
        waitlist,
        roleSplit: splitInsights,
      })

      setStudents(studentList)
      setMetrics(blended.metrics)
      setMonthlyKpis(blended.monthlyKpis)
      setRoleSplitInsights(splitInsights)
      setActivityLogs(activity)
      setFeedbackEntries(feedbackList)
      setBatches(batchList)
      setWaitlistEntries(waitlist)
      setUserActivityEntries(userActivity)
      setOverview(blended.overview)

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

  const reviewFeedback = async (feedbackId: number, adminNotes: string | null) => {
    const t = token.trim() || getAuthToken() || ''
    if (!t) {
      toast.error('No admin token available.')
      return
    }
    const updated = await reviewAdminFeedback(t, feedbackId, { admin_notes: adminNotes })
    setFeedbackEntries((prev) => prev.map((e) => (e.id === feedbackId ? updated : e)))
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
    feedbackEntries,
    reviewFeedback,
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
    waitlistEntries,
    userActivityEntries,
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
    handleCreateBatch,
    handleUpdateBatch,
    handleDeleteBatch,
    startEditBatch,
    checkDbHealth,
  }
}

export type AdminWorkspaceValue = ReturnType<typeof useAdminWorkspace>
