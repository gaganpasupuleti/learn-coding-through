import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getJobSpyAdminKey,
  jobspyApi,
  setJobSpyAdminKey,
  type JobSpyDashboardStats,
} from '@/lib/jobspy-api'

const POLL_MS = 5000

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-2">{hint}</p>}
    </div>
  )
}

export function JobSpyOpsView() {
  const [stats, setStats] = useState<JobSpyDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [refreshLimit, setRefreshLimit] = useState(5)
  const [fullScrape, setFullScrape] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null)
  const [adminKeyInput, setAdminKeyInput] = useState(() => getJobSpyAdminKey())
  const [showKeyForm, setShowKeyForm] = useState(!getJobSpyAdminKey())

  const loadStats = useCallback(async () => {
    try {
      const data = await jobspyApi.getDashboardStats()
      setStats(data)
      setApiStatus('ok')
      setError(null)
      return data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stats')
      setApiStatus('error')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        await jobspyApi.health()
        await loadStats()
      } catch {
        setApiStatus('error')
        setLoading(false)
      }
    })()
  }, [loadStats])

  useEffect(() => {
    if (!stats?.scrape_in_progress) return undefined
    const id = setInterval(() => void loadStats(), POLL_MS)
    return () => clearInterval(id)
  }, [stats?.scrape_in_progress, loadStats])

  const saveAdminKey = (e: React.FormEvent) => {
    e.preventDefault()
    setJobSpyAdminKey(adminKeyInput.trim())
    setShowKeyForm(false)
    setRefreshMessage('Admin key saved in this browser.')
    toast.success('JobSpy admin key saved')
  }

  const handleRefresh = async () => {
    const key = getJobSpyAdminKey()
    if (!key) {
      setShowKeyForm(true)
      setError('Set your JobSpy admin API key before triggering a scrape.')
      return
    }
    setRefreshing(true)
    setRefreshMessage(null)
    setError(null)
    try {
      const res = await jobspyApi.triggerDashboardRefresh({
        limit: refreshLimit,
        adminKey: key,
        full: fullScrape,
      })
      setRefreshMessage(res.message)
      toast.success('Scrape started')
      await loadStats()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Scrape failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setRefreshing(false)
    }
  }

  const lastUpdated = stats?.last_successful_scrape_at || stats?.last_job_scraped_at

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-slate-900">JobSpy Ops</h2>
        <p className="text-sm text-slate-600 mt-1">
          Live job board metrics and manual scrape control. Requires JobSpy backend and admin API key.
        </p>
      </header>

      {apiStatus === 'error' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          JobSpy API not reachable. Deploy or start JobSpy on port 8001 and set <code className="text-xs">VITE_JOBS_API_URL</code> in production.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {refreshMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{refreshMessage}</div>
      )}

      {stats?.scrape_in_progress && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <Loader2 className="h-4 w-4 animate-spin" />
          Scrape in progress — stats refresh every few seconds.
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <strong>Data last updated:</strong>{' '}
        {loading ? 'Loading…' : lastUpdated ? new Date(lastUpdated).toLocaleString('en-IN') : 'Never'}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Fully tagged"
          value={(stats?.jobs_by_tag?.complete ?? 0).toLocaleString('en-IN')}
          hint="Browse tab (India + role + level)"
        />
        <StatCard
          label="Others queue"
          value={(
            (stats?.jobs_by_tag?.partial ?? 0) +
            (stats?.jobs_by_tag?.untagged ?? 0) +
            (stats?.jobs_by_tag?.flagged ?? 0)
          ).toLocaleString('en-IN')}
          hint="Needs review"
        />
        <StatCard
          label="Live jobs"
          value={(stats?.jobs.live ?? 0).toLocaleString('en-IN')}
          hint="Active in database"
        />
        <StatCard
          label="Total in DB"
          value={(stats?.jobs.total ?? 0).toLocaleString('en-IN')}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900">Admin API key</h3>
        {showKeyForm ? (
          <form onSubmit={saveAdminKey} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="jobspy-admin-key">X-Admin-Key</Label>
              <Input
                id="jobspy-admin-key"
                type="password"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="Paste ADMIN_API_KEY from JobSpy backend .env"
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="self-end bg-blue-600 hover:bg-blue-700">Save key</Button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-700 font-medium">Admin key configured</span>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowKeyForm(true)}>
              Change key
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900">Run scrape</h3>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={fullScrape}
            onChange={(e) => setFullScrape(e.target.checked)}
            disabled={refreshing || stats?.scrape_in_progress}
            className="rounded border-gray-300"
          />
          Full India sync (~1080 profiles: all roles × cities × levels)
        </label>
        {!fullScrape && (
          <div className="space-y-1.5 max-w-xs">
            <Label htmlFor="scrape-limit">Profiles per run</Label>
            <select
              id="scrape-limit"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={refreshLimit}
              onChange={(e) => setRefreshLimit(Number(e.target.value))}
              disabled={refreshing || stats?.scrape_in_progress}
            >
              {[1, 3, 5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={refreshing || stats?.scrape_in_progress}
            onClick={() => void handleRefresh()}
          >
            <RefreshCw className={cnIcon(refreshing || stats?.scrape_in_progress)} />
            {refreshing
              ? 'Starting…'
              : stats?.scrape_in_progress
                ? 'Scrape running…'
                : fullScrape
                  ? 'Start full sync'
                  : 'Refresh jobs now'}
          </Button>
          <Button type="button" variant="outline" onClick={() => void loadStats()}>
            Reload stats
          </Button>
        </div>
      </div>

      {stats?.recent_scrape_runs && stats.recent_scrape_runs.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
          <h3 className="font-semibold text-slate-900 mb-4">Recent scrape runs</h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Profile</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Found</th>
                <th className="py-2 pr-4">Upserted</th>
                <th className="py-2">Started</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_scrape_runs.map((run) => (
                <tr key={run.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{run.id}</td>
                  <td className="py-2 pr-4">#{run.search_profile_id}</td>
                  <td className="py-2 pr-4 capitalize">{run.status}</td>
                  <td className="py-2 pr-4">{run.jobs_found}</td>
                  <td className="py-2 pr-4">{run.jobs_upserted}</td>
                  <td className="py-2">{new Date(run.started_at).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function cnIcon(spin: boolean | undefined) {
  return spin ? 'h-4 w-4 animate-spin' : 'h-4 w-4'
}
