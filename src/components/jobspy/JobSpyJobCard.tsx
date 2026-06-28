import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatJobSpySalary,
  jobSpySiteLabel,
  parseJobSpySkills,
  type JobSpyJob,
  type JobSpyJobId,
} from '@/lib/jobspy-api'
import { cn } from '@/lib/utils'

interface JobSpyJobCardProps {
  job: JobSpyJob
  saved?: boolean
  onSelect: (id: JobSpyJobId) => void
  onSave?: (id: JobSpyJobId) => void
  onUnsave?: (id: JobSpyJobId) => void
}

export function JobSpyJobCard({ job, saved = false, onSelect, onSave, onUnsave }: JobSpyJobCardProps) {
  const salary = formatJobSpySalary(job)
  const skills = parseJobSpySkills(job.key_skills).slice(0, 4)
  const location =
    job.location_display || [job.city, job.state].filter(Boolean).join(', ') || 'India'

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (saved) onUnsave?.(job.id)
    else onSave?.(job.id)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(job.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(job.id)
        }
      }}
      className={cn(
        'w-full text-left rounded-xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer',
        'hover:border-blue-300 hover:shadow-md transition-all duration-200',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Badge variant="secondary" className="text-xs">{jobSpySiteLabel(job.site)}</Badge>
          {job.is_remote && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Remote</Badge>}
          {job.tag_status && job.tag_status !== 'complete' && (
            <Badge variant="outline" className="text-amber-700 border-amber-200">
              {job.needs_review ? 'Review' : job.tag_status}
            </Badge>
          )}
        </div>
        {(onSave || onUnsave) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('shrink-0 h-8 w-8', saved && 'text-amber-500 hover:text-amber-600')}
            onClick={toggleSave}
            aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
          >
            <Star className={cn('h-4 w-4', saved && 'fill-current')} />
          </Button>
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-900 line-clamp-2">{job.title}</h3>
      <p className="text-sm text-slate-600 mt-1">{job.company_name || 'Company not listed'}</p>
      <p className="text-xs text-slate-500 mt-1">{location}</p>
      {job.description && (
        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{job.description.replace(/\s+/g, ' ').slice(0, 180)}</p>
      )}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.map((skill) => (
            <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{skill}</span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-500">
        {salary && <span className="font-medium text-slate-700">{salary}</span>}
        {job.job_type && <span>{job.job_type}</span>}
        {job.date_posted && (
          <span>{new Date(job.date_posted).toLocaleDateString('en-IN')}</span>
        )}
      </div>
    </div>
  )
}
