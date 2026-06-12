import { Search } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlSchemaSearchProps {
  value: string
  matchCount: number
  hasQuery: boolean
  onChange: (value: string) => void
}

export function SqlSchemaSearch({ value, matchCount, hasQuery, onChange }: SqlSchemaSearchProps) {
  return (
    <div className="space-y-1">
      <div className={cn('relative', wb.textSecondary)}>
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search tables or columns…"
          className={cn(
            'w-full rounded-md border bg-[#111827] py-2 pl-9 pr-3 text-sm',
            wb.border,
            wb.textPrimary,
          )}
        />
      </div>
      {hasQuery && (
        <p className={cn('text-xs', wb.textMuted)}>
          {matchCount > 0 ? `${matchCount} match${matchCount === 1 ? '' : 'es'} found` : 'No matches found'}
        </p>
      )}
    </div>
  )
}
