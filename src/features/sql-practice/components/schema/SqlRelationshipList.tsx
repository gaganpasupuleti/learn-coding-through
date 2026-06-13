import type { SqlSchemaRelationship } from '../../types/sqlPractice.types'
import { formatRelationshipLabel } from '../../utils/sqlSchemaGraph'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlRelationshipListProps {
  relationships: SqlSchemaRelationship[]
  selectedRelationshipId: string | null
  onSelect: (relationship: SqlSchemaRelationship) => void
  expanded?: boolean
  onInsertJoinTemplate?: (relationship: SqlSchemaRelationship) => void
}

export function SqlRelationshipList({
  relationships,
  selectedRelationshipId,
  onSelect,
  expanded = false,
  onInsertJoinTemplate,
}: SqlRelationshipListProps) {
  if (relationships.length === 0) {
    return (
      <p className={cn('text-xs', wb.textMuted)}>No foreign key relationships in this database.</p>
    )
  }

  return (
    <ul className={cn('space-y-1 overflow-y-auto', expanded ? 'min-h-0 flex-1' : 'max-h-48')}>
      {relationships.map((relationship) => {
        const active = relationship.id === selectedRelationshipId
        return (
          <li key={relationship.id}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelect(relationship)}
                className={cn(
                  'min-w-0 flex-1 rounded-md border px-2 py-1.5 text-left font-mono text-[11px] transition-colors',
                  wb.border,
                  active
                    ? 'border-sky-500/70 bg-sky-950/40 text-sky-100'
                    : 'bg-[#111827] hover:bg-[#1a2332]',
                  !active && wb.textSecondary,
                )}
              >
                {formatRelationshipLabel(relationship)}
              </button>
              {onInsertJoinTemplate && (
                <button
                  type="button"
                  title="Insert JOIN template"
                  onClick={(event) => {
                    event.stopPropagation()
                    onInsertJoinTemplate(relationship)
                  }}
                  className={cn(
                    'shrink-0 rounded-md border px-1.5 py-1 text-[10px] font-medium text-sky-300 hover:bg-sky-950/40',
                    wb.border,
                  )}
                  aria-label="Insert JOIN template"
                >
                  JOIN
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
