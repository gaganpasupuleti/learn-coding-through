import { Badge } from '@/components/ui/badge'
import { formatJobSpySalary, jobSpySiteLabel, parseJobSpySkills, type JobSpyJob } from '@/lib/jobspy-api'
import { cn } from '@/lib/utils'

interface JobSpyJobCardProps {
  job: JobSpyJob
  onSelect: (id: number) => void
}

export function JobSpyJobCard({ job, onSelect }: JobSpyJobCardProps) {
  const salary = formatJobSpySalary(job)
  const skills = parseJobSpySkills(job.key_skills).slice(0, 4)
  const location =
    job.location_display || [job.city, job.state].filter(Boolean).join(', ') || 'India'

  return (
    <button
      type="button"
      onClick={() => onSelect(job.id)}
      className={cn(
        'w-full text-left rounded-xl border border-slate-200 bg-white p-5 shadow-sm',
        'hover:border-blue-300 hover:shadow-md transition-all duration-200',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="secondary" className="text-xs">{jobSpySiteLabel(job.site)}</Badge>
        {job.is_remote && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Remote</Badge>}
        {job.tag_status && job.tag_status !== 'complete' && (
          <Badge variant="outline" className="text-amber-700 border-amber-200">
            {job.needs_review ? 'Review' : job.tag_status}
          </Badge>
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-900 line-clamp-2">{job.title}</h3>
      <p className="text-sm text-slate-600 mt-1">{job.company_name || 'Company not listed'}</p>
      <p className="text-xs text-slate-500 mt-1">{location}</p>
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
    </button>
  )
}
