import { ExternalLink, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  formatJobSpySalary,
  jobSpyApplyUrl,
  jobSpySiteLabel,
  parseJobSpySkills,
  type JobSpyJob,
  type JobSpyJobId,
} from '@/lib/jobspy-api'

interface JobSpyJobDetailProps {
  job: JobSpyJob
  saved?: boolean
  applying?: boolean
  onClose: () => void
  onApply: () => void
  onSave?: (id: JobSpyJobId) => void
  onUnsave?: (id: JobSpyJobId) => void
}

export function JobSpyJobDetail({
  job,
  saved = false,
  applying = false,
  onClose,
  onApply,
  onSave,
  onUnsave,
}: JobSpyJobDetailProps) {
  const salary = formatJobSpySalary(job)
  const skills = parseJobSpySkills(job.key_skills)
  const location =
    job.location_display || [job.city, job.state].filter(Boolean).join(', ') || 'India'

  const hasApplyUrl = Boolean(jobSpyApplyUrl(job))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Job details"
      >
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">{jobSpySiteLabel(job.site)}</Badge>
              {job.is_remote && <Badge className="bg-emerald-100 text-emerald-800">Remote</Badge>}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
            <p className="text-slate-600 mt-1">{job.company_name || 'Company not listed'}</p>
            <p className="text-sm text-slate-500">{location}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {(onSave || onUnsave) && (
              <button
                type="button"
                onClick={() => (saved ? onUnsave?.(job.id) : onSave?.(job.id))}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
              >
                <Star className={`h-5 w-5 ${saved ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>
            )}
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {salary && <span><strong className="text-slate-800">Salary:</strong> {salary}</span>}
            {job.job_type && <span><strong className="text-slate-800">Type:</strong> {job.job_type}</span>}
            {job.job_level && <span><strong className="text-slate-800">Level:</strong> {job.job_level}</span>}
            {job.date_posted && (
              <span><strong className="text-slate-800">Posted:</strong> {new Date(job.date_posted).toLocaleDateString('en-IN')}</span>
            )}
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{s}</span>
              ))}
            </div>
          )}
          {job.description ? (
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{job.description}</div>
          ) : (
            <p className="text-sm text-slate-500">No description available.</p>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
          {hasApplyUrl ? (
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={applying}
              onClick={() => void onApply()}
            >
              <ExternalLink className="h-4 w-4" />
              {applying ? 'Opening…' : 'Apply on original posting'}
            </Button>
          ) : (
            <p className="text-sm text-slate-500 text-center">No external apply link available for this listing.</p>
          )}
        </div>
      </div>
    </div>
  )
}
