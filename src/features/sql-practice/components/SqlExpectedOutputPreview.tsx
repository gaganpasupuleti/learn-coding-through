import { Loader2 } from 'lucide-react'
import type { SqlExpectedOutputPreview, SqlPracticeQuestion } from '../types/sqlPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlExpectedOutputPreviewPanelProps {
  question: SqlPracticeQuestion
  preview: SqlExpectedOutputPreview
}

export function SqlExpectedOutputPreviewPanel({ question, preview }: SqlExpectedOutputPreviewPanelProps) {
  if (preview.status === 'loading') {
    return (
      <div
        className={cn('flex items-center gap-2 p-4 text-sm', wb.textMuted)}
        role="status"
        aria-live="polite"
        aria-label="Loading expected output preview"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading expected output preview…
      </div>
    )
  }

  if (preview.status === 'error') {
    return (
      <div className={cn('space-y-2 p-4 text-sm', wb.textMuted)} role="alert">
        <p className="font-medium text-rose-200">
          {preview.errorMessage ?? 'Unable to load expected output preview.'}
        </p>
        <p className="text-xs">
          Expected columns for this question:{' '}
          <span className="font-mono text-emerald-300/90">{question.expectedColumns.join(', ') || '—'}</span>
        </p>
        <p className="text-xs">Try running your own query, or use hints — solution SQL is never shown here.</p>
      </div>
    )
  }

  if (preview.status === 'idle') {
    return (
      <div className={cn('p-4 text-sm', wb.textMuted)} role="status">
        Select a checkable question to preview the expected result shape (columns and sample rows).
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Expected columns</p>
        <p className="font-mono text-sm text-emerald-300">{preview.columns.join(' | ') || question.expectedColumns.join(' | ') || '—'}</p>
      </div>
      <div>
        <p className={cn('mb-1 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Expected row count</p>
        <p className="font-mono text-sm">{preview.rowCount}</p>
        {preview.zeroRowMessage && (
          <p className={cn('mt-2 text-sm text-amber-200/90')}>{preview.zeroRowMessage}</p>
        )}
      </div>
      <div>
        <p className={cn('mb-2 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>
          Sample rows (first {preview.sampleRows.length} of {preview.rowCount})
        </p>
        {preview.sampleRows.length === 0 ? (
          <p className={cn('text-sm', wb.textMuted)}>
            {preview.zeroRowMessage ? 'No sample rows to display.' : 'Expected result has no rows.'}
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead className="bg-[#252526]">
                <tr>
                  {preview.columns.map((col) => (
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
                {preview.sampleRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-[#111827]/80">
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
        )}
      </div>
      <p className={cn('text-xs', wb.textMuted)}>
        Preview shows result shape only — not your answer and not the solution SQL.
      </p>
    </div>
  )
}
