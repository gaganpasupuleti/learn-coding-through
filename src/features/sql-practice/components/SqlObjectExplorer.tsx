import { PanelLeft } from 'lucide-react'
import { SQL_DATABASE_CATALOG } from '../data/databaseCatalog'
import type { SqlDatabaseId } from '../types/sqlPractice.types'
import { SqlDatabaseSelector } from './SqlDatabaseSelector'
import { SqlTableTree } from './SqlTableTree'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlObjectExplorerProps {
  activeDatabaseId: SqlDatabaseId
  onDatabaseChange: (id: SqlDatabaseId) => void
  expandedSections: Record<string, boolean>
  expandedTables: Record<string, boolean>
  onToggleSection: (key: string) => void
  onToggleTable: (tableName: string) => void
}

export function SqlObjectExplorer({
  activeDatabaseId,
  onDatabaseChange,
  expandedSections,
  expandedTables,
  onToggleSection,
  onToggleTable,
}: SqlObjectExplorerProps) {
  const database = SQL_DATABASE_CATALOG.find((d) => d.id === activeDatabaseId)!

  return (
    <aside className={cn('flex h-full flex-col', wb.panel)}>
      <div className={cn('flex items-center gap-2 border-b px-4 py-3', wb.border)}>
        <PanelLeft className="h-4 w-4 text-emerald-400" />
        <span className={cn('text-sm font-semibold', wb.textPrimary)}>Object Explorer</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SqlDatabaseSelector
          databases={SQL_DATABASE_CATALOG}
          activeId={activeDatabaseId}
          onSelect={onDatabaseChange}
        />
        <SqlTableTree
          database={database}
          expandedSections={expandedSections}
          expandedTables={expandedTables}
          onToggleSection={onToggleSection}
          onToggleTable={onToggleTable}
        />
      </div>
    </aside>
  )
}
