import { CheckCircle2, XCircle } from 'lucide-react'
import type { CodePracticeTestResult } from '../types/codePractice.types'

interface TestResultsPanelProps {
  results: CodePracticeTestResult[]
}

export function TestResultsPanel({ results }: TestResultsPanelProps) {
  if (results.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500">
        Submit your solution to compare output against the sample case.
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-800">
      {results.map((result) => (
        <div key={result.id} className="flex items-start gap-2.5 px-4 py-3 text-sm">
          {result.passed ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-200">{result.label}</p>
            <p className="text-slate-400">{result.message}</p>
            {!result.passed && (
              <div className="mt-1.5 space-y-0.5 font-mono text-xs text-slate-500">
                <div>Expected: {result.expected}</div>
                <div>Actual: {result.actual}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
