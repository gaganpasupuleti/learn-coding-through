import type { Monaco } from '@monaco-editor/react'
import type { IDisposable, ITextModel, Position, languages } from 'monaco-editor'
import type { SqlDatabaseMeta } from '../types/sqlPractice.types'
import type { SqlCompletionContext } from './sqlCompletion.types'
import { SQL_AGGREGATE_COMPLETIONS, SQL_KEYWORDS } from './sqlKeywordCompletions'
import { SQL_SNIPPET_COMPLETIONS } from './sqlSnippetCompletions'
import {
  detectSqlCompletionContext,
  getAllColumnNames,
  getColumnsForTable,
  getTableNames,
  resolveTableFromQualifier,
} from './sqlSchemaCompletions'

function matchesPrefix(label: string, prefix: string): boolean {
  if (!prefix) return true
  return label.toLowerCase().includes(prefix.toLowerCase())
}

function buildRange(model: ITextModel, position: Position) {
  const word = model.getWordUntilPosition(position)
  return {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn: word.startColumn,
    endColumn: word.endColumn,
  }
}

function keywordItems(
  monaco: Monaco,
  items: { label: string; insertText?: string; detail?: string }[],
  prefix: string,
  range: languages.CompletionItem['range'],
  sortPrefix: string,
): languages.CompletionItem[] {
  return items
    .filter((item) => matchesPrefix(item.label, prefix))
    .map((item) => ({
      label: item.label,
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: item.insertText ?? item.label,
      insertTextRules: item.insertText?.includes('${')
        ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        : undefined,
      detail: item.detail,
      range,
      sortText: `${sortPrefix}_${item.label}`,
    }))
}

function schemaItems(
  monaco: Monaco,
  names: string[],
  prefix: string,
  range: languages.CompletionItem['range'],
  kind: 'table' | 'column',
  sortPrefix: string,
): languages.CompletionItem[] {
  const itemKind =
    kind === 'table'
      ? monaco.languages.CompletionItemKind.Class
      : monaco.languages.CompletionItemKind.Field
  return names
    .filter((name) => matchesPrefix(name, prefix))
    .map((name) => ({
      label: name,
      kind: itemKind,
      insertText: name,
      detail: kind === 'table' ? 'table' : 'column',
      range,
      sortText: `${sortPrefix}_${name}`,
    }))
}

function snippetItems(
  monaco: Monaco,
  prefix: string,
  range: languages.CompletionItem['range'],
): languages.CompletionItem[] {
  return SQL_SNIPPET_COMPLETIONS.filter(
    (s) => matchesPrefix(s.filterText ?? s.label, prefix) || matchesPrefix(s.label, prefix),
  ).map((s) => ({
    label: s.label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: s.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: s.detail,
    documentation: s.documentation,
    range,
    sortText: `2_${s.label}`,
  }))
}

function suggestionsForContext(
  monaco: Monaco,
  database: SqlDatabaseMeta,
  context: SqlCompletionContext,
  prefix: string,
  range: languages.CompletionItem['range'],
  sqlText: string,
  tableQualifier?: string,
): languages.CompletionItem[] {
  if (context === 'table_qualified' && tableQualifier) {
    const tableName = resolveTableFromQualifier(database, tableQualifier, sqlText)
    const columns = tableName ? getColumnsForTable(database, tableName) : getAllColumnNames(database)
    return schemaItems(monaco, columns, prefix, range, 'column', '0')
  }

  if (context === 'after_from' || context === 'after_join') {
    return [
      ...schemaItems(monaco, getTableNames(database), prefix, range, 'table', '0'),
      ...keywordItems(monaco, SQL_KEYWORDS, prefix, range, '3'),
    ]
  }

  if (
    context === 'after_where' ||
    context === 'after_group_by' ||
    context === 'after_order_by' ||
    context === 'after_having'
  ) {
    return [
      ...schemaItems(monaco, getAllColumnNames(database), prefix, range, 'column', '0'),
      ...keywordItems(monaco, SQL_KEYWORDS, prefix, range, '3'),
    ]
  }

  if (context === 'after_select') {
    return [
      ...schemaItems(monaco, getAllColumnNames(database), prefix, range, 'column', '0'),
      ...keywordItems(monaco, SQL_AGGREGATE_COMPLETIONS, prefix, range, '1'),
      ...keywordItems(monaco, SQL_KEYWORDS, prefix, range, '3'),
    ]
  }

  return [
    ...keywordItems(monaco, SQL_AGGREGATE_COMPLETIONS, prefix, range, '1'),
    ...snippetItems(monaco, prefix, range),
    ...schemaItems(monaco, getTableNames(database), prefix, range, 'table', '2'),
    ...schemaItems(monaco, getAllColumnNames(database), prefix, range, 'column', '2'),
    ...keywordItems(monaco, SQL_KEYWORDS, prefix, range, '3'),
  ]
}

export function registerSqlCompletionProvider(
  monaco: Monaco,
  database: SqlDatabaseMeta,
): IDisposable {
  return monaco.languages.registerCompletionItemProvider('sql', {
    triggerCharacters: ['.', ' ', '\n', ','],
    provideCompletionItems: (model, position) => {
      const range = buildRange(model, position)
      const prefix = model.getWordUntilPosition(position).word
      const line = model.getLineContent(position.lineNumber)
      const textBeforeCursor = line.slice(0, position.column - 1)
      const { context, tableQualifier } = detectSqlCompletionContext(textBeforeCursor)

      return {
        suggestions: suggestionsForContext(
          monaco,
          database,
          context,
          prefix,
          range,
          model.getValue(),
          tableQualifier,
        ),
      }
    },
  })
}
