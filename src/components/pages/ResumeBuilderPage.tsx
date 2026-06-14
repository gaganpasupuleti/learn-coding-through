import { useCallback, useEffect, useMemo, useState } from 'react'
import { Printer, RotateCcw } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { AuthUser } from '@/lib/auth'
import { ResumeForm } from '@/components/resume/ResumeForm'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { STUDENT_PAGE_BG } from '@/components/student-dashboard/dashboard-styles'
import { computeResumeReadinessScore } from '@/lib/resume-score'
import { loadResumeData, resetResumeToSample, saveResumeData } from '@/lib/resume-storage'
import type { ResumeData } from '@/components/resume/resume-demo-data'

interface ResumeBuilderPageProps {
  user: AuthUser
}

export function ResumeBuilderPage({ user }: ResumeBuilderPageProps) {
  const [data, setData] = useState<ResumeData>(() =>
    loadResumeData({ fullName: user.full_name, email: user.email }),
  )

  const score = useMemo(() => computeResumeReadinessScore(data), [data])

  useEffect(() => {
    saveResumeData(data)
  }, [data])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleResetSample = useCallback(() => {
    setData(resetResumeToSample())
  }, [])

  const completedSections = score.checklist.filter((c) => c.done).length

  return (
    <div className={cn(STUDENT_PAGE_BG, 'p-4 md:p-6 print:bg-white print:p-0')}>
      <div className="mx-auto max-w-7xl space-y-6 print:max-w-none print:space-y-0">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 print:hidden">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Resume builder
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                ATS-friendly one-column layout. Edits save automatically in this browser.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              >
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={handleResetSample}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              >
                <RotateCcw className="h-4 w-4" />
                Load sample
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Resume readiness</p>
              <p className="text-xs text-slate-500">
                {completedSections} of {score.checklist.length} sections complete
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-full min-w-[8rem] max-w-xs overflow-hidden rounded-full bg-slate-100 sm:w-48">
                <div
                  className="h-full rounded-full bg-slate-800 transition-all duration-300"
                  style={{ width: `${score.overall}%` }}
                />
              </div>
              <span className="text-lg font-bold tabular-nums text-slate-900">{score.overall}%</span>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start print:block">
          <div className="min-w-0 print:hidden">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Editor
            </p>
            <ResumeForm data={data} onChange={setData} />
          </div>

          <div className="min-w-0 lg:sticky lg:top-6 print:static">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 print:hidden">
              ATS preview
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 print:hidden">
                <p className="text-xs text-slate-500">
                  One-column format · standard fonts · recruiter-friendly
                </p>
              </div>
              <div className="p-4 md:p-6 print:p-0">
                <ResumePreview data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
