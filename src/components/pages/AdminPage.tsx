import { useMemo, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
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
  fetchAdminRoleSplitInsights,
  fetchAdminStudents,
  updateAdminStudent,
} from '@/lib/api'

const chartColors = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted-foreground))',
]

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

export function AdminPage() {
  const [adminView, setAdminView] = useState<'overview' | 'class_timings' | 'class_detail' | 'job_portal'>('overview')
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)

  const [token, setToken] = useState('')
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState<AdminStudent[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([])
  const [roleSplitInsights, setRoleSplitInsights] = useState<AdminRoleSplitInsights | null>(null)

  const [batches, setBatches] = useState<AdminBatch[]>([])
  const [classInsights, setClassInsights] = useState<AdminClassInsights | null>(null)

  const [jobs, setJobs] = useState<AdminJobPost[]>([])
  const [jobPayload, setJobPayload] = useState<AdminJobCreatePayload>({
    title: '',
    company_name: '',
    location: '',
    employment_type: 'Full-time',
    description: '',
    eligible_batch_id: null,
  })

  const [createPayload, setCreatePayload] = useState<AdminStudentCreatePayload>(defaultCreatePayload)

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [students, selectedStudentId]
  )

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.id === selectedBatchId) ?? null,
    [batches, selectedBatchId]
  )

  const loadAdminData = async () => {
    if (!token.trim()) {
      toast.error('Paste an admin bearer token first.')
      return
    }

    try {
      setIsLoading(true)
      const [studentList, adminMetrics, activity, splitInsights, batchList, jobList] = await Promise.all([
        fetchAdminStudents(token, search),
        fetchAdminMetrics(token),
        fetchAdminActivity(token, 20),
        fetchAdminRoleSplitInsights(token),
        fetchAdminBatches(token),
        fetchAdminJobs(token),
      ])

      setStudents(studentList)
      setMetrics(adminMetrics)
      setActivityLogs(activity)
      setRoleSplitInsights(splitInsights)
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
      setAdminView('class_detail')
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
      setJobPayload({
        title: '',
        company_name: '',
        location: '',
        employment_type: 'Full-time',
        description: '',
        eligible_batch_id: null,
      })
      setJobs(await fetchAdminJobs(token))
      toast.success('Job created successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create job'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background antialiased">
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-none tracking-tight">Admin Portal</h1>
          <p className="text-base text-muted-foreground leading-7 font-medium">Faculty + student insights, class operations, and job placement portal.</p>
        </div>

        <Card className="p-4 space-y-3">
          <h2 className="text-xl font-serif font-semibold tracking-tight">Admin Access Token</h2>
          <Input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste admin bearer token" type="password" />
          <div className="flex gap-2">
            <Button onClick={loadAdminData} disabled={isLoading}>Load Data</Button>
            <Button variant="outline" onClick={() => { setToken(''); setStudents([]); setMetrics(null); setSelectedStudentId(null) }}>Clear</Button>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={adminView === 'overview' ? 'default' : 'outline'} size="sm" onClick={() => setAdminView('overview')}>Overview</Button>
            <Button variant={adminView === 'class_timings' ? 'default' : 'outline'} size="sm" onClick={() => setAdminView('class_timings')}>Class Timings</Button>
            <Button variant={adminView === 'job_portal' ? 'default' : 'outline'} size="sm" onClick={() => setAdminView('job_portal')}>Job Portal</Button>
            <Button variant={adminView === 'class_detail' ? 'default' : 'outline'} size="sm" onClick={() => selectedBatchId && setAdminView('class_detail')} disabled={!selectedBatchId}>Open Class Detail</Button>
          </div>
        </Card>

        {adminView === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4 space-y-3">
                <h3 className="text-lg font-serif font-semibold tracking-tight">Student Insights</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(roleSplitInsights?.student_insights ?? []).map((item) => (
                    <div key={item.label} className="rounded border p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-semibold tabular-nums mt-2">{item.value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <h3 className="text-lg font-serif font-semibold tracking-tight">Faculty Insights</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(roleSplitInsights?.faculty_insights ?? []).map((item) => (
                    <div key={item.label} className="rounded border p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-semibold tabular-nums mt-2">{item.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4 min-h-[110px] flex flex-col items-center justify-center text-center">
                <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">Total Students</p>
                <p className="text-2xl font-semibold tabular-nums leading-none mt-2">{metrics?.total_students ?? '-'}</p>
              </Card>
              <Card className="p-4 min-h-[110px] flex flex-col items-center justify-center text-center">
                <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">Total Admins</p>
                <p className="text-2xl font-semibold tabular-nums leading-none mt-2">{metrics?.total_admins ?? '-'}</p>
              </Card>
              <Card className="p-4 min-h-[110px] flex flex-col items-center justify-center text-center">
                <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">Active Students</p>
                <p className="text-2xl font-semibold tabular-nums leading-none mt-2">{metrics?.active_students ?? '-'}</p>
              </Card>
              <Card className="p-4 min-h-[110px] flex flex-col items-center justify-center text-center">
                <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">Inactive Students</p>
                <p className="text-2xl font-semibold tabular-nums leading-none mt-2">{metrics?.inactive_students ?? '-'}</p>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-serif font-semibold tracking-tight">Students</h2>
                  <div className="flex gap-2">
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" className="w-56" />
                    <Button variant="outline" onClick={loadAdminData} disabled={isLoading}>Search</Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                  {students.map((student) => (
                    <button key={student.id} className={`w-full rounded-md border p-3 text-left transition ${selectedStudentId === student.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`} onClick={() => setSelectedStudentId(student.id)}>
                      <p className="text-base font-semibold tracking-tight">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">Role: {student.role} · Credits: {student.credit_balance} · XP: {student.xp_points}</p>
                      <p className="text-sm text-muted-foreground mt-1">Cohort: {student.cohort_name || '-'} · Batch: {student.batch_name || '-'} · Active: {student.is_active ? 'Yes' : 'No'}</p>
                    </button>
                  ))}
                  {students.length === 0 && <p className="text-base text-muted-foreground">No students found.</p>}
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <h2 className="text-xl font-serif font-semibold tracking-tight">Student Detail / Edit</h2>
                {!selectedStudent && <p className="text-base text-muted-foreground">Select a student to edit details.</p>}

                {selectedStudent && (
                  <div className="space-y-3">
                    <Input value={selectedStudent.full_name} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, full_name: event.target.value } : item))} placeholder="Full name" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={selectedStudent.role} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, role: event.target.value } : item))} placeholder="Role" />
                      <Input value={String(selectedStudent.credit_balance)} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, credit_balance: Number(event.target.value || 0) } : item))} placeholder="Credits" type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={String(selectedStudent.xp_points)} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, xp_points: Number(event.target.value || 0) } : item))} placeholder="XP points" type="number" />
                      <Input value={String(selectedStudent.streak_days)} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, streak_days: Number(event.target.value || 0) } : item))} placeholder="Streak days" type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={selectedStudent.cohort_name ?? ''} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, cohort_name: event.target.value || null } : item))} placeholder="Cohort" />
                      <Input value={selectedStudent.batch_name ?? ''} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, batch_name: event.target.value || null } : item))} placeholder="Batch" />
                    </div>
                    <label className="flex items-center gap-2 text-base">
                      <input type="checkbox" checked={selectedStudent.is_active} onChange={(event) => setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? { ...item, is_active: event.target.checked } : item))} />
                      Active student
                    </label>
                    <Button onClick={handleUpdateStudent} disabled={isLoading}>Save Student Changes</Button>
                  </div>
                )}
              </Card>
            </div>

            <Card className="p-4 space-y-4">
              <h2 className="text-xl font-serif font-semibold tracking-tight">Add New Student</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={createPayload.full_name} onChange={(event) => setCreatePayload((prev) => ({ ...prev, full_name: event.target.value }))} placeholder="Full name" />
                <Input value={createPayload.email} onChange={(event) => setCreatePayload((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email" type="email" />
                <Input value={createPayload.password} onChange={(event) => setCreatePayload((prev) => ({ ...prev, password: event.target.value }))} placeholder="Temporary password" type="password" />
                <Input value={createPayload.role} onChange={(event) => setCreatePayload((prev) => ({ ...prev, role: event.target.value }))} placeholder="Role (student/admin)" />
                <Input value={String(createPayload.credit_balance)} onChange={(event) => setCreatePayload((prev) => ({ ...prev, credit_balance: Number(event.target.value || 0) }))} placeholder="Credit balance" type="number" />
                <Input value={String(createPayload.xp_points)} onChange={(event) => setCreatePayload((prev) => ({ ...prev, xp_points: Number(event.target.value || 0) }))} placeholder="XP points" type="number" />
                <Input value={createPayload.cohort_name ?? ''} onChange={(event) => setCreatePayload((prev) => ({ ...prev, cohort_name: event.target.value || null }))} placeholder="Cohort" />
                <Input value={createPayload.batch_name ?? ''} onChange={(event) => setCreatePayload((prev) => ({ ...prev, batch_name: event.target.value || null }))} placeholder="Batch" />
              </div>
              <label className="flex items-center gap-2 text-base">
                <input type="checkbox" checked={createPayload.is_active} onChange={(event) => setCreatePayload((prev) => ({ ...prev, is_active: event.target.checked }))} />
                Active student
              </label>
              <Button onClick={handleCreateStudent} disabled={isLoading}>Create Student</Button>
            </Card>

            <Card className="p-4 space-y-4">
              <h2 className="text-xl font-serif font-semibold tracking-tight">Recent Admin Activity</h2>
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {activityLogs.map((entry) => (
                  <div key={entry.id} className="rounded-md border p-3">
                    <p className="text-base font-semibold tracking-tight">{entry.action}</p>
                    <p className="text-sm text-muted-foreground font-medium">{entry.details || 'No details'}</p>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Admin #{entry.admin_user_id} · Target #{entry.target_user_id ?? '-'} · {new Date(entry.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {activityLogs.length === 0 && <p className="text-base text-muted-foreground">No recent activity yet.</p>}
              </div>
            </Card>
          </div>
        )}

        {adminView === 'class_timings' && (
          <Card className="p-4 space-y-4">
            <div>
              <h2 className="text-xl font-serif font-semibold tracking-tight">Class Timings & Batches (IST)</h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">Open any class to view enrolled students, project status, and attendance charts.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {batches.map((batch) => (
                <div key={batch.id} className="rounded-md border p-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold tracking-tight">{batch.name}</p>
                      <p className="text-sm text-muted-foreground font-medium">{batch.track}</p>
                    </div>
                    <span className="inline-flex items-center justify-center h-6 text-xs uppercase tracking-[0.08em] rounded bg-primary/10 px-2 text-primary font-semibold leading-none">{batch.mode}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-muted-foreground">Days</p><p className="font-medium">{batch.days}</p>
                    <p className="text-muted-foreground">Time</p><p className="font-medium tabular-nums">{batch.time_ist}</p>
                    <p className="text-muted-foreground">Start</p><p className="font-medium">{batch.start_date}</p>
                    <p className="text-muted-foreground">Mentor</p><p className="font-medium">{batch.mentor_name ?? 'TBD'}</p>
                    <p className="text-muted-foreground">Seats</p><p className="font-medium tabular-nums">{batch.seats_filled}/{batch.seats_total}</p>
                  </div>
                  <Button size="sm" className="w-full" onClick={() => openClassDetail(batch.id)}>Open Class</Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {adminView === 'class_detail' && selectedBatch && classInsights && (
          <div className="space-y-4">
            <Card className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-serif font-semibold tracking-tight">{selectedBatch.name}</h2>
                  <p className="text-sm text-muted-foreground font-medium">{selectedBatch.track} · {selectedBatch.days} · {selectedBatch.time_ist} (IST)</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setAdminView('class_timings')}>Back to Timings</Button>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4 space-y-2">
                <h3 className="text-base font-serif font-semibold">Attendance Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={classInsights.attendance_pie} dataKey="value" nameKey="label" outerRadius={90}>
                        {classInsights.attendance_pie.map((slice, index) => (
                          <Cell key={slice.label} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-4 space-y-2">
                <h3 className="text-base font-serif font-semibold">Project Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={classInsights.project_status_pie} dataKey="value" nameKey="label" outerRadius={90}>
                        {classInsights.project_status_pie.map((slice, index) => (
                          <Cell key={slice.label} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card className="p-4 space-y-3">
              <h3 className="text-lg font-serif font-semibold tracking-tight">Enrolled Students, Attendance & Projects</h3>
              <div className="space-y-2 max-h-[460px] overflow-auto pr-1">
                {classInsights.students.map((student) => (
                  <div key={`${student.user_id}-${student.enrollment_role}`} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-base font-semibold tracking-tight">{student.full_name}</p>
                      <span className="inline-flex items-center justify-center h-6 text-xs uppercase tracking-[0.08em] rounded bg-primary/10 px-2 text-primary font-semibold leading-none">{student.project_status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Role: {student.enrollment_role} · Attendance: {student.attendance_pct}%</p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">{student.college_info ?? 'N/A'} · {student.year_or_grad ?? 'N/A'}</p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Project: {student.project_title ?? '-'}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {adminView === 'job_portal' && (
          <div className="space-y-4">
            <Card className="p-4 space-y-3">
              <h2 className="text-xl font-serif font-semibold tracking-tight">Job Portal</h2>
              <p className="text-sm text-muted-foreground font-medium">Create jobs, map to batches, and track applications.</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={jobPayload.title} onChange={(event) => setJobPayload((prev) => ({ ...prev, title: event.target.value }))} placeholder="Job title" />
                <Input value={jobPayload.company_name} onChange={(event) => setJobPayload((prev) => ({ ...prev, company_name: event.target.value }))} placeholder="Company" />
                <Input value={jobPayload.location} onChange={(event) => setJobPayload((prev) => ({ ...prev, location: event.target.value }))} placeholder="Location" />
                <Input value={jobPayload.employment_type} onChange={(event) => setJobPayload((prev) => ({ ...prev, employment_type: event.target.value }))} placeholder="Employment type" />
                <Input value={jobPayload.description ?? ''} onChange={(event) => setJobPayload((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" />
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={jobPayload.eligible_batch_id ?? ''}
                  onChange={(event) => setJobPayload((prev) => ({ ...prev, eligible_batch_id: event.target.value ? Number(event.target.value) : null }))}
                >
                  <option value="">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleCreateJob} disabled={isLoading}>Create Job</Button>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="text-lg font-serif font-semibold tracking-tight">Openings</h3>
              <div className="space-y-2 max-h-[460px] overflow-auto pr-1">
                {jobs.map((job) => (
                  <div key={job.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-base font-semibold tracking-tight">{job.title}</p>
                      <span className="inline-flex items-center justify-center h-6 text-xs uppercase tracking-[0.08em] rounded bg-primary/10 px-2 text-primary font-semibold leading-none">{job.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mt-1">{job.company_name} · {job.location} · {job.employment_type}</p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Eligible Batch: {job.eligible_batch_name ?? 'All'}</p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Applications: {job.applications_count}</p>
                  </div>
                ))}
                {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs yet.</p>}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
