import { TableProperties } from 'lucide-react'
import type { SqlQueryGrid } from '../types/sqlPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlResultsPanelProps {
  result: SqlQueryGrid
  emptyMessage?: string
}

export function SqlResultsPanel({ result, emptyMessage }: SqlResultsPanelProps) {
  if (!result.hasRun) {
    return (
      <div
        className={cn('flex min-h-[140px] flex-col items-center justify-center gap-2 p-6 text-center', wb.textMuted)}
        role="status"
        aria-label="No query results yet"
      >
        <TableProperties className="h-8 w-8 text-[#475569]" />
        <p className="text-sm font-medium">No results yet.</p>
        <p className="max-w-md text-xs leading-relaxed">
          Write a SELECT query in the editor, then click <strong className="text-slate-300">Run</strong> to see
          rows here.
        </p>
      </div>
    )
  }

  if (result.errorMessage) {
    return (
      <div className={cn('space-y-2 p-4 text-sm', wb.textMuted)} role="alert">
        <p className="font-medium text-rose-200/90">This query did not return a result grid.</p>
        <p className="text-xs">Open the <strong className="text-slate-300">Messages</strong> tab for the full error
          details and hints.</p>
      </div>
    )
  }

  if (result.rowCount === 0 && result.columns.length === 0) {
    return (
      <div className={cn('p-4 text-sm', wb.textMuted)} role="status">
        <p>{emptyMessage ?? 'Query ran successfully but returned no rows.'}</p>
        <p className="mt-1 text-xs">Zero rows is a valid result — check your WHERE filters.</p>
      </div>
    )
  }

  return (
    <div className="overflow-auto">
      {result.rowCount === 0 && emptyMessage && (
        <p className={cn('border-b px-4 py-2 text-sm', wb.border, wb.textMuted)}>{emptyMessage}</p>
      )}
      <table className="w-full min-w-max border-collapse text-sm">
        <thead className={cn('sticky top-0', 'bg-[#252526]')}>
          <tr>
            <th className={cn('border-b px-3 py-2 text-left text-xs font-semibold', wb.border, wb.textMuted)}>
              #
            </th>
            {result.columns.map((col) => (
              <th
                key={col}
                className={cn('border-b px-3 py-2 text-left font-mono text-xs font-semibold text-emerald-200', wb.border)}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-[#111827]/80">
              <td className={cn('border-b px-3 py-1.5 text-xs', wb.border, wb.textMuted)}>{rowIndex + 1}</td>
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  className={cn('border-b px-3 py-1.5 font-mono text-[13px]', wb.border, wb.textSecondary)}
                >
                  {cell === null ? <span className="text-sky-300/80">NULL</span> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
