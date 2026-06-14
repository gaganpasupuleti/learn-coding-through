import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'
import type { DaxDatasetMeta } from '../types/powerbiPractice.types'

interface DaxSchemaPanelProps {
  dataset: DaxDatasetMeta
}

export function DaxSchemaPanel({ dataset }: DaxSchemaPanelProps) {
  return (
    <div className={cn('overflow-y-auto border-t p-4', wb.border, wb.panel)}>
      <div className="mb-3">
        <h3 className={cn('text-sm font-semibold', wb.textPrimary)}>{dataset.displayName}</h3>
        <p className={cn('mt-1 text-xs leading-relaxed', wb.textMuted)}>{dataset.description}</p>
      </div>

      <div className="space-y-3">
        {dataset.tables.map((table) => (
          <div key={table.name} className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
            <p className={cn('mb-2 font-mono text-sm font-semibold text-sky-300')}>{table.name}</p>
            <ul className="space-y-1">
              {table.columns.map((column) => (
                <li
                  key={column.name}
                  className={cn('flex items-center justify-between gap-2 font-mono text-xs', wb.textSecondary)}
                >
                  <span>{column.name}</span>
                  <span className={cn('text-[11px]', wb.textMuted)}>{column.dataType}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
