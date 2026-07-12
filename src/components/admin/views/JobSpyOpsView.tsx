import { useCallback, useEffect, useState } from 'react'
import { Download, ExternalLink, Loader2, RefreshCw, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  getJobSpyAdminKey,
  jobspyApi,
  setJobSpyAdminKey,
  exportJobsCsv,
  profileKeyLabel,
  type JobStatsResponse,
  type RefreshResponse,
} from '@/lib/jobspy-api'
import { formatDateTimeISTShort } from '@/lib/formatDateTimeIST'

const SOURCE_OPTIONS: { id: string; label: string; optional?: boolean }[] = [
  { id: 'indeed', label: 'Indeed' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'naukri', label: 'Naukri' },
  { id: 'foundit', label: 'Foundit' },
  { id: 'google', label: 'Google', optional: true },
]

const FALLBACK_PROFILE_OPTIONS = [
  { profile: 'internship_india', label: 'Internships', count: 0, autoEnabled: true },
  { profile: 'fresher_india', label: 'Fresher Jobs', count: 0, autoEnabled: true },
  { profile: 'entry_level_india', label: 'Entry Level', count: 0, autoEnabled: true },
  { profile: 'platform_crm_india', label: 'CRM & Low-Code Platform', count: 0, autoEnabled: true },
  { profile: 'ai_india', label: 'AI / Gen AI / Agentic', count: 0, autoEnabled: true },
  { profile: 'experienced_manual_india', label: '1+ Experience (manual)', count: 0, autoEnabled: false },
]

const DEFAULT_REFRESH_PROFILE = 'fresher_india'
const RUN_ALL_REFRESH_KEY = '__all__'
const ALL_SCRAPE_PROFILE_KEYS = FALLBACK_PROFILE_OPTIONS.map((p) => p.profile)
const JOB_LIST_LIMIT = 20

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
  const m: Record<string, string> = { indeed: 'Indeed', google: 'Google', linkedin: 'LinkedIn' }
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
  const [sources, setSources] = useState<string[]>(['indeed', 'google', 'linkedin'])
  const [dateRangeDays, setDateRangeDays] = useState(3)
  const [refreshProfile, setRefreshProfile] = useState(DEFAULT_REFRESH_PROFILE)
  const [jobFilterProfile, setJobFilterProfile] = useState('all')
  const [jobFilterRole, setJobFilterRole] = useState('all')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [adminKeyInput, setAdminKeyInput] = useState(() => getJobSpyAdminKey())
  const [showKeyForm, setShowKeyForm] = useState(!getJobSpyAdminKey())
  const [cleanupLoading, setCleanupLoading] = useState(false)

  const profileOptions = stats?.profileBreakdown?.length ? stats.profileBreakdown : FALLBACK_PROFILE_OPTIONS

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
      setStats(
        await jobspyApi.getJobStats(key, {
          days: 7,
          limit: JOB_LIST_LIMIT,
          profile: jobFilterProfile !== 'all' ? jobFilterProfile : undefined,
          roleId: jobFilterRole !== 'all' ? jobFilterRole : undefined,
        }),
      )
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : 'Failed to load dashboard')
    } finally {
      setStatsLoading(false)
    }
  }, [jobFilterProfile, jobFilterRole])

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

  const runRefresh = async () => {
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
    const label =
      stats?.profileBreakdown?.find((p) => p.profile === refreshProfile)?.label ?? refreshProfile
    setRefreshing(refreshProfile)
    try {
      const res = await jobspyApi.refreshJobs(
        { profile: refreshProfile, sources, runMode: 'manual', dateRangeDays },
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

  const runAllRefresh = async () => {
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
    const profiles = ALL_SCRAPE_PROFILE_KEYS
    setRefreshing(RUN_ALL_REFRESH_KEY)
    let totalFound = 0
    let totalSaved = 0
    let failures = 0
    try {
      for (let i = 0; i < profiles.length; i += 1) {
        const profileKey = profiles[i]
        const label =
          profileOptions.find((p) => p.profile === profileKey)?.label ??
          stats?.profileBreakdown?.find((p) => p.profile === profileKey)?.label ??
          profileKey
        toast.info(`Scraping ${i + 1}/${profiles.length}: ${label}…`, { duration: 4000 })
        try {
          const res = await jobspyApi.refreshJobs(
            { profile: profileKey, sources, runMode: 'manual', dateRangeDays },
            key,
          )
          totalFound += res.totalFound
          totalSaved += res.savedCount
          setLastRefresh(res)
        } catch (e) {
          failures += 1
          toast.error(`${label}: ${e instanceof Error ? e.message : 'Refresh failed'}`)
        }
      }
      if (failures === 0) {
        toast.success(`All families: ${totalSaved} saved (${totalFound} found across ${profiles.length} profiles)`)
      } else {
        toast.warning(`Finished with ${failures} failed profile(s). Saved ${totalSaved} (${totalFound} found).`)
      }
      await loadStats()
    } finally {
      setRefreshing(null)
    }
  }

  const selectProfileFilter = (profile: string) => {
    setJobFilterProfile(profile)
    setJobFilterRole('all')
  }

  const selectRoleFilter = (roleId: string) => {
    setJobFilterRole(roleId)
    setJobFilterProfile('all')
  }

  const runCleanup = async () => {
    const key = getJobSpyAdminKey()
    if (!key) return
    setCleanupLoading(true)
    try {
      const res = await jobspyApi.cleanupLinks(key, 25)
      toast.success(
        `Checked ${res.checkedCount} links — removed ${res.deletedJobs ?? 0} dead/expired rows (${res.totalExpired ?? 0} expired, ${res.totalLinkFailed ?? 0} failed remaining)`,
      )
      await loadStats()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cleanup failed')
    } finally {
      setCleanupLoading(false)
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

        {/* Scrape family KPIs */}
        {stats && (
          <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-blue-950">Scrape families (active jobs)</h3>
              <p className="text-xs text-blue-800">All ingest profiles — dimmed cards have 0 jobs until you scrape them</p>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {(stats.profileBreakdown ?? []).map((item) => (
                <button
                  key={item.profile}
                  type="button"
                  onClick={() => selectProfileFilter(item.profile === jobFilterProfile ? 'all' : item.profile)}
                  className={`rounded-xl border p-3 text-left transition shadow-sm ${
                    item.count === 0 ? 'opacity-55' : ''
                  } ${
                    jobFilterProfile === item.profile
                      ? 'border-blue-600 bg-white ring-2 ring-blue-500/30'
                      : 'border-blue-100 bg-white hover:border-blue-300'
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                    {item.label}
                  </p>
                  <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">{item.count}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {item.autoEnabled ? 'auto cron' : 'manual profile'}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Enriched role family KPIs */}
        {stats && (
          <section className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-violet-950">Enriched role families</h3>
              <p className="text-xs text-violet-800">
                Full taxonomy — dimmed = no classified jobs yet (.NET / Node / Angular are Wave 2, not added yet)
              </p>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {(stats.enrichmentRoleSummary ?? [])
                .slice()
                .sort((a, b) => b.count - a.count)
                .map((item) => (
                  <button
                    key={item.roleId}
                    type="button"
                    disabled={item.count === 0}
                    onClick={() => selectRoleFilter(item.roleId === jobFilterRole ? 'all' : item.roleId)}
                    className={`rounded-xl border p-3 text-left transition shadow-sm ${
                      item.count === 0 ? 'opacity-50 cursor-default' : ''
                    } ${
                      jobFilterRole === item.roleId
                        ? 'border-violet-600 bg-white ring-2 ring-violet-500/30'
                        : 'border-violet-100 bg-white hover:border-violet-300'
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate" title={item.roleName}>
                      {item.roleName}
                    </p>
                    <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">{item.count}</p>
                  </button>
                ))}
            </div>
          </section>
        )}

        {/* Auto Refresh Status */}
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-emerald-900">Auto Refresh Status</h3>
          <p className="text-sm text-emerald-800">
            Railway cron every 8h runs auto-enabled scrape profiles for India. Location locked to India.
            1+ experience remains manual-only.
          </p>
          <p className="text-xs text-emerald-700">
            Auto refresh derives range from the last successful auto run plus a 12h overlap buffer.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            {(stats?.profileBreakdown ?? [])
              .filter((p) => p.autoEnabled)
              .map((p) => (
                <Badge key={p.profile} className="bg-emerald-100 text-emerald-800">
                  {p.label} · auto
                </Badge>
              ))}
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
              Use <strong>Run all families</strong> to scrape every ingest profile in one go (internship, fresher, entry, CRM/AI, 1+ exp).
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
            <div className="space-y-1.5">
              <Label htmlFor="refresh-profile">Target scrape family</Label>
              <select
                id="refresh-profile"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25"
                value={refreshProfile}
                onChange={(e) => setRefreshProfile(e.target.value)}
                disabled={!!refreshing}
              >
                {(profileOptions).map((p) => (
                  <option key={p.profile} value={p.profile}>
                    {p.label} ({p.count} active)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
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
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={!!refreshing} onClick={() => void runRefresh()}>
              {refreshing && refreshing !== RUN_ALL_REFRESH_KEY && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Run refresh
            </Button>
            <Button variant="secondary" disabled={!!refreshing} onClick={() => void runAllRefresh()}>
              {refreshing === RUN_ALL_REFRESH_KEY && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Run all families
            </Button>
            <Button variant="outline" disabled={cleanupLoading || !!refreshing} onClick={() => void runCleanup()}>
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
        {stats && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="font-semibold text-slate-900">Latest Jobs</h3>
              <div className="flex flex-wrap gap-3">
                <div className="space-y-1">
                  <Label htmlFor="filter-profile" className="text-xs">Scrape family</Label>
                  <select
                    id="filter-profile"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm min-w-[180px]"
                    value={jobFilterProfile}
                    onChange={(e) => {
                      setJobFilterProfile(e.target.value)
                      setJobFilterRole('all')
                    }}
                  >
                    <option value="all">All scrape families</option>
                    {(stats.profileBreakdown ?? []).map((p) => (
                      <option key={p.profile} value={p.profile}>{p.label} ({p.count})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="filter-role" className="text-xs">Enriched role</Label>
                  <select
                    id="filter-role"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm min-w-[180px]"
                    value={jobFilterRole}
                    onChange={(e) => {
                      setJobFilterRole(e.target.value)
                      setJobFilterProfile('all')
                    }}
                  >
                    <option value="all">All enriched roles</option>
                    {(stats.enrichmentRoleSummary ?? [])
                      .slice()
                      .sort((a, b) => b.count - a.count || a.roleName.localeCompare(b.roleName))
                      .map((r) => (
                      <option key={r.roleId} value={r.roleId}>{r.roleName} ({r.count})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {(stats.latestJobs?.length ?? 0) > 0 ? (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 pr-3">Scrape family</th>
                  <th className="py-2 pr-3">Enriched role</th>
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
                    <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">
                      {profileKeyLabel(j.ingestProfile, stats.profileBreakdown ?? [])}
                    </td>
                    <td className="py-2 pr-3 text-slate-600 max-w-[140px] truncate" title={j.actualRoleName ?? undefined}>
                      {j.actualRoleName ?? '—'}
                    </td>
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
            ) : (
              <p className="text-sm text-slate-500">No jobs match this filter.</p>
            )}
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

        {/* Advanced collapsed */}
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4">
          <button type="button" className="text-sm font-medium text-slate-700" onClick={() => setShowAdvanced((v) => !v)}>
            {showAdvanced ? '▼' : '▶'} Advanced / cron notes
          </button>
          {showAdvanced && (
            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <p>Auto cron (every 8h): <code>python scripts/run_job_auto_refresh.py</code> — internship, fresher, entry-level only.</p>
              <p>Daily cleanup: <code>python scripts/run_job_link_cleanup.py</code> — checks links, then deletes expired/dead rows.</p>
              <p>1+ experience profile is manual-only and excluded from auto cron.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
