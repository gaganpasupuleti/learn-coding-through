import type {
  SqlColumnMeta,
  SqlColumnKeyType,
  SqlDatabaseMeta,
  SqlSchemaGraph,
  SqlSchemaNode,
  SqlSchemaRelationship,
  SqlSchemaSearchMatch,
} from '../types/sqlPractice.types'

export const SCHEMA_CARD_WIDTH = 220
export const SCHEMA_HEADER_HEIGHT = 48
export const SCHEMA_ROW_HEIGHT = 22
export const SCHEMA_CARD_PADDING = 12
export const SCHEMA_GRID_GAP_X = 72
export const SCHEMA_GRID_GAP_Y = 48
export const SCHEMA_CANVAS_PADDING = 32
export const SCHEMA_COLUMNS = 4

export function getColumnKeyType(column: SqlColumnMeta): SqlColumnKeyType {
  if (column.isPrimaryKey && column.isForeignKey) return 'pk_fk'
  if (column.isPrimaryKey) return 'pk'
  if (column.isForeignKey) return 'fk'
  return null
}

export function getTableRelationships(database: SqlDatabaseMeta): SqlSchemaRelationship[] {
  const relationships: SqlSchemaRelationship[] = []

  for (const tbl of database.tables) {
    for (const column of tbl.columns) {
      if (!column.references) continue
      relationships.push({
        id: `${tbl.name}.${column.name}->${column.references.table}.${column.references.column}`,
        fromTable: tbl.name,
        fromColumn: column.name,
        toTable: column.references.table,
        toColumn: column.references.column,
      })
    }
  }

  return relationships
}

function measureNodeHeight(table: SqlDatabaseMeta['tables'][number]): number {
  return SCHEMA_HEADER_HEIGHT + table.columns.length * SCHEMA_ROW_HEIGHT + SCHEMA_CARD_PADDING
}

export function buildSchemaGraph(database: SqlDatabaseMeta): SqlSchemaGraph {
  const relationships = getTableRelationships(database)
  const colHeights = Array.from({ length: SCHEMA_COLUMNS }, () => SCHEMA_CANVAS_PADDING)
  const nodes: SqlSchemaNode[] = []

  database.tables.forEach((table, index) => {
    const col = index % SCHEMA_COLUMNS
    const height = measureNodeHeight(table)
    const x = SCHEMA_CANVAS_PADDING + col * (SCHEMA_CARD_WIDTH + SCHEMA_GRID_GAP_X)
    const y = colHeights[col]

    nodes.push({
      table,
      x,
      y,
      width: SCHEMA_CARD_WIDTH,
      height,
    })

    colHeights[col] += height + SCHEMA_GRID_GAP_Y
  })

  const width =
    SCHEMA_CANVAS_PADDING * 2 +
    SCHEMA_COLUMNS * SCHEMA_CARD_WIDTH +
    (SCHEMA_COLUMNS - 1) * SCHEMA_GRID_GAP_X
  const height = Math.max(...colHeights, SCHEMA_CANVAS_PADDING * 2)

  return { nodes, relationships, width, height }
}

export function getNodeByTableName(graph: SqlSchemaGraph, tableName: string): SqlSchemaNode | undefined {
  return graph.nodes.find((node) => node.table.name === tableName)
}

export function getRelatedTables(
  tableName: string,
  relationships: SqlSchemaRelationship[],
): Set<string> {
  const related = new Set<string>()
  for (const rel of relationships) {
    if (rel.fromTable === tableName) related.add(rel.toTable)
    if (rel.toTable === tableName) related.add(rel.fromTable)
  }
  return related
}

export function getColumnCenterY(node: SqlSchemaNode, columnName: string): number {
  const index = node.table.columns.findIndex((col) => col.name === columnName)
  if (index < 0) return node.y + node.height / 2
  return node.y + SCHEMA_HEADER_HEIGHT + index * SCHEMA_ROW_HEIGHT + SCHEMA_ROW_HEIGHT / 2
}

export function getRelationshipEndpoints(
  graph: SqlSchemaGraph,
  relationship: SqlSchemaRelationship,
): { x1: number; y1: number; x2: number; y2: number } | null {
  const fromNode = getNodeByTableName(graph, relationship.fromTable)
  const toNode = getNodeByTableName(graph, relationship.toTable)
  if (!fromNode || !toNode) return null

  const fromCol = fromNode.x + fromNode.width
  const fromRow = getColumnCenterY(fromNode, relationship.fromColumn)
  const toCol = toNode.x
  const toRow = getColumnCenterY(toNode, relationship.toColumn)

  if (fromNode.x < toNode.x) {
    return { x1: fromCol, y1: fromRow, x2: toCol, y2: toRow }
  }

  return { x1: fromNode.x, y1: fromRow, x2: toNode.x + toNode.width, y2: toRow }
}

export function getSearchMatches(database: SqlDatabaseMeta, query: string): SqlSchemaSearchMatch[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return []

  const matches: SqlSchemaSearchMatch[] = []
  const seen = new Set<string>()

  for (const table of database.tables) {
    const tableHit = table.name.toLowerCase().includes(trimmed)
    if (tableHit) {
      const key = table.name
      if (!seen.has(key)) {
        matches.push({ tableName: table.name })
        seen.add(key)
      }
    }

    for (const column of table.columns) {
      if (column.name.toLowerCase().includes(trimmed)) {
        const key = `${table.name}.${column.name}`
        if (!seen.has(key)) {
          matches.push({ tableName: table.name, columnName: column.name })
          seen.add(key)
        }
      }
    }
  }

  return matches
}

export function tableMatchesSearch(
  tableName: string,
  matches: SqlSchemaSearchMatch[],
  hasQuery: boolean,
): boolean {
  if (!hasQuery) return true
  return matches.some((match) => match.tableName === tableName)
}

export function columnMatchesSearch(
  tableName: string,
  columnName: string,
  matches: SqlSchemaSearchMatch[],
  hasQuery: boolean,
): boolean {
  if (!hasQuery) return false
  return matches.some(
    (match) => match.tableName === tableName && (!match.columnName || match.columnName === columnName),
  )
}

export function formatRelationshipLabel(relationship: SqlSchemaRelationship): string {
  return `${relationship.fromTable}.${relationship.fromColumn} → ${relationship.toTable}.${relationship.toColumn}`
}
