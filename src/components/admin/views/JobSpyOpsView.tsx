import { useCallback, useEffect, useState } from 'react'
import { Download, ExternalLink, Loader2, Mail, RefreshCw, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  getJobSpyAdminKey,
  jobspyApi,
  setJobSpyAdminKey,
  exportJobsCsv,
  type EmailDigestBody,
  type JobStatsResponse,
  type RefreshResponse,
  type EmailPreviewResponse,
  type SendDigestResponse,
} from '@/lib/jobspy-api'
import { formatDateTimeISTShort } from '@/lib/formatDateTimeIST'

const EMAIL_MAX_JOBS_OPTIONS = [5, 10, 20, 30, 50] as const

const SOURCE_OPTIONS: { id: string; label: string; optional?: boolean }[] = [
  { id: 'indeed', label: 'Indeed' },
  { id: 'google', label: 'Google' },
  { id: 'naukri', label: 'Naukri' },
  { id: 'linkedin', label: 'LinkedIn', optional: true },
]

const MANUAL_RANGE_OPTIONS = [
  { value: 1, label: 'Last 24 hours' },
  { value: 3, label: 'Last 3 days' },
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
] as const

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${accent ?? 'text-slate-900'}`}>{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  )
}

function formatTs(v: string | null | undefined) {
  return formatDateTimeISTShort(v)
}

function sourceLabel(s: string) {
  const m: Record<string, string> = { indeed: 'Indeed', google: 'Google', naukri: 'Naukri', linkedin: 'LinkedIn' }
  return m[s] ?? s
}

function statusClass(s: string) {
  if (s === 'success') return 'bg-emerald-100 text-emerald-800'
  if (s === 'partial_success') return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}

export function JobSpyOpsView() {
  const [stats, setStats] = useState<JobStatsResponse | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<RefreshResponse | null>(null)
  const [sources, setSources] = useState<string[]>(['indeed', 'google', 'naukri'])
  const [dateRangeDays, setDateRangeDays] = useState(3)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [adminKeyInput, setAdminKeyInput] = useState(() => getJobSpyAdminKey())
  const [showKeyForm, setShowKeyForm] = useState(!getJobSpyAdminKey())
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [emailSearchTerm, setEmailSearchTerm] = useState('python developer')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailIntro, setEmailIntro] = useState('')
  const [emailMaxJobs, setEmailMaxJobs] = useState<number>(20)
  const [testEmail, setTestEmail] = useState('')
  const [emailPreview, setEmailPreview] = useState<EmailPreviewResponse | null>(null)
  const [emailResult, setEmailResult] = useState<SendDigestResponse | null>(null)
  const [emailLoading, setEmailLoading] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    const key = getJobSpyAdminKey()
    if (!key) {
      setStatsLoading(false)
      setStatsError('Set ADMIN_JOB_KEY to view the Job Refresh Dashboard.')
      return
    }
    setStatsLoading(true)
    setStatsError(null)
    try {
      setStats(await jobspyApi.getJobStats(key, { days: 7, limit: 10 }))
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : 'Failed to load dashboard')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        await jobspyApi.health()
        await loadStats()
      } catch {
        setStatsError('Jobs API not reachable. Start backend on port 8000.')
        setStatsLoading(false)
      }
    })()
  }, [loadStats])

  const saveAdminKey = (e: React.FormEvent) => {
    e.preventDefault()
    setJobSpyAdminKey(adminKeyInput.trim())
    setShowKeyForm(false)
    toast.success('Admin key saved')
    void loadStats()
  }

  const toggleSource = (id: string) => {
    setSources((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const runRefresh = async (profile: string, label: string) => {
    const key = getJobSpyAdminKey()
    if (!key) {
      setShowKeyForm(true)
      toast.error('Save admin key first')
      return
    }
    if (sources.length === 0) {
      toast.error('Select at least one source')
      return
    }
    setRefreshing(profile)
    try {
      const res = await jobspyApi.refreshJobs(
        { profile, sources, runMode: 'manual', dateRangeDays },
        key,
      )
      setLastRefresh(res)
      toast.success(`${label}: ${res.savedCount} saved (${res.totalFound} found)`)
      await loadStats()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Refresh failed')
    } finally {
      setRefreshing(null)
    }
  }

  const runInternFresher = async () => {
    const key = getJobSpyAdminKey()
    if (!key) return
    setRefreshing('intern_fresher')
    try {
      for (const p of ['internship_india', 'fresher_india'] as const) {
        const res = await jobspyApi.refreshJobs(
          { profile: p, sources, runMode: 'manual', dateRangeDays },
          key,
        )
        setLastRefresh(res)
      }
      toast.success('Intern & Fresher refresh complete')
      await loadStats()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Refresh failed')
    } finally {
      setRefreshing(null)
    }
  }

  const runCleanup = async () => {
    const key = getJobSpyAdminKey()
    if (!key) return
    setCleanupLoading(true)
    try {
      const res = await jobspyApi.cleanupLinks(key, 25)
      toast.success(`Checked ${res.checkedCount} links — ${res.markedExpired} expired, ${res.markedLinkFailed} failed`)
      await loadStats()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cleanup failed')
    } finally {
      setCleanupLoading(false)
    }
  }

  const buildEmailBody = (): EmailDigestBody => ({
    jobIds: [],
    searchTerm: emailSearchTerm.trim() || 'python developer',
    location: 'India',
    subjectOverride: emailSubject.trim() || undefined,
    introMessage: emailIntro.trim() || undefined,
    maxJobs: emailMaxJobs,
  })

  const runEmailPreview = async () => {
    const key = getJobSpyAdminKey()
    if (!key) {
      setShowKeyForm(true)
      toast.error('Save admin key first')
      return
    }
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
    const key = getJobSpyAdminKey()
    if (!key) {
      setShowKeyForm(true)
      toast.error('Save admin key first')
      return
    }
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
    const key = getJobSpyAdminKey()
    if (!key) {
      setShowKeyForm(true)
      toast.error('Save admin key first')
      return
    }
    setEmailLoading('dry_run')
    setEmailResult(null)
    try {
      const res = await jobspyApi.sendDigest({ ...buildEmailBody(), mode: 'dry_run' }, key)
      setEmailResult(res)
      toast.success(`Dry run — ${res.recipientCount ?? 0} student(s), ${res.sentCount} sent`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Dry run failed')
    } finally {
      setEmailLoading(null)
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
      <div className="space-y-6 pb-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Job Refresh Dashboard</h2>
            <p className="text-sm text-slate-600 mt-1">
              India-only job ingestion · Intern, fresher &amp; entry-level auto profiles ·{' '}
              <Badge variant="secondary" className="text-xs">Location: India only</Badge>
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={statsLoading} onClick={() => void loadStats()}>
            {statsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh dashboard
          </Button>
        </header>

        {statsError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{statsError}</div>
        )}

        {/* Admin key */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3">Access</h3>
          {showKeyForm ? (
            <form onSubmit={saveAdminKey} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="flex-1 space-y-1">
                <Label htmlFor="admin-key">X-Admin-Key</Label>
                <Input id="admin-key" type="password" value={adminKeyInput} onChange={(e) => setAdminKeyInput(e.target.value)} placeholder="Enter admin key" />
                <p className="text-xs text-slate-500">Must match ADMIN_JOB_KEY in backend/.env</p>
              </div>
              <Button type="submit" className="self-end bg-blue-600 hover:bg-blue-700">Save key</Button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-emerald-700 font-medium">Admin key configured</span>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowKeyForm(true)}>Change</Button>
            </div>
          )}
        </section>

        {/* Auto Refresh Status */}
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-emerald-900">Auto Refresh Status</h3>
          <p className="text-sm text-emerald-800">
            Railway cron every 8h runs <strong>internship_india</strong>, <strong>fresher_india</strong>, and{' '}
            <strong>entry_level_india</strong> only. Location locked to India. 1+ experience is manual-only.
          </p>
          <p className="text-xs text-emerald-700">
            Auto refresh derives range from the last successful auto run plus a 12h overlap buffer.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge className="bg-emerald-100 text-emerald-800">internship_india · auto</Badge>
            <Badge className="bg-emerald-100 text-emerald-800">fresher_india · auto</Badge>
            <Badge className="bg-emerald-100 text-emerald-800">entry_level_india · auto</Badge>
            <Badge variant="outline" className="border-slate-300">experienced_manual_india · manual only</Badge>
          </div>
          <p className="text-xs text-slate-600">
            Last auto refresh: {statsLoading ? '…' : formatTs(stats?.lastAutoRefreshAt)} · Last cleanup:{' '}
            {statsLoading ? '…' : formatTs(stats?.lastCleanupAt)}
          </p>
        </section>

        {/* Job DB Overview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900">Job DB Overview</h3>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-slate-700"
              onClick={() => {
                const key = getJobSpyAdminKey()
                if (!key) {
                  toast.error('No admin key configured — set it in the Access section first.')
                  return
                }
                void exportJobsCsv(key)
                  .then(({ blob, filename }) => {
                    const objUrl = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = objUrl
                    a.download = filename
                    a.click()
                    URL.revokeObjectURL(objUrl)
                    toast.success(`Downloaded ${filename}`)
                  })
                  .catch((err: unknown) => {
                    const msg = err instanceof Error ? err.message : String(err)
                    const isNetwork = msg.toLowerCase().includes('failed to fetch')
                    toast.error(isNetwork ? 'Export failed: network/CORS/API URL issue' : msg)
                  })
              }}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <StatCard label="Total in DB" value={statsLoading ? '…' : String(stats?.totalJobs ?? 0)} />
            <StatCard label="Active" value={statsLoading ? '…' : String(stats?.activeJobs ?? 0)} accent="text-emerald-700" />
            <StatCard label="Loaded today" value={statsLoading ? '…' : String(stats?.loadedToday ?? 0)} />
            <StatCard label="Last 24h" value={statsLoading ? '…' : String(stats?.loadedLast24Hours ?? 0)} />
            <StatCard label="Last 7d" value={statsLoading ? '…' : String(stats?.loadedLast7Days ?? 0)} />
            <StatCard label="Expired" value={statsLoading ? '…' : String(stats?.expiredJobs ?? 0)} accent="text-amber-700" />
            <StatCard label="Dead links" value={statsLoading ? '…' : String(stats?.linkFailedJobs ?? 0)} accent="text-red-700" />
            <StatCard label="Latest loaded" value={statsLoading ? '…' : formatTs(stats?.latestLoadedAt)} />
            <StatCard label="Last auto refresh" value={statsLoading ? '…' : formatTs(stats?.lastAutoRefreshAt)} />
            <StatCard label="Last cleanup" value={statsLoading ? '…' : formatTs(stats?.lastCleanupAt)} />
          </div>
        </section>

        {/* Manual Refresh */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900">Manual Refresh</h3>
            <p className="text-sm text-slate-600 mt-1">
              Location is fixed to <strong>India</strong> for Code Quest job alerts. No role typing needed — profiles use predefined search terms.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Manual refresh can go further back. Auto refresh uses the last successful run with overlap.
            </p>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <Label htmlFor="manual-date-range">Date range</Label>
            <select
              id="manual-date-range"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25"
              value={dateRangeDays}
              onChange={(e) => setDateRangeDays(Number(e.target.value))}
              disabled={!!refreshing}
            >
              {MANUAL_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Sources</Label>
            <div className="flex flex-wrap gap-4">
              {SOURCE_OPTIONS.map(({ id, label, optional }) => (
                <label key={id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={sources.includes(id)} onChange={() => toggleSource(id)} disabled={!!refreshing} className="rounded" />
                  {label}
                  {optional && <span className="text-xs text-slate-400">(optional)</span>}
                </label>
              ))}
            </div>
            {sources.includes('linkedin') && (
              <p className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                LinkedIn may rate-limit, block, or return zero jobs.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={!!refreshing} onClick={() => void runInternFresher()}>
              {refreshing === 'intern_fresher' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Refresh Intern &amp; Fresher
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={!!refreshing} onClick={() => void runRefresh('entry_level_india', 'Entry level')}>
              {refreshing === 'entry_level_india' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Refresh Entry-Level
            </Button>
            <Button variant="outline" disabled={!!refreshing} onClick={() => void runRefresh('experienced_manual_india', '1+ experience')}>
              {refreshing === 'experienced_manual_india' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Refresh 1+ Experience (manual)
            </Button>
            <Button variant="outline" disabled={cleanupLoading} onClick={() => void runCleanup()}>
              {cleanupLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Run link cleanup
            </Button>
          </div>

          {lastRefresh && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm space-y-1">
              <p className="font-medium text-slate-900">Last refresh — {lastRefresh.profileLabel}</p>
              <p>{lastRefresh.rangeLabel ?? `Range: last ${lastRefresh.hoursOld}h`} · Location: <strong>{lastRefresh.location}</strong></p>
              <p>Found: {lastRefresh.totalFound} · Saved: {lastRefresh.savedCount} · Dupes: {lastRefresh.skippedDuplicates}</p>
              <p>DB: {lastRefresh.totalJobsBefore} → {lastRefresh.totalJobsAfter} · Run #{lastRefresh.scrapeRunId} · {lastRefresh.status}</p>
              <p className="text-slate-600">Sources: {Object.entries(lastRefresh.sourceBreakdown).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>
            </div>
          )}
        </section>

        {/* Source Health */}
        {stats && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900">Source Health</h3>
            <div className="flex flex-wrap gap-2">
              {stats.sourceBreakdown.map(({ source, count }) => (
                <Badge key={source} variant="secondary" className="text-sm px-3 py-1">
                  {sourceLabel(source)}: {count} jobs
                  {stats.sourceFailureCounts[source] ? ` · ${stats.sourceFailureCounts[source]} failures` : ''}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Latest Jobs */}
        {stats && stats.latestJobs.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
            <h3 className="font-semibold text-slate-900 mb-3">Latest Jobs</h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2 pr-3">Loaded</th>
                  <th className="py-2">Apply</th>
                </tr>
              </thead>
              <tbody>
                {stats.latestJobs.map((j) => (
                  <tr key={j.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium max-w-[200px] truncate">{j.title}</td>
                    <td className="py-2 pr-3 text-slate-600">{j.company ?? '—'}</td>
                    <td className="py-2 pr-3"><Badge variant="outline">{sourceLabel(j.source)}</Badge></td>
                    <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">{formatTs(j.createdAt)}</td>
                    <td className="py-2">
                      <a href={j.jobUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Expired links */}
        {stats && stats.expiredJobSamples.length > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm overflow-x-auto">
            <h3 className="font-semibold text-amber-900 mb-3">Expired / Invalid Links ({stats.expiredJobs + stats.linkFailedJobs})</h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-amber-200 text-amber-800">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {stats.expiredJobSamples.map((j) => (
                  <tr key={j.id} className="border-b border-amber-100">
                    <td className="py-2 pr-3">{j.title}</td>
                    <td className="py-2 pr-3"><Badge className="bg-amber-200 text-amber-900">{j.linkStatus}</Badge></td>
                    <td className="py-2">{sourceLabel(j.source)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Recent Runs */}
        {stats && stats.recentScrapeRuns.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
            <h3 className="font-semibold text-slate-900 mb-3">Recent Runs</h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Profile</th>
                  <th className="py-2 pr-2">Location</th>
                  <th className="py-2 pr-2">Found</th>
                  <th className="py-2 pr-2">Saved</th>
                  <th className="py-2 pr-2">Dupes</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2">Started</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentScrapeRuns.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2">{r.id}</td>
                    <td className="py-2 pr-2 capitalize">{r.runType ?? 'manual'}</td>
                    <td className="py-2 pr-2">{r.profile ?? '—'}</td>
                    <td className="py-2 pr-2">{r.location}</td>
                    <td className="py-2 pr-2">{r.totalFound}</td>
                    <td className="py-2 pr-2">{r.savedCount}</td>
                    <td className="py-2 pr-2">{r.skippedDuplicates}</td>
                    <td className="py-2 pr-2"><Badge className={statusClass(r.status)}>{r.status}</Badge></td>
                    <td className="py-2 whitespace-nowrap">{formatTs(r.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Email Station — client-ready digest preview & safe test send */}
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-700" />
            <h3 className="font-semibold text-indigo-950">Email Station</h3>
            <Badge variant="secondary" className="text-[10px]">JOB_MAIL_ENABLED=false</Badge>
          </div>
          <p className="text-xs text-indigo-900/80">
            Compose a premium client-ready digest with editable subject and intro. Preview sends nothing. Test mode sends only to the test recipient.
          </p>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Live send to all registered students is <strong>disabled</strong> until{' '}
              <code className="text-[10px]">JOB_MAIL_ENABLED=true</code> is explicitly approved in production.
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-4xl">
            <div className="space-y-1">
              <Label htmlFor="email-subject" className="text-xs">Subject (optional override)</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email-topic" className="text-xs">Keyword / topic</Label>
              <Input
                id="email-topic"
                value={emailSearchTerm}
                onChange={(e) => setEmailSearchTerm(e.target.value)}
                placeholder="python developer"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="email-intro" className="text-xs">Intro message (plain text)</Label>
              <Textarea
                id="email-intro"
                value={emailIntro}
                onChange={(e) => setEmailIntro(e.target.value)}
                placeholder="Short note for students — no HTML"
                rows={3}
                className="resize-y text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email-max-jobs" className="text-xs">Max jobs in digest</Label>
              <select
                id="email-max-jobs"
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
                value={emailMaxJobs}
                onChange={(e) => setEmailMaxJobs(Number(e.target.value))}
              >
                {EMAIL_MAX_JOBS_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} roles</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="test-email" className="text-xs">Test recipient</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Or JOB_MAIL_TEST_RECIPIENT on server"
              />
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
            <Button type="button" variant="secondary" size="sm" disabled={!!emailLoading} onClick={() => void runDryRun()}>
              {emailLoading === 'dry_run' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Dry run (students)
            </Button>
            <Button type="button" variant="outline" size="sm" disabled title="Live student send disabled (JOB_MAIL_ENABLED=false)">
              Live send — blocked
            </Button>
          </div>
          {emailPreview && (
            <div className="rounded-xl border border-indigo-100 bg-white p-4 text-sm space-y-3">
              <p><span className="font-medium text-slate-700">Subject:</span> {emailPreview.subject}</p>
              <p className="text-xs text-slate-500">Jobs in digest: {emailPreview.jobCount}</p>
              {emailPreview.summary && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-indigo-50 p-2">
                    <div className="font-bold text-indigo-900">{emailPreview.summary.totalActiveJobs}</div>
                    <div className="text-indigo-600">Active Jobs</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2">
                    <div className="font-bold text-emerald-900">{emailPreview.summary.selectedJobsCount}</div>
                    <div className="text-emerald-600">Handpicked Roles</div>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-2">
                    <div className="font-bold text-orange-900">{emailPreview.summary.recentJobsCount}</div>
                    <div className="text-orange-600">Fresh This Week</div>
                  </div>
                </div>
              )}
              {emailPreview.summary && (
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-cyan-50 p-2">
                    <div className="font-bold text-cyan-900">{emailPreview.summary.internships24h}</div>
                    <div className="text-cyan-600">Internships Today</div>
                  </div>
                  <div className="rounded-lg bg-fuchsia-50 p-2">
                    <div className="font-bold text-fuchsia-900">{emailPreview.summary.freshers24h}</div>
                    <div className="text-fuchsia-600">Fresher Roles Today</div>
                  </div>
                </div>
              )}
              {emailPreview.summary && (
                <div className="text-xs text-slate-600 space-y-1 border-t pt-2">
                  {emailPreview.summary.topRoles.length > 0 && (
                    <p><span className="font-medium">Top Roles:</span> {emailPreview.summary.topRoles.join(', ')}</p>
                  )}
                  {emailPreview.summary.topLocations.length > 0 && (
                    <p><span className="font-medium">Hot Cities:</span> {emailPreview.summary.topLocations.join(', ')}</p>
                  )}
                  {emailPreview.summary.topCompanies.length > 0 && (
                    <p><span className="font-medium">Hiring Companies:</span> {emailPreview.summary.topCompanies.join(', ')}</p>
                  )}
                </div>
              )}
              <details>
                <summary className="cursor-pointer text-xs font-medium text-indigo-800">HTML preview</summary>
                <div
                  className="mt-2 max-h-64 overflow-auto rounded border border-slate-100 p-2 text-xs bg-slate-50"
                  dangerouslySetInnerHTML={{ __html: emailPreview.html }}
                />
              </details>
            </div>
          )}
          {emailResult && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm space-y-1">
              <p><span className="font-medium">Mode:</span> {emailResult.mode}</p>
              <p><span className="font-medium">Message:</span> {emailResult.message}</p>
              {emailResult.jobCount != null && <p>Jobs: {emailResult.jobCount}</p>}
              {emailResult.recipientCount != null && <p>Recipients: {emailResult.recipientCount}</p>}
              <p>Sent: {emailResult.sentCount} · Failed: {emailResult.failedCount}</p>
            </div>
          )}
        </section>

        {/* Advanced collapsed */}
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4">
          <button type="button" className="text-sm font-medium text-slate-700" onClick={() => setShowAdvanced((v) => !v)}>
            {showAdvanced ? '▼' : '▶'} Advanced / cron notes
          </button>
          {showAdvanced && (
            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <p>Auto cron (every 8h): <code>python scripts/run_job_auto_refresh.py</code> — internship, fresher, entry-level only.</p>
              <p>Daily cleanup: <code>python scripts/run_job_link_cleanup.py</code> — marks expired links, never deletes.</p>
              <p>1+ experience profile is manual-only and excluded from auto cron.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
