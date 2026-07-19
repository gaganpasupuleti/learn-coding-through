import { ArrowRight, FileText, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { LocalConnectorPanel } from '@/components/resume-lab/LocalConnectorPanel'
import { StudentPageFrame } from '@/components/student-layout/StudentPageFrame'
import { STUDENT_PAGE_BG } from '@/components/student-dashboard/dashboard-styles'
import { cn } from '@/lib/utils'

type Props = {
  onOpenBuilder: () => void
}

export function ResumeLabPage({ onOpenBuilder }: Props) {
  return (
    <div className={cn(STUDENT_PAGE_BG, 'w-full')}>
      <StudentPageFrame>
        <header className="mb-6 space-y-2 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[clamp(1.35rem,2.5vw,1.875rem)] font-bold tracking-tight text-slate-900">
              Code Quest Resume Lab
            </h1>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              Local AI ready
            </Badge>
          </div>
          <p className="max-w-2xl text-[clamp(0.875rem,1.5vw,1rem)] text-slate-600">
            Pair your Local Connector here (proves Ollama is ready), then open Resume Matcher to upload,
            tailor to a job description, and export.
          </p>
        </header>

        <div className="mb-6">
          <LocalConnectorPanel />
        </div>

        <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <FileText className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Resume builder</h2>
              <p className="max-w-md text-sm text-slate-600">
                Opens Resume Matcher in a dedicated workspace: upload PDF/DOCX, match a job description,
                tailor with your local Ollama model, and export.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
                  Edit sections, templates, and export PDF
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
                  JD tailor and cover letter via local Ollama
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onOpenBuilder}
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:w-auto"
            >
              Open resume builder
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </section>
      </StudentPageFrame>
    </div>
  )
}
