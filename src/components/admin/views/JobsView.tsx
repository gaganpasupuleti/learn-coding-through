import { Plus, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { ADMIN_LINKEDIN_JSON_INPUT_ID } from '../constants'
import { StatusBadge } from '../widgets/StatusBadge'

export function JobsView() {
  const {
    jobPayload,
    setJobPayload,
    jobs,
    isLoading,
    jobImportFileRef,
    jobImportLinkedInRef,
    linkedinReplaceOpen,
    setLinkedinReplaceOpen,
    linkedinDropActive,
    handleCreateJob,
    handleToggleJobStatus,
    handleDeleteJob,
    handleDownloadJobImportTemplate,
    handleJobImportFile,
    handleLinkedInJsonInputChange,
    onLinkedinDragEnter,
    onLinkedinDragLeave,
    onLinkedinDrop,
  } = useAdminWorkspaceContext()

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="admin-surface p-4 space-y-3 xl:col-span-1">
        <h3 className="text-lg font-semibold">Create Job</h3>
        <Input
          value={jobPayload.title}
          onChange={(event) => setJobPayload((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="Job title"
        />
        <Input
          value={jobPayload.company_name}
          onChange={(event) => setJobPayload((prev) => ({ ...prev, company_name: event.target.value }))}
          placeholder="Company"
        />
        <Input
          value={jobPayload.location}
          onChange={(event) => setJobPayload((prev) => ({ ...prev, location: event.target.value }))}
          placeholder="Location"
        />
        <Input
          value={jobPayload.employment_type ?? ''}
          onChange={(event) => setJobPayload((prev) => ({ ...prev, employment_type: event.target.value }))}
          placeholder="Employment type"
        />
        <Input
          value={jobPayload.description ?? ''}
          onChange={(event) => setJobPayload((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Description"
        />
        <Button onClick={handleCreateJob} disabled={isLoading}>
          <Plus size={14} className="mr-1" /> Create Job
        </Button>
        <div className="border-t border-border pt-3 mt-2 space-y-2">
          <h4 className="text-sm font-semibold">Bulk import (Excel)</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Use the <strong>first sheet</strong> only. Row 1 must be headers. File format:{' '}
            <span className="font-mono">.xlsx</span> (real Excel — not .csv renamed).{' '}
            <strong>Required</strong> columns (exact or common aliases):{' '}
            <span className="font-mono">title</span> (or Job Title / Position),{' '}
            <span className="font-mono">company_name</span> (or Company / Employer),{' '}
            <span className="font-mono">location</span> (or City / Work location).{' '}
            <strong>Optional:</strong>{' '}
            <span className="font-mono">employment_type</span> (defaults to Full-time),{' '}
            <span className="font-mono">description</span> (max 2000 chars),{' '}
            <span className="font-mono">eligible_batch_id</span>,{' '}
            <span className="font-mono">eligible_batch_name</span> (must match a batch in the system). Each data row
            needs title, company, and location with <strong>at least 2 characters</strong>.{' '}
            <strong>One bad row fails the whole file</strong> — fix all errors shown in the toast, then re-upload.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleDownloadJobImportTemplate} disabled={isLoading}>
              Download template
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => jobImportFileRef.current?.click()} disabled={isLoading}>
              Upload .xlsx
            </Button>
            <input
              ref={jobImportFileRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={handleJobImportFile}
            />
          </div>
          <div className="border-t border-border pt-3 mt-3 space-y-3">
            <h4 className="text-sm font-semibold">LinkedIn scraper (JSON)</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload UTF-8 JSON: a plain array of jobs, or a wrapper with an <span className="font-mono">items</span>,{' '}
              <span className="font-mono">data</span>, or <span className="font-mono">results</span> array (Apify /
              dataset style). We map <span className="font-mono">title</span> / <span className="font-mono">jobTitle</span>,{' '}
              <span className="font-mono">company</span> / <span className="font-mono">companyName</span>,{' '}
              <span className="font-mono">location</span> or nested <span className="font-mono">location.name</span>, and{' '}
              <span className="font-mono">jobUrl</span> / <span className="font-mono">link</span>. Files with a UTF-8 BOM
              are fine. Invalid rows are reported; valid rows still import.
            </p>
            <div className="flex items-start gap-2 text-xs">
              <Checkbox
                checked={linkedinReplaceOpen}
                onCheckedChange={(v) => setLinkedinReplaceOpen(v === true)}
                id="linkedin-replace-open"
                className="mt-0.5"
              />
              <label htmlFor="linkedin-replace-open" className="cursor-pointer leading-snug">
                Close all currently <strong>open</strong> jobs before importing (recommended when replacing the whole
                board with a fresh scrape).
              </label>
            </div>
            <input
              id={ADMIN_LINKEDIN_JSON_INPUT_ID}
              ref={jobImportLinkedInRef}
              type="file"
              accept=".json,application/json,text/json"
              className="hidden"
              onChange={handleLinkedInJsonInputChange}
            />
            <label
              htmlFor={ADMIN_LINKEDIN_JSON_INPUT_ID}
              onDragEnter={onLinkedinDragEnter}
              onDragLeave={onLinkedinDragLeave}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDrop={onLinkedinDrop}
              className={cn(
                'rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground transition-colors cursor-pointer block',
                'hover:border-blue-400/60 hover:bg-blue-50/40',
                linkedinDropActive && 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20',
                isLoading && 'pointer-events-none opacity-60 cursor-wait',
              )}
            >
              <p className="font-medium text-foreground">{isLoading ? 'Importing…' : 'Drop a .json file here, or click to choose'}</p>
              <p className="text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                UTF-8 JSON array from the LinkedIn jobs scraper. Drag-and-drop and click-to-browse both work.
              </p>
              <span className="mt-4 inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm">
                Browse files…
              </span>
            </label>
            <p className="text-[11px] text-muted-foreground">
              Tip: If nothing happens, confirm you&apos;re on the admin account and the backend is running.
            </p>
          </div>
        </div>
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
              <p className="text-xs text-muted-foreground">
                {job.company_name} · {job.location} · {job.employment_type}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Batch: {job.eligible_batch_name || 'Any'} · Applications: {job.applications_count}
              </p>
              <p className="text-xs text-muted-foreground">Created: {new Date(job.created_at).toLocaleDateString()}</p>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" onClick={() => handleToggleJobStatus(job)} disabled={isLoading}>
                  {job.status === 'open' ? 'Close' : 'Reopen'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteJob(job.id)}
                  disabled={isLoading}
                >
                  <Trash size={12} />
                </Button>
              </div>
            </div>
          ))}
          {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs loaded.</p>}
        </div>
      </Card>
    </div>
  )
}
