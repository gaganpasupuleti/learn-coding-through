import { useCallback, useEffect, useMemo, useState } from 'react'
import { Printer, RotateCcw } from 'lucide-react'

import type { AuthUser } from '@/lib/auth'
import { ResumeForm } from '@/components/resume/ResumeForm'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { CircularProgress } from '@/components/ui/circular-progress'
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

  return (
    <div className={`${STUDENT_PAGE_BG} p-4 md:p-6 print:bg-white print:p-0`}>
      <div className="mx-auto max-w-7xl space-y-6 print:max-w-none print:space-y-0">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Resume builder</h1>
            <p className="mt-1 text-sm text-slate-600">
              ATS-friendly one-column template · saved locally in this browser
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2">
              <CircularProgress value={score.overall} size={56} strokeWidth={6} label="Ready" />
              <div className="text-sm">
                <p className="font-semibold text-slate-900">Resume readiness</p>
                <p className="text-slate-500">{score.overall}% complete</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={handleResetSample}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Load sample
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 print:block">
          <div className="print:hidden">
            <ResumeForm data={data} onChange={setData} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-6 lg:self-start print:border-0 print:bg-white print:p-0">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 print:hidden">
              Live preview
            </p>
            <ResumePreview data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
