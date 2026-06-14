import { FileCode2 } from 'lucide-react'
import type { SqlDatabaseMeta, SqlPracticeQuestion } from '../types/sqlPractice.types'
import {
  buildCountTemplate,
  buildGroupByTemplate,
  buildHavingTemplate,
  buildJoinTwoTablesTemplate,
  buildOrderLimitTemplate,
  buildSelectTemplate,
  buildWhereTemplate,
  getDefaultColumnName,
  getDefaultJoinPair,
  getDefaultTableName,
} from '../utils/sqlEditorInsert'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

export type SqlQueryTemplateId =
  | 'select_all'
  | 'where_filter'
  | 'count_rows'
  | 'group_by'
  | 'join_tables'
  | 'having_filter'
  | 'order_limit'

interface SqlQueryTemplatesProps {
  database: SqlDatabaseMeta
  question: SqlPracticeQuestion
  onInsertTemplate: (sql: string, templateId: SqlQueryTemplateId) => void
}

const TEMPLATE_ITEMS: Array<{ id: SqlQueryTemplateId; label: string; hint: string }> = [
  { id: 'select_all', label: 'SELECT *', hint: 'Start with all columns from one table' },
  { id: 'where_filter', label: 'WHERE filter', hint: 'Filter rows before grouping' },
  { id: 'count_rows', label: 'COUNT rows', hint: 'Count all rows in a table' },
  { id: 'group_by', label: 'GROUP BY', hint: 'Count rows per group — add non-aggregated columns to GROUP BY' },
  { id: 'join_tables', label: 'INNER JOIN', hint: 'Combine two tables on matching keys' },
  { id: 'having_filter', label: 'HAVING', hint: 'Filter grouped results after GROUP BY' },
  { id: 'order_limit', label: 'ORDER BY + LIMIT', hint: 'Sort results (ASC/DESC) and cap row count' },
]

function buildTemplateSql(
  id: SqlQueryTemplateId,
  database: SqlDatabaseMeta,
  question: SqlPracticeQuestion,
): string {
  const tableName = getDefaultTableName(database, question)
  const table = database.tables.find((item) => item.name === tableName)
  const columnName = getDefaultColumnName(table)
  const joinPair = getDefaultJoinPair(database)

  switch (id) {
    case 'select_all':
      return buildSelectTemplate(tableName)
    case 'where_filter':
      return buildWhereTemplate(tableName, columnName)
    case 'count_rows':
      return buildCountTemplate(tableName)
    case 'group_by':
      return buildGroupByTemplate(tableName, columnName)
    case 'join_tables':
      if (joinPair) {
        return buildJoinTwoTablesTemplate(
          joinPair.fromTable,
          joinPair.toTable,
          joinPair.fromColumn,
          joinPair.toColumn,
        )
      }
      return buildSelectTemplate(tableName)
    case 'having_filter':
      return buildHavingTemplate(tableName, columnName)
    case 'order_limit':
      return buildOrderLimitTemplate(tableName, columnName)
    default:
      return buildSelectTemplate(tableName)
  }
}

export function SqlQueryTemplates({ database, question, onInsertTemplate }: SqlQueryTemplatesProps) {
  return (
    <div className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
      <div className="mb-2 flex items-center gap-2">
        <FileCode2 className="h-4 w-4 text-emerald-400" />
        <h3 className={cn('text-xs font-semibold uppercase tracking-wide', wb.textMuted)}>Quick queries</h3>
      </div>
      <p className={cn('mb-2 text-[11px]', wb.textMuted)}>
        Inserts a starter pattern only — edit placeholders, then run when ready.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATE_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.hint}
            onClick={() => onInsertTemplate(buildTemplateSql(item.id, database, question), item.id)}
            className={cn(
              'rounded-md border px-2 py-1 text-left text-[11px] transition-colors',
              wb.border,
              'bg-[#0F172A] text-slate-300 hover:border-emerald-600/50 hover:bg-emerald-950/30 hover:text-emerald-100',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
