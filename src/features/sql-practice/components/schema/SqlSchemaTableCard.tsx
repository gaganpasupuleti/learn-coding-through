import type { SqlSchemaNode } from '../../types/sqlPractice.types'
import type { SqlSchemaSearchMatch } from '../../types/sqlPractice.types'
import { columnMatchesSearch, getColumnKeyType } from '../../utils/sqlSchemaGraph'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlSchemaTableCardProps {
  node: SqlSchemaNode
  selected: boolean
  related: boolean
  dimmed: boolean
  highlightedColumns: Set<string>
  searchMatches: SqlSchemaSearchMatch[]
  hasSearchQuery: boolean
  onSelect: (tableName: string) => void
}

export function SqlSchemaTableCard({
  node,
  selected,
  related,
  dimmed,
  highlightedColumns,
  searchMatches,
  hasSearchQuery,
  onSelect,
}: SqlSchemaTableCardProps) {
  const { table, x, y, width, height } = node

  return (
    <button
      type="button"
      onClick={() => onSelect(table.name)}
      className={cn(
        'absolute left-0 top-0 overflow-hidden rounded-lg border text-left transition-opacity',
        wb.border,
        'bg-[#111827]',
        selected && 'border-emerald-400 ring-2 ring-emerald-400/40',
        !selected && related && 'border-sky-500/70 ring-1 ring-sky-500/30',
        dimmed && 'opacity-35',
        !dimmed && 'opacity-100',
      )}
      style={{ transform: `translate(${x}px, ${y}px)`, width, height }}
    >
      <div className={cn('border-b px-3 py-2', wb.border, 'bg-[#1a2332]')}>
        <p className="font-mono text-sm font-semibold text-emerald-300">{table.name}</p>
        <p className={cn('text-[10px]', wb.textMuted)}>{table.rowCount.toLocaleString()} rows</p>
      </div>
      <ul className="px-2 py-1">
        {table.columns.map((column) => {
          const keyType = getColumnKeyType(column)
          const columnHit =
            highlightedColumns.has(column.name) ||
            columnMatchesSearch(table.name, column.name, searchMatches, hasSearchQuery)

          return (
            <li
              key={column.name}
              className={cn(
                'flex items-start gap-1 rounded px-1 py-0.5 font-mono text-[11px] leading-tight',
                columnHit && 'bg-amber-500/15 text-amber-100',
                !columnHit && wb.textSecondary,
              )}
            >
              <span className="min-w-0 flex-1 truncate">{column.name}</span>
              <span className="shrink-0 text-[10px] text-slate-500">{column.dataType}</span>
              {keyType === 'pk' && <span className="shrink-0 rounded bg-amber-900/60 px-1 text-[9px] text-amber-200">PK</span>}
              {keyType === 'fk' && <span className="shrink-0 rounded bg-sky-900/60 px-1 text-[9px] text-sky-200">FK</span>}
              {keyType === 'pk_fk' && (
                <span className="shrink-0 rounded bg-violet-900/60 px-1 text-[9px] text-violet-200">PK/FK</span>
              )}
            </li>
          )
        })}
      </ul>
      {table.columns.some((c) => c.references) && (
        <div className={cn('border-t px-2 py-1 text-[10px]', wb.border, wb.textMuted)}>
          {table.columns
            .filter((c) => c.references)
            .slice(0, 2)
            .map((c) => (
              <div key={c.name} className="truncate">
                {c.name} → {c.references!.table}.{c.references!.column}
              </div>
            ))}
        </div>
      )}
    </button>
  )
}
