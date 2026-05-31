import { useMemo, useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { applyToJob, type StudentJobOpen } from '@/lib/api'
import { scoreJobsForCareer, type ScoredJob } from '@/lib/dashboard-derive'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface JobRecommendationsCardProps {
  jobs: StudentJobOpen[]
  careerTitle: string | null
  careerSkills: string[]
  loading: boolean
  onViewAll: () => void
}

function MatchBadge({ pct }: { pct: number }) {
  if (pct <= 0) return null
  const high = pct >= 90
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums',
        high ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700',
      )}
    >
      {pct}% match
    </span>
  )
}

function JobRow({
  job,
  onApply,
  applying,
}: {
  job: ScoredJob
  onApply: (id: number) => void
  applying: boolean
}) {
  return (
    <li className="flex items-start justify-between gap-2 border-b border-slate-100 py-3 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="truncate text-sm font-medium text-slate-900">{job.title}</p>
          <MatchBadge pct={job.matchPct} />
        </div>
        <p className="text-xs text-slate-500">{job.company_name}</p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 shrink-0 px-2.5 text-xs"
        disabled={applying}
        onClick={() => onApply(job.id)}
      >
        {applying ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
      </Button>
    </li>
  )
}

export function JobRecommendationsCard({
  jobs,
  careerTitle,
  careerSkills,
  loading,
  onViewAll,
}: JobRecommendationsCardProps) {
  const [applyBusyId, setApplyBusyId] = useState<number | null>(null)

  const topJobs = useMemo(
    () => scoreJobsForCareer(jobs, careerTitle, careerSkills).slice(0, 3),
    [jobs, careerTitle, careerSkills],
  )

  const handleApply = async (jobId: number) => {
    setApplyBusyId(jobId)
    try {
      const result = await applyToJob(jobId)
      toast.success(result.message || 'Applied successfully')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Apply failed')
    } finally {
      setApplyBusyId(null)
    }
  }

  return (
    <Card className={cn(DASHBOARD_CARD)}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Recommended Jobs</h2>
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            View all
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading jobs…</p>
        ) : topJobs.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">No open jobs right now.</p>
        ) : (
          <ul>
            {topJobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onApply={handleApply}
                applying={applyBusyId === job.id}
              />
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
