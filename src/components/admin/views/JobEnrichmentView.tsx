import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  getJobSpyAdminKey,
  jobspyApi,
  type JobEnrichmentImportCommitResponse,
  type JobEnrichmentImportPreviewResponse,
  type JobEnrichmentSummaryResponse,
} from '@/lib/jobspy-api'

const COMMIT_CONFIRM_TEXT = 'CONFIRM IMPORT'

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${accent ?? 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

function authErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : 'Request failed'
  if (/403|401|Admin access|ADMIN_JOB_KEY/i.test(msg)) {
    return 'Admin access denied. Set X-Admin-Key in JobSpy Ops (same key as backend ADMIN_JOB_KEY).'
  }
  if (/500|internal/i.test(msg)) return 'Server error. Check backend logs and try again.'
  return msg
}

export function JobEnrichmentView() {
  const [summary, setSummary] = useState<JobEnrichmentSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<JobEnrichmentImportPreviewResponse | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [confirmText, setConfirmText] = useState('')
  const [commitLoading, setCommitLoading] = useState(false)
  const [commitError, setCommitError] = useState<string | null>(null)
  const [commitResult, setCommitResult] = useState<JobEnrichmentImportCommitResponse | null>(null)
  // Repeat-commit guard: true only after a fresh successful preview, cleared on commit.
  const [previewedSinceCommit, setPreviewedSinceCommit] = useState(false)

  const loadSummary = useCallback(async () => {
    const key = getJobSpyAdminKey()
    if (!key) {
      setSummaryLoading(false)
      setSummaryError('Set ADMIN_JOB_KEY in JobSpy Ops to load enrichment summary.')
      return
    }
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      setSummary(await jobspyApi.getEnrichmentSummary(key))
    } catch (e) {
      setSummaryError(authErrorMessage(e))
      setSummary(null)
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setPreviewedSinceCommit(false)
    setConfirmText('')
    setCommitError(null)
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      setPreviewError('Only .csv files are accepted.')
      setCsvFile(null)
      setPreview(null)
      return
    }
    setPreviewError(null)
    setPreview(null)
    setCsvFile(file)
  }

  const handlePreview = async () => {
    const key = getJobSpyAdminKey()
    if (!key) {
      setPreviewError('Set ADMIN_JOB_KEY in JobSpy Ops before previewing CSV.')
      return
    }
    if (!csvFile) return

    setPreviewLoading(true)
    setPreviewError(null)
    setCommitError(null)
    try {
      setPreview(await jobspyApi.enrichmentImportPreview(key, csvFile))
      setPreviewedSinceCommit(true)
      setConfirmText('')
    } catch (e) {
      setPreviewError(authErrorMessage(e))
      setPreview(null)
      setPreviewedSinceCommit(false)
    } finally {
      setPreviewLoading(false)
    }
  }

  const commitAllowed =
    preview !== null &&
    preview.invalid_rows === 0 &&
    csvFile !== null &&
    previewedSinceCommit &&
    !commitLoading

  const commitEnabled = commitAllowed && confirmText === COMMIT_CONFIRM_TEXT

  const handleCommit = async () => {
    const key = getJobSpyAdminKey()
    if (!key) {
      setCommitError('Set ADMIN_JOB_KEY in JobSpy Ops before committing an import.')
      return
    }
    if (!csvFile) {
      setCommitError('Select and preview a CSV file before committing.')
      return
    }
    if (!preview || !previewedSinceCommit) {
      setCommitError('Preview the CSV before committing.')
      return
    }
    if (preview.invalid_rows > 0) {
      setCommitError('Commit blocked: fix invalid rows and preview again.')
      return
    }
    if (confirmText !== COMMIT_CONFIRM_TEXT) return

    setCommitLoading(true)
    setCommitError(null)
    try {
      const result = await jobspyApi.enrichmentImportCommit(key, csvFile)
      setCommitResult(result)
      setConfirmText('')
      setPreviewedSinceCommit(false)
      await loadSummary()
    } catch (e) {
      setCommitError(authErrorMessage(e))
    } finally {
      setCommitLoading(false)
    }
  }

  const emptyEnrichments = !summaryLoading && summary?.total_enrichments === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Enrichment Summary</h2>
        <p className="text-xs text-slate-500 mt-1">Saved job enrichment rows from manual CSV imports.</p>

        {summaryLoading && (
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-600" role="status" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading summary…
          </div>
        )}

        {summaryError && !summaryLoading && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {summaryError}
          </div>
        )}

        {!summaryLoading && summary && (
          <>
            {emptyEnrichments && (
              <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                No enriched jobs imported yet. Upload an enriched CSV to preview validation.
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              <StatCard label="Total Enrichments" value={summary.total_enrichments} />
              <StatCard label="Pending" value={summary.pending_count} />
              <StatCard label="Needs Review" value={summary.needs_review_count} accent="text-amber-700" />
              <StatCard label="Approved" value={summary.approved_count} accent="text-emerald-700" />
              <StatCard label="Rejected" value={summary.rejected_count} accent="text-red-700" />
              <StatCard label="Live" value={summary.live_count} />
              <StatCard label="Expired" value={summary.expired_count} />
              <StatCard label="Quiz Missing" value={summary.quiz_pack_missing_count} />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Role Summary</h3>
                {summary.role_summary.length === 0 ? (
                  <p className="text-sm text-slate-500">No roles yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Role ID</th>
                          <th className="px-3 py-2 font-semibold">Role Name</th>
                          <th className="px-3 py-2 font-semibold">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.role_summary.map((row) => (
                          <tr key={row.role_id} className="border-t border-slate-100">
                            <td className="px-3 py-2 font-mono text-xs">{row.role_id}</td>
                            <td className="px-3 py-2">{row.role_name}</td>
                            <td className="px-3 py-2 tabular-nums">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Level Summary</h3>
                {summary.level_summary.length === 0 ? (
                  <p className="text-sm text-slate-500">No levels yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Role Level ID</th>
                          <th className="px-3 py-2 font-semibold">Experience</th>
                          <th className="px-3 py-2 font-semibold">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.level_summary.map((row) => (
                          <tr key={row.role_level_id} className="border-t border-slate-100">
                            <td className="px-3 py-2 font-mono text-xs">{row.role_level_id}</td>
                            <td className="px-3 py-2">{row.experience_level}</td>
                            <td className="px-3 py-2 tabular-nums">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-2">
          <FileSpreadsheet className="h-5 w-5 text-slate-600 mt-0.5" aria-hidden />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-900">CSV Preview Upload</h2>
            <p className="text-xs text-slate-500 mt-1">
              Validate enriched job CSV before import. Preview only — no database writes.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="enrichment-csv">Upload enriched jobs CSV</Label>
            <Input
              id="enrichment-csv"
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="mt-1"
              onChange={handleFileChange}
              aria-describedby="enrichment-csv-hint"
            />
            <p id="enrichment-csv-hint" className="text-xs text-slate-500 mt-1">
              {csvFile ? csvFile.name : 'Accepts .csv only'}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => void handlePreview()}
            disabled={!csvFile || previewLoading}
            aria-busy={previewLoading}
          >
            {previewLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Previewing…
              </>
            ) : (
              'Preview CSV'
            )}
          </Button>
        </div>

        {previewError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {previewError}
          </div>
        )}

        {preview && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Total Rows" value={preview.total_rows} />
              <StatCard label="Valid Rows" value={preview.valid_rows} accent="text-emerald-700" />
              <StatCard label="Invalid Rows" value={preview.invalid_rows} accent={preview.invalid_rows ? 'text-red-700' : undefined} />
              <StatCard label="Warning Rows" value={preview.warning_rows} accent={preview.warning_rows ? 'text-amber-700' : undefined} />
            </div>

            {preview.warning_rows > 0 && preview.invalid_rows === 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>
                  {preview.warning_rows} row(s) have warnings. Warnings do not block commit; review them before committing the import.
                </span>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Row</th>
                    <th className="px-3 py-2 font-semibold">Job ID</th>
                    <th className="px-3 py-2 font-semibold">Errors</th>
                    <th className="px-3 py-2 font-semibold">Warnings</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.row_errors.map((row) => (
                    <tr key={row.row_number} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-2 tabular-nums">{row.row_number}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.job_id || '—'}</td>
                      <td className="px-3 py-2">
                        {row.errors.length === 0 ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <ul className="list-disc pl-4 text-red-700">
                            {row.errors.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.warnings.length === 0 ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <ul className="space-y-1">
                            {row.warnings.map((w) => (
                              <li key={w}>
                                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900 font-normal">
                                  {w}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {preview.invalid_rows === 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50/60 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-700" aria-hidden />
                  <p className="text-sm font-medium text-red-900">
                    This will write enriched job data into the database. Only continue after reviewing warnings.
                  </p>
                </div>

                <p className="text-xs text-slate-600 tabular-nums">
                  total_rows: {preview.total_rows} · valid_rows: {preview.valid_rows} · invalid_rows:{' '}
                  {preview.invalid_rows} · warning_rows: {preview.warning_rows}
                </p>

                {!previewedSinceCommit && (
                  <p className="text-sm text-amber-900 rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
                    Preview again before another commit.
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Label htmlFor="commit-confirm">Type CONFIRM IMPORT to enable commit</Label>
                    <Input
                      id="commit-confirm"
                      type="text"
                      autoComplete="off"
                      className="mt-1"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      disabled={!commitAllowed}
                      aria-describedby="commit-confirm-hint"
                    />
                    <p id="commit-confirm-hint" className="text-xs text-slate-500 mt-1">
                      Must match exactly: {COMMIT_CONFIRM_TEXT}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void handleCommit()}
                    disabled={!commitEnabled}
                    aria-busy={commitLoading}
                  >
                    {commitLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Committing…
                      </>
                    ) : (
                      'Commit Import'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {commitError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {commitError}
          </div>
        )}

        {commitResult && (
          <div className="mt-4 space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="text-sm font-semibold text-emerald-800" role="status">
              Import committed successfully.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <StatCard label="Inserted" value={commitResult.inserted_count} accent="text-emerald-700" />
              <StatCard label="Updated" value={commitResult.updated_count} />
              <StatCard
                label="Skipped"
                value={commitResult.skipped_count}
                accent={commitResult.skipped_count ? 'text-red-700' : undefined}
              />
              <StatCard label="Invalid Rows" value={commitResult.invalid_rows} />
              <StatCard label="Warning Rows" value={commitResult.warning_rows} accent="text-amber-700" />
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Saved Job IDs</h3>
              {commitResult.saved_job_ids.length === 0 ? (
                <p className="text-sm text-slate-500">None</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {commitResult.saved_job_ids.map((id) => (
                    <Badge key={id} variant="outline" className="font-mono text-xs">
                      {id}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {commitResult.skipped_job_ids.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-700 mb-1">
                  Skipped Job IDs (not saved)
                </h3>
                <div className="flex flex-wrap gap-1">
                  {commitResult.skipped_job_ids.map((id) => (
                    <Badge key={id} variant="outline" className="border-red-300 bg-red-50 font-mono text-xs text-red-900">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
