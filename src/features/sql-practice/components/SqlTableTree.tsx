import { ChevronDown, ChevronRight, KeyRound, Link2, ListPlus, Plus, Table2 } from 'lucide-react'
import type { SqlDatabaseMeta } from '../types/sqlPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlTableTreeProps {
  database: SqlDatabaseMeta
  expandedSections: Record<string, boolean>
  expandedTables: Record<string, boolean>
  onToggleSection: (key: string) => void
  onToggleTable: (tableName: string) => void
  onInsertSelect?: (tableName: string) => void
  onInsertColumn?: (tableName: string, columnName: string) => void
}

function SectionHeader({
  label,
  sectionKey,
  expanded,
  onToggle,
  count,
}: {
  label: string
  sectionKey: string
  expanded: boolean
  onToggle: (key: string) => void
  count: number
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(sectionKey)}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-semibold',
        wb.textPrimary,
        'hover:bg-[#111827]',
      )}
    >
      {expanded ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4" />}
      {label}
      <span className={cn('ml-auto text-xs font-normal', wb.textMuted)}>{count}</span>
    </button>
  )
}

export function SqlTableTree({
  database,
  expandedSections,
  expandedTables,
  onToggleSection,
  onToggleTable,
  onInsertSelect,
  onInsertColumn,
}: SqlTableTreeProps) {
  const tablesOpen = expandedSections.tables ?? true
  const viewsOpen = expandedSections.views ?? false
  const procsOpen = expandedSections.procs ?? false

  return (
    <div className={cn('space-y-2 px-2 pb-3 text-sm', wb.textSecondary)}>
      <SectionHeader
        label="Tables"
        sectionKey="tables"
        expanded={tablesOpen}
        onToggle={onToggleSection}
        count={database.tables.length}
      />
      {tablesOpen && (
        <ul className="ml-1 space-y-0.5 border-l border-[#26324A] pl-2">
          {database.tables.map((tbl) => {
            const open = expandedTables[tbl.name] ?? false
            return (
              <li key={tbl.name}>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onToggleTable(tbl.name)}
                    className={cn(
                      'flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[#111827]',
                      wb.textPrimary,
                    )}
                  >
                    {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                    <Table2 className="h-4 w-4 shrink-0 text-emerald-400/90" />
                    <span className="truncate font-medium">{tbl.name}</span>
                    <span className={cn('ml-auto shrink-0 text-xs', wb.textMuted)}>{tbl.rowCount.toLocaleString()} rows</span>
                  </button>
                  {onInsertSelect && (
                    <button
                      type="button"
                      title="Insert SELECT template"
                      onClick={(event) => {
                        event.stopPropagation()
                        onInsertSelect(tbl.name)
                      }}
                      className={cn(
                        'shrink-0 rounded-md border px-1.5 py-1 text-[10px] font-medium',
                        wb.border,
                        'text-emerald-300 hover:bg-emerald-950/40',
                      )}
                    >
                      <ListPlus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {open && (
                  <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-[#26324A] pl-3">
                    {tbl.columns.map((col) => (
                      <li
                        key={col.name}
                        className={cn('flex flex-wrap items-center gap-1.5 py-0.5 text-xs', wb.textMuted)}
                      >
                        <span className={cn('min-w-0 flex-1 font-mono', wb.textSecondary)}>{col.name}</span>
                        <span className="text-[#64748B]">{col.dataType}</span>
                        {col.isPrimaryKey && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-200">
                            <KeyRound className="h-3 w-3" />
                            PK
                          </span>
                        )}
                        {col.isForeignKey && (
                          <span
                            className="inline-flex items-center gap-0.5 rounded bg-sky-950/60 px-1.5 py-0.5 text-[10px] font-bold uppercase text-sky-200"
                            title={col.references ? `→ ${col.references.table}.${col.references.column}` : undefined}
                          >
                            <Link2 className="h-3 w-3" />
                            FK
                          </span>
                        )}
                        {onInsertColumn && (
                          <button
                            type="button"
                            title={`Insert column name: ${col.name}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              onInsertColumn(tbl.name, col.name)
                            }}
                            className={cn(
                              'rounded border px-1 py-0.5 text-[10px] text-sky-300 hover:bg-sky-950/40',
                              wb.border,
                            )}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <SectionHeader
        label="Views"
        sectionKey="views"
        expanded={viewsOpen}
        onToggle={onToggleSection}
        count={database.viewNames.length}
      />
      {viewsOpen && (
        <ul className="ml-6 space-y-0.5 border-l border-[#26324A] pl-3">
          {database.viewNames.map((name) => (
            <li key={name} className={cn('px-2 py-1 font-mono text-xs', wb.textMuted)}>
              {name}
              <span className="ml-2 text-[10px] uppercase text-[#64748B]">placeholder</span>
            </li>
          ))}
        </ul>
      )}

      <SectionHeader
        label="Stored Procedures"
        sectionKey="procs"
        expanded={procsOpen}
        onToggle={onToggleSection}
        count={database.storedProcedureNames.length}
      />
      {procsOpen && (
        <ul className="ml-6 space-y-0.5 border-l border-[#26324A] pl-3">
          {database.storedProcedureNames.map((name) => (
            <li key={name} className={cn('px-2 py-1 font-mono text-xs', wb.textMuted)}>
              {name}
              <span className="ml-2 text-[10px] uppercase text-[#64748B]">placeholder</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
