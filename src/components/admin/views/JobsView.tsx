import { useMemo, useState } from 'react'
import { CaretDown, DotsSixVertical, Plus, Trash } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import type { AdminJobListFilter } from '@/lib/api'
import { cn } from '@/lib/utils'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { ADMIN_LINKEDIN_JSON_INPUT_ID } from '../constants'
import { StatusBadge } from '../widgets/StatusBadge'

import {
  adminPaneCardClass,
  adminPaneHeaderClass,
  adminPaneScrollBodyClass,
  adminSectionRootClass,
} from './dashboardPolish'

const JOB_FILTERS: { key: AdminJobListFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'fixture', label: 'Fixture' },
]

export function JobsView() {
  const [excelHelpOpen, setExcelHelpOpen] = useState(false)
  const [linkedinHelpOpen, setLinkedinHelpOpen] = useState(false)

  const {
    jobPayload,
    setJobPayload,
    jobs,
    jobListFilter,
    draggedJobId,
    setDraggedJobId,
    isLoading,
    jobImportFileRef,
    jobImportLinkedInRef,
    linkedinReplaceOpen,
    setLinkedinReplaceOpen,
    linkedinDropActive,
    handleCreateJob,
    handleJobListFilterChange,
    handleToggleJobStatus,
    handleToggleJobFixture,
    handleSeedFixtureJobs,
    handleDropJobOn,
    handleDeleteJob,
    handleDownloadJobImportTemplate,
    handleJobImportFile,
    handleLinkedInJsonInputChange,
    onLinkedinDragEnter,
    onLinkedinDragLeave,
    onLinkedinDrop,
  } = useAdminWorkspaceContext()

  const sortedJobs = useMemo(
    () => [...jobs].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [jobs],
  )

  return (
    <div className={adminSectionRootClass}>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden lg:grid-cols-12 lg:grid-rows-1">
        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0 lg:col-span-4')}>
          <div className={adminPaneHeaderClass}>Create & import</div>
          <div className={adminPaneScrollBodyClass}>
            <div className="space-y-2 border-b border-slate-200/80 pb-3 dark:border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Fixture board</p>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Load realistic sample roles for demos. Students see them as normal listings — only admins see the fixture
                label.
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 w-full text-xs"
                onClick={() => void handleSeedFixtureJobs()}
                disabled={isLoading}
              >
                Load fixture job board
              </Button>
            </div>

            <div className="space-y-2 border-b border-slate-200/80 pb-3 pt-3 dark:border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">New job (live)</p>
              <Input
                value={jobPayload.title}
                onChange={(event) => setJobPayload((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Title"
                className="h-8 text-xs"
              />
              <Input
                value={jobPayload.company_name}
                onChange={(event) => setJobPayload((prev) => ({ ...prev, company_name: event.target.value }))}
                placeholder="Company"
                className="h-8 text-xs"
              />
              <Input
                value={jobPayload.location}
                onChange={(event) => setJobPayload((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="Location"
                className="h-8 text-xs"
              />
              <Input
                value={jobPayload.employment_type ?? ''}
                onChange={(event) => setJobPayload((prev) => ({ ...prev, employment_type: event.target.value }))}
                placeholder="Employment type"
                className="h-8 text-xs"
              />
              <Input
                value={jobPayload.description ?? ''}
                onChange={(event) => setJobPayload((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Description"
                className="h-8 text-xs"
              />
              <Button type="button" size="sm" className="h-8 w-full text-xs" onClick={handleCreateJob} disabled={isLoading}>
                <Plus size={14} className="mr-1" /> Create live listing
              </Button>
            </div>

            <div className="space-y-2 pt-3">
              <Collapsible open={excelHelpOpen} onOpenChange={setExcelHelpOpen}>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="h-8 w-full justify-between text-xs font-normal">
                    Excel import help
                    <CaretDown className={cn('size-3.5 shrink-0 transition-transform', excelHelpOpen && 'rotate-180')} weight="bold" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 border-l-2 border-primary/25 py-2 pl-2 text-[11px] leading-relaxed text-muted-foreground">
                  <p>
                    Use the <strong>first sheet</strong> only. Row 1 = headers. File: <span className="font-mono">.xlsx</span> (real
                    Excel).
                  </p>
                  <p>
                    <strong>Required</strong> columns: <span className="font-mono">title</span>, <span className="font-mono">company_name</span>,{' '}
                    <span className="font-mono">location</span> (aliases supported). Optional:{' '}
                    <span className="font-mono">employment_type</span>, <span className="font-mono">description</span>, batch fields.
                  </p>
                  <p>
                    Each row needs title, company, location (≥2 chars). <strong>One bad row fails the file</strong> — fix from toast, re-upload.
                  </p>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={handleDownloadJobImportTemplate} disabled={isLoading}>
                  Template
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => jobImportFileRef.current?.click()} disabled={isLoading}>
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
            </div>

            <div className="mt-3 space-y-2 border-t border-slate-200/80 pt-3 dark:border-border">
              <Collapsible open={linkedinHelpOpen} onOpenChange={setLinkedinHelpOpen}>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="h-8 w-full justify-between text-xs font-normal">
                    LinkedIn JSON help
                    <CaretDown className={cn('size-3.5 shrink-0 transition-transform', linkedinHelpOpen && 'rotate-180')} weight="bold" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 border-l-2 border-primary/25 py-2 pl-2 text-[11px] leading-relaxed text-muted-foreground">
                  <p>
                    UTF-8 JSON: array of jobs, or wrapper with <span className="font-mono">items</span> / <span className="font-mono">data</span> /{' '}
                    <span className="font-mono">results</span>.
                  </p>
                  <p>
                    Maps: title/jobTitle, company/companyName, location or location.name, jobUrl/link. BOM ok; invalid rows reported, valid rows import.
                  </p>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex items-start gap-2 text-[11px]">
                <Checkbox
                  checked={linkedinReplaceOpen}
                  onCheckedChange={(v) => setLinkedinReplaceOpen(v === true)}
                  id="linkedin-replace-open"
                  className="mt-0.5"
                />
                <label htmlFor="linkedin-replace-open" className="cursor-pointer leading-snug">
                  Close all <strong>open</strong> jobs before JSON import (full board replace).
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
                  'block cursor-pointer rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 px-3 py-4 text-center text-[11px] text-muted-foreground transition-colors',
                  'hover:border-primary/40 hover:bg-muted/30',
                  linkedinDropActive && 'border-primary bg-primary/5 ring-2 ring-primary/20',
                  isLoading && 'pointer-events-none cursor-wait opacity-60',
                )}
              >
                <p className="font-medium text-foreground">{isLoading ? 'Importing…' : 'Drop .json or click'}</p>
                <span className="mt-2 inline-flex rounded border bg-background px-2 py-1 text-[10px] font-medium">Browse…</span>
              </label>
            </div>
          </div>
        </Card>

        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0 lg:col-span-8')}>
          <div className={cn(adminPaneHeaderClass, 'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between')}>
            <span>Job pipeline</span>
            <div className="flex flex-wrap items-center gap-1">
              {JOB_FILTERS.map(({ key, label }) => (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={jobListFilter === key ? 'default' : 'outline'}
                  className="h-7 px-2.5 text-[10px]"
                  onClick={() => void handleJobListFilterChange(key)}
                  disabled={isLoading}
                >
                  {label}
                </Button>
              ))}
              <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
                {sortedJobs.length} shown
              </span>
            </div>
          </div>
          <div className={cn(adminPaneScrollBodyClass, 'space-y-2')}>
            {jobListFilter !== 'all' && (
              <p className="text-[10px] text-amber-700 dark:text-amber-400">
                Switch to <strong>All</strong> to drag-reorder listings on the student board.
              </p>
            )}
            {sortedJobs.map((job) => (
              <div
                key={job.id}
                draggable={jobListFilter === 'all' && !isLoading}
                onDragStart={(event) => {
                  setDraggedJobId(job.id)
                  event.dataTransfer.effectAllowed = 'move'
                  event.dataTransfer.setData('text/plain', String(job.id))
                }}
                onDragEnd={() => setDraggedJobId(null)}
                onDragOver={(event) => {
                  if (jobListFilter !== 'all') return
                  event.preventDefault()
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  void handleDropJobOn(job.id)
                }}
                className={cn(
                  'rounded-md border p-2 transition-colors',
                  draggedJobId === job.id && 'border-primary bg-primary/5 opacity-70',
                  job.is_fixture && 'border-amber-200/80 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20',
                )}
              >
                <div className="flex items-start gap-2">
                  {jobListFilter === 'all' ? (
                    <span
                      className="mt-0.5 cursor-grab text-muted-foreground active:cursor-grabbing"
                      title="Drag to reorder"
                      aria-hidden
                    >
                      <DotsSixVertical size={16} weight="bold" />
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-xs font-semibold">{job.title}</p>
                      <div className="flex shrink-0 items-center gap-1">
                        {job.is_fixture ? (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900/60 dark:text-amber-100">
                            Fixture
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100">
                            Live
                          </span>
                        )}
                        <StatusBadge text={job.status} variant={job.status === 'open' ? 'success' : 'danger'} />
                      </div>
                    </div>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {job.company_name} · {job.location} · {job.employment_type}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Batch: {job.eligible_batch_name || 'Any'} · Apps: {job.applications_count}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Created {new Date(job.created_at).toLocaleDateString()}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Button type="button" size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleToggleJobStatus(job)} disabled={isLoading}>
                        {job.status === 'open' ? 'Close' : 'Reopen'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                        onClick={() => void handleToggleJobFixture(job)}
                        disabled={isLoading}
                      >
                        {job.is_fixture ? 'Mark live' : 'Mark fixture'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteJob(job.id)}
                        disabled={isLoading}
                      >
                        <Trash size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {sortedJobs.length === 0 && <p className="text-[11px] text-muted-foreground">No jobs in this view.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
