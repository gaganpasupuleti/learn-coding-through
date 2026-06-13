import { useEffect, useMemo, useState } from 'react'
import type { SqlDatabaseMeta, SqlSchemaRelationship } from '../../types/sqlPractice.types'
import {
  buildSchemaGraph,
  getRelatedTables,
  getSearchMatches,
  tableMatchesSearch,
} from '../../utils/sqlSchemaGraph'
import { SqlSchemaSearch } from './SqlSchemaSearch'
import { SqlSchemaTableCard } from './SqlSchemaTableCard'
import { SqlRelationshipLayer } from './SqlRelationshipLayer'
import { SqlRelationshipList } from './SqlRelationshipList'
import { Maximize2 } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlSchemaDiagramProps {
  database: SqlDatabaseMeta
  fullscreen?: boolean
  onRequestFullscreen?: () => void
  onInsertJoinTemplate?: (relationship: SqlSchemaRelationship) => void
}

export function SqlSchemaDiagram({
  database,
  fullscreen = false,
  onRequestFullscreen,
  onInsertJoinTemplate,
}: SqlSchemaDiagramProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null)

  useEffect(() => {
    setSearchQuery('')
    setSelectedTable(null)
    setSelectedRelationshipId(null)
  }, [database.id])

  const graph = useMemo(() => buildSchemaGraph(database), [database])
  const searchMatches = useMemo(
    () => getSearchMatches(database, searchQuery),
    [database, searchQuery],
  )
  const hasSearchQuery = searchQuery.trim().length > 0

  const relatedTables = useMemo(() => {
    if (!selectedTable) return new Set<string>()
    return getRelatedTables(selectedTable, graph.relationships)
  }, [selectedTable, graph.relationships])

  const highlightedRelationshipIds = useMemo(() => {
    const ids = new Set<string>()
    if (selectedRelationshipId) {
      ids.add(selectedRelationshipId)
      return ids
    }
    if (!selectedTable) return ids
    for (const rel of graph.relationships) {
      if (rel.fromTable === selectedTable || rel.toTable === selectedTable) {
        ids.add(rel.id)
      }
    }
    return ids
  }, [selectedTable, selectedRelationshipId, graph.relationships])

  const highlightedColumnsByTable = useMemo(() => {
    const map = new Map<string, Set<string>>()
    if (!hasSearchQuery) return map
    for (const match of searchMatches) {
      if (!match.columnName) continue
      const set = map.get(match.tableName) ?? new Set<string>()
      set.add(match.columnName)
      map.set(match.tableName, set)
    }
    return map
  }, [searchMatches, hasSearchQuery])

  const handleSelectTable = (tableName: string) => {
    setSelectedTable((prev) => (prev === tableName ? null : tableName))
    setSelectedRelationshipId(null)
  }

  const handleSelectRelationship = (relationship: SqlSchemaRelationship) => {
    setSelectedRelationshipId((prev) => (prev === relationship.id ? null : relationship.id))
    setSelectedTable(relationship.fromTable)
  }

  const selectedNode = selectedTable
    ? graph.nodes.find((node) => node.table.name === selectedTable)
    : null

  const selectedRelationship = selectedRelationshipId
    ? graph.relationships.find((rel) => rel.id === selectedRelationshipId)
    : null

  return (
    <div className={cn('flex h-full min-h-0 flex-col', fullscreen ? 'flex-row' : 'lg:flex-row')}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-transparent lg:border-[#334155]">
        <div className={cn('shrink-0 border-b p-3', wb.border)}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <SqlSchemaSearch
                value={searchQuery}
                matchCount={searchMatches.length}
                hasQuery={hasSearchQuery}
                onChange={setSearchQuery}
              />
            </div>
            {!fullscreen && onRequestFullscreen && (
              <button
                type="button"
                onClick={onRequestFullscreen}
                className={cn(wb.toolbarBtn, 'shrink-0 self-start')}
              >
                <Maximize2 className="h-4 w-4" />
                Expand schema
              </button>
            )}
          </div>
        </div>
        <div className={cn('relative min-h-0 flex-1 overflow-auto', fullscreen ? 'p-4' : 'p-2')}>
          <div
            className="relative"
            style={{ width: graph.width, height: graph.height, minWidth: graph.width, minHeight: graph.height }}
          >
            <SqlRelationshipLayer
              graph={graph}
              selectedTable={selectedTable}
              selectedRelationshipId={selectedRelationshipId}
              relatedTables={relatedTables}
              highlightedRelationshipIds={highlightedRelationshipIds}
              onSelectRelationship={handleSelectRelationship}
            />
            {graph.nodes.map((node) => {
              const tableName = node.table.name
              const matches = tableMatchesSearch(tableName, searchMatches, hasSearchQuery)
              const dimmed = hasSearchQuery && !matches
              const selected = selectedTable === tableName
              const related = !selected && relatedTables.has(tableName)

              return (
                <SqlSchemaTableCard
                  key={tableName}
                  node={node}
                  selected={selected}
                  related={related}
                  dimmed={dimmed}
                  highlightedColumns={highlightedColumnsByTable.get(tableName) ?? new Set()}
                  searchMatches={searchMatches}
                  hasSearchQuery={hasSearchQuery}
                  onSelect={handleSelectTable}
                />
              )
            })}
          </div>
        </div>
      </div>

      <aside
        className={cn(
          'flex w-full shrink-0 flex-col gap-3 p-3',
          fullscreen ? 'w-80 border-l border-[#334155]' : 'lg:w-72',
          wb.textSecondary,
        )}
      >
        <div>
          <h3 className={cn('mb-1 text-xs font-semibold uppercase tracking-wide', wb.textMuted)}>
            Table details
          </h3>
          {selectedNode ? (
            <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
              <p className="font-mono text-sm font-semibold text-emerald-300">{selectedNode.table.name}</p>
              <p className={cn('mb-2 text-xs', wb.textMuted)}>
                {selectedNode.table.rowCount.toLocaleString()} rows · {selectedNode.table.columns.length} columns
              </p>
              {relatedTables.size > 0 && (
                <p className={cn('text-xs', wb.textMuted)}>
                  Related: {Array.from(relatedTables).join(', ')}
                </p>
              )}
            </div>
          ) : (
            <p className={cn('text-xs', wb.textMuted)}>Click a table to inspect relationships.</p>
          )}
        </div>

        {selectedRelationship && (
          <div>
            <h3 className={cn('mb-1 text-xs font-semibold uppercase tracking-wide', wb.textMuted)}>
              Selected relationship
            </h3>
            <p className="rounded-md border border-sky-500/50 bg-sky-950/30 px-2 py-1.5 font-mono text-[11px] text-sky-100">
              {selectedRelationship.fromTable}.{selectedRelationship.fromColumn} →{' '}
              {selectedRelationship.toTable}.{selectedRelationship.toColumn}
            </p>
          </div>
        )}

        <div className={cn('min-h-0', fullscreen ? 'flex flex-1 flex-col' : '')}>
          <h3 className={cn('mb-2 text-xs font-semibold uppercase tracking-wide', wb.textMuted)}>
            Relationships ({graph.relationships.length})
          </h3>
          <SqlRelationshipList
            relationships={graph.relationships}
            selectedRelationshipId={selectedRelationshipId}
            onSelect={handleSelectRelationship}
            expanded={fullscreen}
            onInsertJoinTemplate={onInsertJoinTemplate}
          />
        </div>
      </aside>
    </div>
  )
}
