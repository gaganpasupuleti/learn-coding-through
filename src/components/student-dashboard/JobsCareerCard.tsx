import { ArrowRight, Briefcase } from 'lucide-react'

import { Card } from '@/components/ui/card'
import type { CareerJourneySummary } from '@/lib/career-local-summary'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface JobsCareerCardProps {
  careerJourney: CareerJourneySummary | null
  onOpenJobs: () => void
}

export function JobsCareerCard({ careerJourney, onOpenJobs }: JobsCareerCardProps) {
  const skills = careerJourney?.skills?.slice(0, 4) ?? []

  return (
    <Card className={cn(DASHBOARD_CARD)}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100">
            <Briefcase className="h-5 w-5 text-teal-700" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Jobs &amp; Career</h2>
            <p className="text-xs text-slate-500">Matched to your roadmap</p>
          </div>
        </div>

        {skills.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-sm text-slate-500">
            Pick a career path to see roles matched to your skills.
          </p>
        )}

        <button
          type="button"
          onClick={onOpenJobs}
          className="inline-flex w-full items-center justify-between rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          Browse job openings
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </Card>
  )
}
