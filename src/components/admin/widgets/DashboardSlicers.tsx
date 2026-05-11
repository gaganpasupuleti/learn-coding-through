'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CaretDown } from '@phosphor-icons/react'

import type { AdminBatch, AdminStudent } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { QuarterSlice } from '../utils/dashboardSlicerLogic'
import { vizTileClass } from '../views/dashboardPolish'

const triggerClass =
  'flex h-8 w-full min-w-0 items-center justify-between gap-1 rounded-md border border-slate-200/90 bg-white px-2 text-left text-[11px] font-medium text-slate-800 shadow-sm outline-none transition-colors hover:border-slate-300 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-border dark:bg-card dark:text-foreground'

const nativeSelectClass =
  'h-8 w-full min-w-0 rounded-md border border-slate-200/90 bg-white px-2 text-[11px] font-medium text-slate-800 shadow-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:border-border dark:bg-card dark:text-foreground'

type TypeaheadOption = { value: string; label: string }

function SlicerTypeahead({
  label,
  emptyLabel,
  searchPlaceholder,
  value,
  options,
  onValueChange,
  'aria-label': ariaLabel,
  className,
}: {
  label: string
  emptyLabel: string
  searchPlaceholder: string
  value: string | null
  options: TypeaheadOption[]
  onValueChange: (next: string | null) => void
  'aria-label': string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [panelBox, setPanelBox] = useState({ top: 0, left: 0, width: 280 })

  const display = useMemo(() => {
    if (value == null || value === '') return emptyLabel
    return options.find((o) => o.value === value)?.label ?? emptyLabel
  }, [value, options, emptyLabel])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const syncPanelPosition = useCallback(() => {
    const el = rootRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = Math.min(Math.max(r.width, 220), Math.min(384, window.innerWidth - 16))
    let left = r.left
    if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - 8 - width)
    setPanelBox({ top: r.bottom + 4, left, width })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    setQuery('')
    syncPanelPosition()
    searchRef.current?.focus()
  }, [open, syncPanelPosition])

  useEffect(() => {
    if (!open) return
    const onReposition = () => syncPanelPosition()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open, syncPanelPosition])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (rootRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const panel =
    open &&
    createPortal(
      <div
        ref={panelRef}
        id={listId}
        role="listbox"
        className="fixed z-[300] flex max-h-[min(280px,70vh)] flex-col overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none"
        style={{ top: panelBox.top, left: panelBox.left, width: panelBox.width }}
      >
        <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border px-2">
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="placeholder:text-muted-foreground h-7 w-full min-w-0 rounded-sm border-0 bg-transparent text-xs outline-none"
            aria-label={searchPlaceholder}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-1">
          <button
            type="button"
            role="option"
            aria-selected={value == null || value === ''}
            className="flex w-full rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onValueChange(null)
              setOpen(false)
            }}
          >
            {emptyLabel}
          </button>
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">No match.</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={value === opt.value}
                className="flex w-full rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onValueChange(opt.value)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      </div>,
      document.body,
    )

  return (
    <div ref={rootRef} className={cn('grid min-w-0 gap-0.5', className)}>
      <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(triggerClass, 'font-normal')}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
          queueMicrotask(() => syncPanelPosition())
        }}
      >
        <span className="min-w-0 flex-1 truncate">{display}</span>
        <CaretDown className="size-3 shrink-0 opacity-60" weight="bold" aria-hidden />
      </button>
      {panel}
    </div>
  )
}

export function DashboardSlicers({
  year,
  quarter,
  batchId,
  studentId,
  mentorName,
  years,
  batchesForSelect,
  studentsForSelect,
  mentors,
  onYear,
  onQuarter,
  onBatchId,
  onStudentId,
  onMentor,
  onReset,
  hasCustomFilters,
}: {
  year: number
  quarter: QuarterSlice
  batchId: number | null
  studentId: number | null
  mentorName: string | null
  years: number[]
  batchesForSelect: AdminBatch[]
  studentsForSelect: AdminStudent[]
  mentors: string[]
  onYear: (y: number) => void
  onQuarter: (q: QuarterSlice) => void
  onBatchId: (id: number | null) => void
  onStudentId: (id: number | null) => void
  onMentor: (name: string | null) => void
  onReset: () => void
  hasCustomFilters: boolean
}) {
  const yearMin = years[years.length - 1] ?? year - 5
  const yearMax = years[0] ?? year

  const mentorOptions = useMemo<TypeaheadOption[]>(
    () => mentors.map((m) => ({ value: m, label: m })),
    [mentors],
  )

  const batchOptions = useMemo<TypeaheadOption[]>(
    () => batchesForSelect.map((b) => ({ value: String(b.id), label: b.name })),
    [batchesForSelect],
  )

  const studentOptions = useMemo<TypeaheadOption[]>(
    () => studentsForSelect.map((s) => ({ value: String(s.id), label: s.full_name })),
    [studentsForSelect],
  )

  const [yearDraft, setYearDraft] = useState(() => String(year))
  useEffect(() => {
    setYearDraft(String(year))
  }, [year])

  const commitYearDraft = () => {
    const y = Number(yearDraft)
    if (!Number.isFinite(y)) {
      setYearDraft(String(year))
      return
    }
    const clamped = Math.min(yearMax, Math.max(yearMin, y))
    setYearDraft(String(clamped))
    if (clamped !== year) onYear(clamped)
  }

  return (
    <div className={cn(vizTileClass, 'flex flex-col gap-2 p-2.5')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-muted-foreground">
          Slicers
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px] text-slate-600 hover:text-foreground"
          disabled={!hasCustomFilters}
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <label className="grid gap-0.5">
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Year</span>
          <input
            type="number"
            inputMode="numeric"
            className={cn(
              triggerClass,
              'cursor-text px-2 font-medium tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            )}
            min={yearMin}
            max={yearMax}
            value={yearDraft}
            aria-label="Filter by year (type or use arrows)"
            onChange={(e) => setYearDraft(e.target.value)}
            onBlur={commitYearDraft}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitYearDraft()
                ;(e.target as HTMLInputElement).blur()
              }
            }}
          />
        </label>
        <label className="grid gap-0.5">
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Quarter</span>
          <select
            className={nativeSelectClass}
            value={quarter === 'full' ? 'full' : String(quarter)}
            onChange={(e) => {
              const v = e.target.value
              onQuarter(v === 'full' ? 'full' : (Number(v) as 1 | 2 | 3 | 4))
            }}
            aria-label="Filter by quarter or full year"
          >
            <option value="full">Full year</option>
            <option value={1}>Q1</option>
            <option value={2}>Q2</option>
            <option value={3}>Q3</option>
            <option value={4}>Q4</option>
          </select>
        </label>
        <SlicerTypeahead
          label="Mentor"
          emptyLabel="All mentors"
          searchPlaceholder="Type to find mentor…"
          value={mentorName}
          options={mentorOptions}
          onValueChange={(v) => onMentor(v)}
          aria-label="Filter by mentor or teacher (type to search)"
          className="min-w-0"
        />
        <SlicerTypeahead
          label="Batch"
          emptyLabel="All batches"
          searchPlaceholder="Type to find batch…"
          value={batchId != null ? String(batchId) : null}
          options={batchOptions}
          onValueChange={(v) => onBatchId(v ? Number(v) : null)}
          aria-label="Filter by batch (type to search)"
          className="min-w-0"
        />
        <SlicerTypeahead
          label="Student"
          emptyLabel="All students"
          searchPlaceholder="Type student name…"
          value={studentId != null ? String(studentId) : null}
          options={studentOptions}
          onValueChange={(v) => onStudentId(v ? Number(v) : null)}
          aria-label="Filter by student (type to search)"
          className="min-w-0 sm:col-span-2 lg:col-span-2"
        />
      </div>
      <p className="text-[10px] leading-snug text-slate-500 dark:text-muted-foreground">
        Charts use activity and job dates in the selected period. Mentor, batch, and student: open the field and type to
        search. Year accepts typed values ({yearMin}–{yearMax}).
      </p>
    </div>
  )
}
