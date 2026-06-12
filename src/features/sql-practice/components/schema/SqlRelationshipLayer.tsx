import type { SqlSchemaGraph, SqlSchemaRelationship } from '../../types/sqlPractice.types'
import { getRelationshipEndpoints } from '../../utils/sqlSchemaGraph'

interface SqlRelationshipLayerProps {
  graph: SqlSchemaGraph
  selectedTable: string | null
  selectedRelationshipId: string | null
  relatedTables: Set<string>
  highlightedRelationshipIds: Set<string>
  onSelectRelationship: (relationship: SqlSchemaRelationship) => void
}

function relationshipPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const midX = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
}

function RelationshipLine({
  graph,
  relationship,
  active,
  dimmed,
  onSelect,
}: {
  graph: SqlSchemaGraph
  relationship: SqlSchemaRelationship
  active: boolean
  dimmed: boolean
  onSelect: () => void
}) {
  const endpoints = getRelationshipEndpoints(graph, relationship)
  if (!endpoints) return null

  const { x1, y1, x2, y2 } = endpoints
  const path = relationshipPath(x1, y1, x2, y2)

  return (
    <g
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
      />
      <path
        d={path}
        fill="none"
        stroke={active ? '#38bdf8' : dimmed ? '#334155' : '#64748b'}
        strokeWidth={active ? 2.5 : 1.5}
        strokeOpacity={dimmed ? 0.35 : active ? 1 : 0.75}
        markerEnd={active ? 'url(#arrow-active)' : 'url(#arrow-default)'}
      />
    </g>
  )
}

export function SqlRelationshipLayer({
  graph,
  selectedTable,
  selectedRelationshipId,
  relatedTables,
  highlightedRelationshipIds,
  onSelectRelationship,
}: SqlRelationshipLayerProps) {
  const hasSelection = Boolean(selectedTable || selectedRelationshipId)

  return (
    <svg
      className="pointer-events-auto absolute left-0 top-0"
      width={graph.width}
      height={graph.height}
      aria-hidden
    >
      <defs>
        <marker
          id="arrow-default"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="#64748b" />
        </marker>
        <marker
          id="arrow-active"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="#38bdf8" />
        </marker>
      </defs>
      {graph.relationships.map((relationship) => {
        const active =
          relationship.id === selectedRelationshipId ||
          highlightedRelationshipIds.has(relationship.id)
        const touchesSelection =
          !hasSelection ||
          relationship.fromTable === selectedTable ||
          relationship.toTable === selectedTable ||
          relatedTables.has(relationship.fromTable) ||
          relatedTables.has(relationship.toTable)
        const dimmed = hasSelection && !active && !touchesSelection

        return (
          <RelationshipLine
            key={relationship.id}
            graph={graph}
            relationship={relationship}
            active={active}
            dimmed={dimmed}
            onSelect={() => onSelectRelationship(relationship)}
          />
        )
      })}
    </svg>
  )
}
