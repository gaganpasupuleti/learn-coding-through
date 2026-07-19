import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Mail, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { fetchAdminStudents, type AdminStudent } from '@/lib/api'
import {
  getJobSpyAdminKey,
  jobspyApi,
  setJobSpyAdminKey,
  type EmailDigestBody,
  type EmailPreviewResponse,
  type SendDigestResponse,
} from '@/lib/jobspy-api'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import {
  adminPaneCardClass,
  adminPaneHeaderClass,
  adminPaneScrollBodyClass,
  adminSectionRootClass,
  adminToolbarClass,
} from './dashboardPolish'

const EMAIL_MAX_JOBS_OPTIONS = [5, 10, 20, 30, 50] as const

function isActiveStudent(student: AdminStudent): boolean {
  return student.is_active && student.role === 'student'
}

export function EmailStationView() {
  const { token } = useAdminWorkspaceContext()

  const [students, setStudents] = useState<AdminStudent[]>([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())

  const [adminKeyInput, setAdminKeyInput] = useState(() => getJobSpyAdminKey())
  const [showKeyForm, setShowKeyForm] = useState(!getJobSpyAdminKey())

  const [emailSearchTerm, setEmailSearchTerm] = useState('python developer')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailIntro, setEmailIntro] = useState('')
  const [emailMaxJobs, setEmailMaxJobs] = useState<number>(20)
  const [testEmail, setTestEmail] = useState('')
  const [emailPreview, setEmailPreview] = useState<EmailPreviewResponse | null>(null)
  const [emailResult, setEmailResult] = useState<SendDigestResponse | null>(null)
  const [emailLoading, setEmailLoading] = useState<string | null>(null)

  const loadStudents = useCallback(async () => {
    const authToken = token.trim()
    if (!authToken) {
      setStudentsLoading(false)
      return
    }
    setStudentsLoading(true)
    try {
      const rows = await fetchAdminStudents(authToken, undefined, { isActive: true })
      const activeStudents = rows.filter(isActiveStudent)
      setStudents(activeStudents)
      setSelectedEmails(new Set(activeStudents.map((s) => s.email)))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load students')
    } finally {
      setStudentsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadStudents()
  }, [loadStudents])

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase()
    if (!q) return students
    return students.filter(
      (s) => s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    )
  }, [studentSearch, students])

  const selectedCount = selectedEmails.size

  const toggleStudent = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev)
      if (next.has(email)) next.delete(email)
      else next.add(email)
      return next
    })
  }

  const selectAllVisible = () => {
    setSelectedEmails((prev) => {
      const next = new Set(prev)
      for (const student of filteredStudents) next.add(student.email)
      return next
    })
  }

  const clearVisible = () => {
    setSelectedEmails((prev) => {
      const next = new Set(prev)
      for (const student of filteredStudents) next.delete(student.email)
      return next
    })
  }

  const saveAdminKey = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = adminKeyInput.trim()
    if (!trimmed) {
      toast.error('Enter admin key')
      return
    }
    setJobSpyAdminKey(trimmed)
    setShowKeyForm(false)
    toast.success('Admin key saved')
  }

  const buildEmailBody = (): EmailDigestBody => ({
    jobIds: [],
    searchTerm: emailSearchTerm.trim() || 'python developer',
    location: 'India',
    subjectOverride: emailSubject.trim() || undefined,
    introMessage: emailIntro.trim() || undefined,
    maxJobs: emailMaxJobs,
  })

  const selectedRecipientEmails = useMemo(() => Array.from(selectedEmails), [selectedEmails])

  const requireAdminKey = (): string | null => {
    const key = getJobSpyAdminKey()
    if (!key) {
      setShowKeyForm(true)
      toast.error('Save admin key first')
      return null
    }
    return key
  }

  const runEmailPreview = async () => {
    const key = requireAdminKey()
    if (!key) return
    setEmailLoading('preview')
    setEmailResult(null)
    try {
      const res = await jobspyApi.emailPreview(buildEmailBody(), key)
      setEmailPreview(res)
      toast.success(`Preview ready — ${res.jobCount} job(s)`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Preview failed')
    } finally {
      setEmailLoading(null)
    }
  }

  const runTestSend = async () => {
    const key = requireAdminKey()
    if (!key) return
    setEmailLoading('test')
    setEmailResult(null)
    try {
      const res = await jobspyApi.sendDigest(
        { ...buildEmailBody(), mode: 'test', testEmail: testEmail.trim() || undefined },
        key,
      )
      setEmailResult(res)
      toast.success(res.message)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Test send failed')
    } finally {
      setEmailLoading(null)
    }
  }

  const runDryRun = async () => {
    const key = requireAdminKey()
    if (!key) return
    if (selectedCount === 0) {
      toast.error('Select at least one student')
      return
    }
    setEmailLoading('dry_run')
    setEmailResult(null)
    try {
      const res = await jobspyApi.sendDigest(
        { ...buildEmailBody(), mode: 'dry_run', recipientEmails: selectedRecipientEmails },
        key,
      )
      setEmailResult(res)
      toast.success(`Dry run — ${res.recipientCount ?? 0} recipient(s), ${res.sentCount} sent`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Dry run failed')
    } finally {
      setEmailLoading(null)
    }
  }

  const runLiveSend = async () => {
    const key = requireAdminKey()
    if (!key) return
    if (selectedCount === 0) {
      toast.error('Select at least one student')
      return
    }
    setEmailLoading('live')
    setEmailResult(null)
    try {
      const res = await jobspyApi.sendDigest(
        { ...buildEmailBody(), mode: 'live', recipientEmails: selectedRecipientEmails },
        key,
      )
      setEmailResult(res)
      toast.success(res.message)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Live send failed')
    } finally {
      setEmailLoading(null)
    }
  }

  return (
    <div className={adminSectionRootClass}>
      <div className={adminToolbarClass}>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Email Station</h2>
          <p className="text-[11px] text-muted-foreground">
            Compose job digests and send to active students. Preview and test send are safe; live send requires{' '}
            <code className="text-[10px]">JOB_MAIL_ENABLED=true</code>.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => void loadStudents()} disabled={studentsLoading}>
          {studentsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
          Refresh roster
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden xl:grid-cols-5 xl:grid-rows-1">
        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0 xl:col-span-3')}>
          <div className={adminPaneHeaderClass}>Compose digest</div>
          <div className={cn(adminPaneScrollBodyClass, 'space-y-4')}>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-900">Access</h3>
              {showKeyForm ? (
                <form onSubmit={saveAdminKey} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="email-station-admin-key" className="text-xs">X-Admin-Key</Label>
                    <Input
                      id="email-station-admin-key"
                      type="password"
                      value={adminKeyInput}
                      onChange={(e) => setAdminKeyInput(e.target.value)}
                      placeholder="Enter admin key"
                      className="h-8 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">Must match ADMIN_JOB_KEY in backend/.env</p>
                  </div>
                  <Button type="submit" size="sm" className="self-end bg-blue-600 hover:bg-blue-700">Save key</Button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-700 font-medium">Admin key configured</span>
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowKeyForm(true)}>Change</Button>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-700" />
                <h3 className="text-xs font-semibold text-indigo-950">Digest content</h3>
                <Badge variant="secondary" className="text-[10px]">India · active jobs</Badge>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Live send to selected students is <strong>disabled</strong> until{' '}
                  <code className="text-[10px]">JOB_MAIL_ENABLED=true</code> is set on the server.
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="email-subject" className="text-xs">Subject (optional override)</Label>
                  <Input id="email-subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Auto-generated if empty" className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-topic" className="text-xs">Keyword / topic</Label>
                  <Input id="email-topic" value={emailSearchTerm} onChange={(e) => setEmailSearchTerm(e.target.value)} placeholder="python developer" className="h-8 text-xs" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="email-intro" className="text-xs">Intro message (plain text)</Label>
                  <Textarea id="email-intro" value={emailIntro} onChange={(e) => setEmailIntro(e.target.value)} placeholder="Short note for students — no HTML" rows={3} className="resize-y text-xs" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-max-jobs" className="text-xs">Max jobs in digest</Label>
                  <select id="email-max-jobs" className="flex h-8 w-full rounded-md border border-input bg-white px-3 text-xs" value={emailMaxJobs} onChange={(e) => setEmailMaxJobs(Number(e.target.value))}>
                    {EMAIL_MAX_JOBS_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n} roles</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="test-email" className="text-xs">Test recipient</Label>
                  <Input id="test-email" type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="Or JOB_MAIL_TEST_RECIPIENT on server" className="h-8 text-xs" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" disabled={!!emailLoading} onClick={() => void runEmailPreview()}>
                  {emailLoading === 'preview' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Preview digest
                </Button>
                <Button type="button" size="sm" disabled={!!emailLoading} onClick={() => void runTestSend()}>
                  {emailLoading === 'test' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send test email
                </Button>
                <Button type="button" variant="secondary" size="sm" disabled={!!emailLoading || selectedCount === 0} onClick={() => void runDryRun()}>
                  {emailLoading === 'dry_run' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Dry run ({selectedCount})
                </Button>
                <Button type="button" size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={!!emailLoading || selectedCount === 0} onClick={() => void runLiveSend()}>
                  {emailLoading === 'live' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send to selected ({selectedCount})
                </Button>
              </div>
            </section>

            {emailPreview && (
              <div className="rounded-xl border border-indigo-100 bg-white p-4 text-xs space-y-3">
                <p><span className="font-medium text-slate-700">Subject:</span> {emailPreview.subject}</p>
                <p className="text-muted-foreground">Jobs in digest: {emailPreview.jobCount}</p>
                <details>
                  <summary className="cursor-pointer font-medium text-indigo-800">HTML preview</summary>
                  <div className="mt-2 max-h-64 overflow-auto rounded border border-slate-100 p-2 bg-slate-50" dangerouslySetInnerHTML={{ __html: emailPreview.html }} />
                </details>
              </div>
            )}

            {emailResult && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-1">
                <p><span className="font-medium">Mode:</span> {emailResult.mode}</p>
                <p><span className="font-medium">Message:</span> {emailResult.message}</p>
                {emailResult.jobCount != null && <p>Jobs: {emailResult.jobCount}</p>}
                {emailResult.recipientCount != null && <p>Recipients: {emailResult.recipientCount}</p>}
                <p>Sent: {emailResult.sentCount} · Failed: {emailResult.failedCount}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0 xl:col-span-2')}>
          <div className={adminPaneHeaderClass}>Active students</div>
          <div className="flex shrink-0 flex-col gap-2 border-b border-slate-200/80 p-2 dark:border-border">
            <Input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search name or email…" className="h-8 text-xs" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] text-muted-foreground">
                <span className="font-semibold tabular-nums text-foreground">{students.length}</span> active ·{' '}
                <span className="font-semibold tabular-nums text-foreground">{selectedCount}</span> selected
              </p>
              <div className="flex gap-1">
                <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={selectAllVisible}>All</Button>
                <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={clearVisible}>None</Button>
              </div>
            </div>
          </div>
          <div className={cn(adminPaneScrollBodyClass, 'space-y-1')}>
            {studentsLoading && (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading students…
              </div>
            )}
            {!studentsLoading && filteredStudents.length === 0 && (
              <div className="rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-6 text-center text-[11px] text-muted-foreground">
                No active students match your search.
              </div>
            )}
            {filteredStudents.map((student) => {
              const checked = selectedEmails.has(student.email)
              return (
                <label
                  key={student.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-2 rounded-md border p-2 text-xs transition',
                    checked ? 'border-indigo-300 bg-indigo-50/60' : 'border-transparent hover:bg-muted/30',
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded"
                    checked={checked}
                    onChange={() => toggleStudent(student.email)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{student.full_name}</span>
                    <span className="block truncate text-[10px] text-muted-foreground">{student.email}</span>
                    {student.batch_name && (
                      <span className="block text-[10px] text-muted-foreground">{student.batch_name}</span>
                    )}
                  </span>
                </label>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
