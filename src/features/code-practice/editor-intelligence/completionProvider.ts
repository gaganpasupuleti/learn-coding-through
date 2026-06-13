import type { Monaco } from '@monaco-editor/react'
import type { IDisposable, ITextModel, Position, languages } from 'monaco-editor'
import type { PracticeIntelligenceLanguage } from './codeIntelligence.types'
import { extractVariablesForLanguage, isInsideCallExpression, isInsideJavaPrintCall } from './variableExtractor'
import { getSnippetsForLanguage } from './snippetLibrary'
import { PYTHON_KEYWORDS } from './pythonCompletions'
import { JAVASCRIPT_KEYWORDS } from './javascriptCompletions'
import { JAVA_KEYWORDS } from './javaCompletions'
import { REACT_KEYWORDS, REACT_JSX_TAGS } from './reactCompletions'

const ACTIVE_LANGUAGES = new Set<PracticeIntelligenceLanguage>(['python', 'javascript', 'react', 'java'])

export function isPracticeIntelligenceLanguage(
  lang: string,
): lang is PracticeIntelligenceLanguage {
  return ACTIVE_LANGUAGES.has(lang as PracticeIntelligenceLanguage)
}

function monacoLanguageId(language: PracticeIntelligenceLanguage): string {
  if (language === 'python') return 'python'
  if (language === 'java') return 'java'
  return 'javascript'
}

function matchesPrefix(label: string, prefix: string): boolean {
  if (!prefix) return true
  return label.toLowerCase().startsWith(prefix.toLowerCase())
}

function buildVariableItems(
  monaco: Monaco,
  variables: string[],
  prefix: string,
  range: languages.CompletionItem['range'],
): languages.CompletionItem[] {
  return variables
    .filter((name) => matchesPrefix(name, prefix))
    .map((name) => ({
      label: name,
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: name,
      detail: 'Declared variable',
      range,
      sortText: `0_${name}`,
    }))
}

function buildSnippetItems(
  monaco: Monaco,
  language: PracticeIntelligenceLanguage,
  prefix: string,
  range: languages.CompletionItem['range'],
): languages.CompletionItem[] {
  return getSnippetsForLanguage(language)
    .filter((s) => matchesPrefix(s.filterText ?? s.label, prefix))
    .map((s) => ({
      label: s.label,
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: s.insertText,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: s.detail,
      documentation: s.documentation,
      range,
      sortText: `1_${s.label}`,
    }))
}

function buildKeywordItems(
  monaco: Monaco,
  keywords: { label: string; detail?: string }[],
  prefix: string,
  range: languages.CompletionItem['range'],
): languages.CompletionItem[] {
  return keywords
    .filter((k) => matchesPrefix(k.label, prefix))
    .map((k) => ({
      label: k.label,
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: k.label,
      detail: k.detail,
      range,
      sortText: `2_${k.label}`,
    }))
}

function getKeywords(language: PracticeIntelligenceLanguage) {
  if (language === 'python') return PYTHON_KEYWORDS
  if (language === 'java') return JAVA_KEYWORDS
  if (language === 'javascript') return JAVASCRIPT_KEYWORDS
  return [...JAVASCRIPT_KEYWORDS, ...REACT_KEYWORDS]
}

function getJsxTagItems(
  monaco: Monaco,
  prefix: string,
  range: languages.CompletionItem['range'],
  lineContent: string,
): languages.CompletionItem[] {
  if (!lineContent.includes('<') && !prefix) return []
  return REACT_JSX_TAGS.filter((tag) => matchesPrefix(tag, prefix)).map((tag) => ({
    label: tag,
    kind: monaco.languages.CompletionItemKind.Class,
    insertText: tag,
    detail: 'JSX element',
    range,
    sortText: `3_${tag}`,
  }))
}

function provideCompletions(
  monaco: Monaco,
  practiceLanguage: PracticeIntelligenceLanguage,
  model: ITextModel,
  position: Position,
): languages.CompletionList {
  const wordInfo = model.getWordUntilPosition(position)
  const range = {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn: wordInfo.startColumn,
    endColumn: wordInfo.endColumn,
  }

  const code = model.getValue()
  const lineContent = model.getLineContent(position.lineNumber)
  const prefix = wordInfo.word
  const textBeforeCursor = lineContent.slice(0, position.column - 1)

  const variables = extractVariablesForLanguage(practiceLanguage, code)

  const inPrint = practiceLanguage === 'python' && isInsideCallExpression(textBeforeCursor, 'print')
  const inConsoleLog =
    (practiceLanguage === 'javascript' || practiceLanguage === 'react') &&
    isInsideCallExpression(textBeforeCursor, 'console.log')
  const inJavaPrint = practiceLanguage === 'java' && isInsideJavaPrintCall(textBeforeCursor)

  const afterOperator = /[+\-*/%,]\s*$/.test(textBeforeCursor)
  const prioritizeVariables = inPrint || inConsoleLog || inJavaPrint || afterOperator

  const variableItems = buildVariableItems(monaco, variables, prefix, range)
  const snippetItems = prioritizeVariables ? [] : buildSnippetItems(monaco, practiceLanguage, prefix, range)
  const keywordItems = prioritizeVariables ? [] : buildKeywordItems(monaco, getKeywords(practiceLanguage), prefix, range)
  const jsxItems =
    practiceLanguage === 'react' && !prioritizeVariables
      ? getJsxTagItems(monaco, prefix, range, lineContent)
      : []

  return { suggestions: [...variableItems, ...snippetItems, ...keywordItems, ...jsxItems] }
}

/** Register offline rule-based completion for Code Workbench languages. */
export function registerPracticeCompletionProvider(
  monaco: Monaco,
  practiceLanguage: PracticeIntelligenceLanguage,
): IDisposable {
  const langId = monacoLanguageId(practiceLanguage)

  return monaco.languages.registerCompletionItemProvider(langId, {
    triggerCharacters: ['.', '(', ' ', '+', '-', '*', '/', ',', '<', '"', "'"],
    provideCompletionItems: (model, position) =>
      provideCompletions(monaco, practiceLanguage, model, position),
  })
}
