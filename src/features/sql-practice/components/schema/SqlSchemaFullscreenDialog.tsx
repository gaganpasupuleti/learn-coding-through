import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { SqlDatabaseMeta, SqlSchemaRelationship } from '../../types/sqlPractice.types'
import { SqlSchemaDiagram } from './SqlSchemaDiagram'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlSchemaFullscreenDialogProps {
  database: SqlDatabaseMeta
  open: boolean
  onClose: () => void
  onInsertJoinTemplate?: (relationship: SqlSchemaRelationship) => void
}

export function SqlSchemaFullscreenDialog({
  database,
  open,
  onClose,
  onInsertJoinTemplate,
}: SqlSchemaFullscreenDialogProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className={cn('fixed inset-0 z-[100] flex flex-col', wb.root)}
      role="dialog"
      aria-modal="true"
      aria-label={`${database.displayName} schema diagram`}
    >
      <header className={cn('flex shrink-0 items-center justify-between border-b px-4 py-3', wb.border, wb.panel)}>
        <div>
          <h2 className={cn('text-base font-semibold', wb.textPrimary)}>{database.displayName}</h2>
          <p className={cn('text-xs', wb.textMuted)}>Schema diagram — full screen</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={cn(wb.toolbarBtn, 'shrink-0')}
          aria-label="Close schema diagram"
        >
          <X className="h-4 w-4" />
          Close
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        <SqlSchemaDiagram database={database} fullscreen onInsertJoinTemplate={onInsertJoinTemplate} />
      </div>
    </div>,
    document.body,
  )
}
