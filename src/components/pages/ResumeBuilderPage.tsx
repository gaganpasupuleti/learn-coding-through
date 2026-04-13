import { useCallback, useEffect, useState } from 'react'
import {
  FileText,
  Plus,
  Trash,
  Copy,
  Star,
  Pencil,
  ArrowLeft,
  Download,
  Eye,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Globe,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { getAuthToken } from '@/lib/auth'
import type {
  ResumeData,
  ResumeListItem,
  ResumeCreatePayload,
  ResumeUpdatePayload,
  ResumePersonalInfo,
  ResumeExperienceItem,
  ResumeEducationItem,
  ResumeProjectItem,
  ResumeCertificationItem,
} from '@/lib/api'
import {
  fetchResumeList,
  fetchResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  setResumeAsPrimary,
} from '@/lib/api'

type View = 'list' | 'editor' | 'preview'

const TEMPLATES = [
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Classic' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'professional', label: 'Professional' },
]

const EMPTY_PERSONAL_INFO: ResumePersonalInfo = {
  name: '', title: '', email: '', phone: '', location: '',
  website: null, linkedin: null, github: null,
}
const EMPTY_EXPERIENCE: ResumeExperienceItem = {
  job_title: '', company: '', location: '', start_date: '', end_date: '', bullets: [''],
}
const EMPTY_EDUCATION: ResumeEducationItem = {
  institution: '', degree: '', field: '', start_date: '', end_date: '', description: '',
}
const EMPTY_PROJECT: ResumeProjectItem = {
  name: '', role: '', dates: '', url: '', bullets: [''],
}
const EMPTY_CERTIFICATION: ResumeCertificationItem = {
  name: '', issuer: '', date: '', url: '',
}

/* ─────────────── Collapsible Section ─────────────── */

function Section({ title, icon, children, defaultOpen = true, count }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; count?: number
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-2 p-4 hover:bg-muted/30 transition"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 font-semibold text-sm">
          {icon}
          {title}
          {count !== undefined && <span className="text-xs text-muted-foreground font-normal">({count})</span>}
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </Card>
  )
}

/* ─────────────── Bullet List Editor ─────────────── */

function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (b: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-1.5 items-start">
          <span className="text-xs text-muted-foreground mt-2.5">•</span>
          <Input
            value={b}
            placeholder="Describe your work..."
            onChange={(e) => {
              const next = [...bullets]
              next[i] = e.target.value
              onChange(next)
            }}
            className="text-sm"
          />
          <Button variant="ghost" size="sm" className="shrink-0 h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onChange(bullets.filter((_, j) => j !== i))}
          >
            <Trash size={14} />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" className="text-xs" onClick={() => onChange([...bullets, ''])}>
        <Plus size={12} className="mr-1" /> Add bullet
      </Button>
    </div>
  )
}

/* ─────────────── Shared preview helpers ─────────────── */

function ContactLine({ pi }: { pi: ResumePersonalInfo }) {
  const items = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.website].filter(Boolean)
  if (!items.length) return null
  return <>{items.map((v, i) => <span key={i}>{v}</span>)}</>
}

function ExperienceBlock({ exp, headingCls, dateCls, locationCls }: {
  exp: ResumeExperienceItem; headingCls?: string; dateCls?: string; locationCls?: string
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <p className={headingCls ?? 'font-semibold'}>{exp.job_title}{exp.company && ` · ${exp.company}`}</p>
        <p className={dateCls ?? 'text-xs text-slate-400 shrink-0'}>{exp.start_date}{exp.end_date && ` – ${exp.end_date}`}</p>
      </div>
      {exp.location && <p className={locationCls ?? 'text-xs text-slate-500'}>{exp.location}</p>}
      {exp.bullets?.filter(Boolean).length > 0 && (
        <ul className="list-disc list-inside mt-1 space-y-0.5 text-sm">
          {exp.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
        </ul>
      )}
    </div>
  )
}

function EducationBlock({ edu, headingCls, dateCls }: {
  edu: ResumeEducationItem; headingCls?: string; dateCls?: string
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <p className={headingCls ?? 'font-semibold'}>{edu.degree}{edu.field && ` in ${edu.field}`}</p>
        <p className={dateCls ?? 'text-xs text-slate-400 shrink-0'}>{edu.start_date}{edu.end_date && ` – ${edu.end_date}`}</p>
      </div>
      <p className="text-sm text-slate-600">{edu.institution}</p>
      {edu.description && <p className="text-xs text-slate-500 mt-0.5">{edu.description}</p>}
    </div>
  )
}

function ProjectBlock({ proj, headingCls, dateCls, urlCls }: {
  proj: ResumeProjectItem; headingCls?: string; dateCls?: string; urlCls?: string
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <p className={headingCls ?? 'font-semibold'}>{proj.name}{proj.role && ` · ${proj.role}`}</p>
        {proj.dates && <p className={dateCls ?? 'text-xs text-slate-400 shrink-0'}>{proj.dates}</p>}
      </div>
      {proj.url && <p className={urlCls ?? 'text-xs text-blue-600 break-all'}>{proj.url}</p>}
      {proj.bullets?.filter(Boolean).length > 0 && (
        <ul className="list-disc list-inside mt-1 space-y-0.5 text-sm">
          {proj.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
        </ul>
      )}
    </div>
  )
}

function CertBlock({ certs }: { certs: ResumeCertificationItem[] }) {
  return (
    <div className="space-y-1">
      {certs.map((c, i) => (
        <div key={i} className="flex justify-between">
          <p className="text-sm">{c.name}{c.issuer && ` – ${c.issuer}`}</p>
          {c.date && <p className="text-xs text-slate-400">{c.date}</p>}
        </div>
      ))}
    </div>
  )
}

function AtsFooter({ score }: { score: number }) {
  if (score <= 0) return null
  return (
    <div className="text-center pt-3 border-t">
      <span className="text-xs text-slate-400">ATS Match Score: </span>
      <span className={`text-sm font-bold ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{score}%</span>
    </div>
  )
}

/* ══════════ Template: Modern (centered header, pill skills, clean) ══════════ */

function ModernTemplate({ data }: { data: ResumeData }) {
  const pi = data.personal_info || {} as ResumePersonalInfo
  return (
    <div className="bg-white text-slate-900 rounded-lg shadow-lg p-8 max-w-[800px] mx-auto space-y-5 text-sm print:shadow-none">
      <div className="text-center space-y-1 border-b pb-4">
        <h1 className="text-2xl font-bold">{pi.name || 'Your Name'}</h1>
        {pi.title && <p className="text-base text-slate-600">{pi.title}</p>}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <ContactLine pi={pi} />
        </div>
      </div>
      {data.summary && <div><h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Summary</h2><p className="text-sm leading-relaxed">{data.summary}</p></div>}
      {data.skills?.length > 0 && <div><h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Skills</h2><div className="flex flex-wrap gap-1.5">{data.skills.map((s, i) => <span key={i} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs">{s}</span>)}</div></div>}
      {data.experience?.length > 0 && <div><h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Experience</h2><div className="space-y-3">{data.experience.map((e, i) => <ExperienceBlock key={i} exp={e} />)}</div></div>}
      {data.education?.length > 0 && <div><h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Education</h2><div className="space-y-2">{data.education.map((e, i) => <EducationBlock key={i} edu={e} />)}</div></div>}
      {data.projects?.length > 0 && <div><h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Projects</h2><div className="space-y-3">{data.projects.map((p, i) => <ProjectBlock key={i} proj={p} />)}</div></div>}
      {data.certifications?.length > 0 && <div><h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Certifications</h2><CertBlock certs={data.certifications} /></div>}
      {data.languages?.length > 0 && <div><h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Languages</h2><p className="text-sm">{data.languages.join(', ')}</p></div>}
      <AtsFooter score={data.ats_score} />
    </div>
  )
}

/* ══════════ Template: Classic (serif, left-aligned, ruled sections) ══════════ */

function ClassicTemplate({ data }: { data: ResumeData }) {
  const pi = data.personal_info || {} as ResumePersonalInfo
  const SH = ({ children }: { children: string }) => (
    <h2 className="text-sm font-bold uppercase border-b-2 border-slate-800 pb-0.5 mb-2 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>{children}</h2>
  )
  return (
    <div className="bg-white text-slate-900 rounded-lg shadow-lg p-8 max-w-[800px] mx-auto space-y-4 text-sm print:shadow-none" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="space-y-0.5">
        <h1 className="text-3xl font-bold tracking-tight">{pi.name || 'Your Name'}</h1>
        {pi.title && <p className="text-base text-slate-600 italic">{pi.title}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-600 pt-1">
          <ContactLine pi={pi} />
        </div>
      </div>

      {data.summary && <div><SH>Professional Summary</SH><p className="text-sm leading-relaxed">{data.summary}</p></div>}

      {data.experience?.length > 0 && <div><SH>Work Experience</SH><div className="space-y-3">{data.experience.map((e, i) => <ExperienceBlock key={i} exp={e} headingCls="font-bold" dateCls="text-xs text-slate-500 shrink-0 italic" />)}</div></div>}

      {data.education?.length > 0 && <div><SH>Education</SH><div className="space-y-2">{data.education.map((e, i) => <EducationBlock key={i} edu={e} headingCls="font-bold" dateCls="text-xs text-slate-500 shrink-0 italic" />)}</div></div>}

      {data.skills?.length > 0 && <div><SH>Skills</SH><p className="text-sm">{data.skills.join(' • ')}</p></div>}

      {data.projects?.length > 0 && <div><SH>Projects</SH><div className="space-y-3">{data.projects.map((p, i) => <ProjectBlock key={i} proj={p} headingCls="font-bold" dateCls="text-xs text-slate-500 shrink-0 italic" />)}</div></div>}

      {data.certifications?.length > 0 && <div><SH>Certifications</SH><CertBlock certs={data.certifications} /></div>}

      {data.languages?.length > 0 && <div><SH>Languages</SH><p className="text-sm">{data.languages.join(', ')}</p></div>}

      <AtsFooter score={data.ats_score} />
    </div>
  )
}

/* ══════════ Template: Minimal (ultra-clean, no borders, tight spacing) ══════════ */

function MinimalTemplate({ data }: { data: ResumeData }) {
  const pi = data.personal_info || {} as ResumePersonalInfo
  const SH = ({ children }: { children: string }) => (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1.5">{children}</h2>
  )
  return (
    <div className="bg-white text-slate-800 rounded-lg shadow-lg px-10 py-8 max-w-[800px] mx-auto space-y-4 text-[13px] leading-snug print:shadow-none">
      <div className="mb-4">
        <h1 className="text-xl font-medium tracking-wide">{pi.name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-1">
          <ContactLine pi={pi} />
        </div>
      </div>

      {data.summary && <div><SH>About</SH><p className="text-[13px] leading-relaxed text-slate-600">{data.summary}</p></div>}

      {data.experience?.length > 0 && (
        <div>
          <SH>Experience</SH>
          <div className="space-y-2.5">
            {data.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <p className="font-medium">{exp.job_title}<span className="font-normal text-slate-500">{exp.company && `, ${exp.company}`}</span></p>
                  <p className="text-[11px] text-slate-400 shrink-0">{exp.start_date}{exp.end_date && ` – ${exp.end_date}`}</p>
                </div>
                {exp.bullets?.filter(Boolean).length > 0 && (
                  <ul className="mt-0.5 space-y-0 text-slate-600">
                    {exp.bullets.filter(Boolean).map((b, j) => <li key={j} className="before:content-['–'] before:mr-1.5 before:text-slate-400">{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education?.length > 0 && (
        <div>
          <SH>Education</SH>
          <div className="space-y-1.5">
            {data.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <p><span className="font-medium">{edu.degree}</span>{edu.field && ` · ${edu.field}`}<span className="text-slate-500"> — {edu.institution}</span></p>
                <p className="text-[11px] text-slate-400 shrink-0">{edu.end_date || edu.start_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills?.length > 0 && <div><SH>Skills</SH><p className="text-slate-600">{data.skills.join(', ')}</p></div>}

      {data.projects?.length > 0 && (
        <div>
          <SH>Projects</SH>
          <div className="space-y-2">
            {data.projects.map((proj, i) => (
              <div key={i}>
                <p className="font-medium">{proj.name}{proj.url && <span className="font-normal text-slate-400 text-[11px] ml-2">{proj.url}</span>}</p>
                {proj.bullets?.filter(Boolean).length > 0 && (
                  <ul className="mt-0.5 space-y-0 text-slate-600">
                    {proj.bullets.filter(Boolean).map((b, j) => <li key={j} className="before:content-['–'] before:mr-1.5 before:text-slate-400">{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.certifications?.length > 0 && <div><SH>Certifications</SH><CertBlock certs={data.certifications} /></div>}
      {data.languages?.length > 0 && <div><SH>Languages</SH><p className="text-slate-600">{data.languages.join(', ')}</p></div>}
      <AtsFooter score={data.ats_score} />
    </div>
  )
}

/* ══════════ Template: Professional (two-column, sidebar, accent colour) ══════════ */

function ProfessionalTemplate({ data }: { data: ResumeData }) {
  const pi = data.personal_info || {} as ResumePersonalInfo
  const SH = ({ children }: { children: string }) => (
    <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1.5">{children}</h2>
  )
  const SHLight = ({ children }: { children: string }) => (
    <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1.5">{children}</h2>
  )

  return (
    <div className="bg-white text-slate-900 rounded-lg shadow-lg max-w-[800px] mx-auto text-sm print:shadow-none overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-[240px] shrink-0 bg-indigo-900 text-white p-6 space-y-5">
        <div>
          <h1 className="text-lg font-bold leading-tight">{pi.name || 'Your Name'}</h1>
          {pi.title && <p className="text-indigo-300 text-xs mt-1">{pi.title}</p>}
        </div>

        <div className="space-y-1 text-xs text-indigo-200">
          {pi.email && <p>{pi.email}</p>}
          {pi.phone && <p>{pi.phone}</p>}
          {pi.location && <p>{pi.location}</p>}
          {pi.linkedin && <p>{pi.linkedin}</p>}
          {pi.github && <p>{pi.github}</p>}
          {pi.website && <p>{pi.website}</p>}
        </div>

        {data.skills?.length > 0 && (
          <div>
            <SHLight>Skills</SHLight>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => <span key={i} className="rounded bg-indigo-800 px-2 py-0.5 text-[11px]">{s}</span>)}
            </div>
          </div>
        )}

        {data.languages?.length > 0 && (
          <div>
            <SHLight>Languages</SHLight>
            <p className="text-xs text-indigo-200">{data.languages.join(', ')}</p>
          </div>
        )}

        {data.certifications?.length > 0 && (
          <div>
            <SHLight>Certifications</SHLight>
            <div className="space-y-1.5 text-xs text-indigo-200">
              {data.certifications.map((c, i) => <p key={i}>{c.name}{c.issuer && <span className="text-indigo-400"> – {c.issuer}</span>}</p>)}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 space-y-4">
        {data.summary && <div><SH>Profile</SH><p className="text-sm leading-relaxed text-slate-600">{data.summary}</p></div>}

        {data.experience?.length > 0 && (
          <div>
            <SH>Experience</SH>
            <div className="space-y-3">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold">{exp.job_title}{exp.company && <span className="font-normal text-slate-500"> at {exp.company}</span>}</p>
                    <p className="text-xs text-slate-400 shrink-0">{exp.start_date}{exp.end_date && ` – ${exp.end_date}`}</p>
                  </div>
                  {exp.location && <p className="text-xs text-slate-400">{exp.location}</p>}
                  {exp.bullets?.filter(Boolean).length > 0 && (
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-sm text-slate-600">
                      {exp.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education?.length > 0 && (
          <div>
            <SH>Education</SH>
            <div className="space-y-2">
              {data.education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold">{edu.degree}{edu.field && ` in ${edu.field}`}</p>
                    <p className="text-xs text-slate-400 shrink-0">{edu.start_date}{edu.end_date && ` – ${edu.end_date}`}</p>
                  </div>
                  <p className="text-sm text-slate-500">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects?.length > 0 && (
          <div>
            <SH>Projects</SH>
            <div className="space-y-3">{data.projects.map((p, i) => <ProjectBlock key={i} proj={p} headingCls="font-semibold" dateCls="text-xs text-slate-400 shrink-0" urlCls="text-xs text-indigo-600 break-all" />)}</div>
          </div>
        )}

        <AtsFooter score={data.ats_score} />
      </div>
    </div>
  )
}

/* ─────────────── Resume Preview Router ─────────────── */

function ResumePreview({ data }: { data: ResumeData }) {
  switch (data.template) {
    case 'classic': return <ClassicTemplate data={data} />
    case 'minimal': return <MinimalTemplate data={data} />
    case 'professional': return <ProfessionalTemplate data={data} />
    default: return <ModernTemplate data={data} />
  }
}

/* ═══════════════ Main Component ═══════════════ */

export function ResumeBuilderPage() {
  const [view, setView] = useState<View>('list')
  const [resumes, setResumes] = useState<ResumeListItem[]>([])
  const [activeResume, setActiveResume] = useState<ResumeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const token = getAuthToken() ?? ''

  // ── Load list ──
  const loadResumes = useCallback(async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const list = await fetchResumeList(token)
      setResumes(list)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load resumes')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => { loadResumes() }, [loadResumes])

  // ── Open resume ──
  const openResume = async (id: number) => {
    try {
      setIsLoading(true)
      const data = await fetchResume(token, id)
      setActiveResume(data)
      setDirty(false)
      setView('editor')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load resume')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Create new ──
  const handleCreate = async () => {
    try {
      setIsLoading(true)
      const data = await createResume(token, { title: 'New Resume', template: 'modern' })
      setActiveResume(data)
      setDirty(false)
      setView('editor')
      await loadResumes()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create resume')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Save ──
  const handleSave = async () => {
    if (!activeResume) return
    try {
      setIsSaving(true)
      const payload: ResumeUpdatePayload = {
        title: activeResume.title,
        template: activeResume.template,
        personal_info: activeResume.personal_info,
        summary: activeResume.summary,
        skills: activeResume.skills,
        experience: activeResume.experience,
        education: activeResume.education,
        projects: activeResume.projects,
        certifications: activeResume.certifications,
        languages: activeResume.languages,
      }
      const updated = await updateResume(token, activeResume.id, payload)
      setActiveResume(updated)
      setDirty(false)
      toast.success('Resume saved')
      await loadResumes()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Delete ──
  const handleDelete = async (id: number) => {
    try {
      await deleteResume(token, id)
      toast.success('Resume deleted')
      if (activeResume?.id === id) { setActiveResume(null); setView('list') }
      await loadResumes()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  // ── Duplicate ──
  const handleDuplicate = async (id: number) => {
    try {
      await duplicateResume(token, id)
      toast.success('Resume duplicated')
      await loadResumes()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate')
    }
  }

  // ── Set primary ──
  const handleSetPrimary = async (id: number) => {
    try {
      await setResumeAsPrimary(token, id)
      toast.success('Primary resume updated')
      await loadResumes()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set primary')
    }
  }

  // ── Update field helpers ──
  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    if (!activeResume) return
    setActiveResume({ ...activeResume, [key]: value })
    setDirty(true)
  }

  function updatePersonalInfo(field: keyof ResumePersonalInfo, value: string) {
    if (!activeResume) return
    update('personal_info', { ...activeResume.personal_info, [field]: value })
  }

  function updateExperience(index: number, patch: Partial<ResumeExperienceItem>) {
    if (!activeResume) return
    const next = [...activeResume.experience]
    next[index] = { ...next[index], ...patch }
    update('experience', next)
  }

  function updateEducation(index: number, patch: Partial<ResumeEducationItem>) {
    if (!activeResume) return
    const next = [...activeResume.education]
    next[index] = { ...next[index], ...patch }
    update('education', next)
  }

  function updateProject(index: number, patch: Partial<ResumeProjectItem>) {
    if (!activeResume) return
    const next = [...activeResume.projects]
    next[index] = { ...next[index], ...patch }
    update('projects', next)
  }

  function updateCertification(index: number, patch: Partial<ResumeCertificationItem>) {
    if (!activeResume) return
    const next = [...activeResume.certifications]
    next[index] = { ...next[index], ...patch }
    update('certifications', next)
  }

  // ── Print / Download ──
  const handlePrint = () => {
    window.print()
  }

  // ═══════════════════ RENDER ═══════════════════

  // ── List View ──
  if (view === 'list') {
    return (
      <div className="min-h-screen p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><FileText size={24} /> Resume Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">Create, edit, and manage your resumes</p>
          </div>
          <Button onClick={handleCreate} disabled={isLoading}>
            <Plus size={16} className="mr-1" /> New Resume
          </Button>
        </div>

        {isLoading && resumes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : resumes.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <FileText size={40} className="mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No resumes yet</h3>
            <p className="text-sm text-muted-foreground">Create your first resume to get started</p>
            <Button onClick={handleCreate}><Plus size={16} className="mr-1" /> Create Resume</Button>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => (
              <Card key={r.id} className="p-4 space-y-3 hover:border-primary/40 transition cursor-pointer" onClick={() => openResume(r.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate flex items-center gap-1.5">
                      {r.is_primary && <Star size={14} className="text-amber-500 fill-amber-500 shrink-0" />}
                      {r.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.template} template</p>
                  </div>
                  {r.ats_score > 0 && (
                    <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${r.ats_score >= 70 ? 'bg-green-100 text-green-700' : r.ats_score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                      {r.ats_score}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Updated {new Date(r.updated_at).toLocaleDateString()}</p>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleSetPrimary(r.id) }} title="Set as primary">
                    <Star size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDuplicate(r.id) }} title="Duplicate">
                    <Copy size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }} title="Delete">
                    <Trash size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Preview View ──
  if (view === 'preview' && activeResume) {
    return (
      <div className="min-h-screen p-6 space-y-4">
        <div className="flex items-center gap-3 max-w-[800px] mx-auto print:hidden flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => setView('editor')}>
            <ArrowLeft size={16} className="mr-1" /> Back to Editor
          </Button>
          <div className="flex gap-1 rounded-lg border p-0.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => update('template', t.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${activeResume.template === t.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Download size={14} className="mr-1" /> Print / Save PDF
          </Button>
        </div>
        <ResumePreview data={activeResume} />
      </div>
    )
  }

  // ── Editor View ──
  if (!activeResume) return null
  const pi = activeResume.personal_info || EMPTY_PERSONAL_INFO

  return (
    <div className="min-h-screen print:hidden">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background border-b px-4 py-2 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => { setView('list') }}>
          <ArrowLeft size={16} className="mr-1" /> All Resumes
        </Button>
        <Input
          value={activeResume.title}
          onChange={(e) => update('title', e.target.value)}
          className="max-w-[280px] text-sm font-semibold"
        />
        <select
          value={activeResume.template}
          onChange={(e) => update('template', e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => setView('preview')}>
          <Eye size={14} className="mr-1" /> Preview
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving || !dirty}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Editor body */}
      <div className="p-4 max-w-3xl mx-auto space-y-4 pb-20">

        {/* Personal Info */}
        <Section title="Personal Information" icon={<User size={16} />}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <Input value={pi.name} onChange={(e) => updatePersonalInfo('name', e.target.value)} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground">Professional Title</label>
              <Input value={pi.title} onChange={(e) => updatePersonalInfo('title', e.target.value)} placeholder="e.g. Full Stack Developer" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input type="email" value={pi.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <Input value={pi.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <Input value={pi.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} placeholder="City, Country" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Website</label>
              <Input value={pi.website ?? ''} onChange={(e) => updatePersonalInfo('website', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">LinkedIn</label>
              <Input value={pi.linkedin ?? ''} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} placeholder="linkedin.com/in/..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">GitHub</label>
              <Input value={pi.github ?? ''} onChange={(e) => updatePersonalInfo('github', e.target.value)} placeholder="github.com/..." />
            </div>
          </div>
        </Section>

        {/* Summary */}
        <Section title="Professional Summary" icon={<FileText size={16} />}>
          <textarea
            rows={4}
            value={activeResume.summary}
            onChange={(e) => update('summary', e.target.value)}
            placeholder="Write 2–3 sentences about your professional background and career goals…"
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-y"
          />
        </Section>

        {/* Skills */}
        <Section title="Skills" icon={<Code2 size={16} />} count={activeResume.skills.length}>
          <div className="flex flex-wrap gap-2">
            {activeResume.skills.map((skill, i) => (
              <div key={i} className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm bg-background">
                <Input
                  value={skill}
                  onChange={(e) => {
                    const next = [...activeResume.skills]
                    next[i] = e.target.value
                    update('skills', next)
                  }}
                  className="border-0 p-0 h-5 w-[120px] text-sm focus-visible:ring-0"
                />
                <button onClick={() => update('skills', activeResume.skills.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => update('skills', [...activeResume.skills, ''])}>
            <Plus size={12} className="mr-1" /> Add skill
          </Button>
        </Section>

        {/* Experience */}
        <Section title="Work Experience" icon={<Briefcase size={16} />} count={activeResume.experience.length}>
          {activeResume.experience.map((exp, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">Experience #{i + 1}</p>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"
                  onClick={() => update('experience', activeResume.experience.filter((_, j) => j !== i))}>
                  <Trash size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground">Job Title</label><Input value={exp.job_title} onChange={(e) => updateExperience(i, { job_title: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Company</label><Input value={exp.company} onChange={(e) => updateExperience(i, { company: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Location</label><Input value={exp.location} onChange={(e) => updateExperience(i, { location: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-muted-foreground">Start</label><Input value={exp.start_date} onChange={(e) => updateExperience(i, { start_date: e.target.value })} placeholder="Jan 2022" /></div>
                  <div><label className="text-xs text-muted-foreground">End</label><Input value={exp.end_date} onChange={(e) => updateExperience(i, { end_date: e.target.value })} placeholder="Present" /></div>
                </div>
              </div>
              <BulletEditor bullets={exp.bullets || []} onChange={(b) => updateExperience(i, { bullets: b })} />
            </Card>
          ))}
          <Button variant="outline" size="sm" onClick={() => update('experience', [...activeResume.experience, { ...EMPTY_EXPERIENCE }])}>
            <Plus size={14} className="mr-1" /> Add Experience
          </Button>
        </Section>

        {/* Education */}
        <Section title="Education" icon={<GraduationCap size={16} />} count={activeResume.education.length}>
          {activeResume.education.map((edu, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">Education #{i + 1}</p>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"
                  onClick={() => update('education', activeResume.education.filter((_, j) => j !== i))}>
                  <Trash size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground">Institution</label><Input value={edu.institution} onChange={(e) => updateEducation(i, { institution: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Degree</label><Input value={edu.degree} onChange={(e) => updateEducation(i, { degree: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Field of Study</label><Input value={edu.field} onChange={(e) => updateEducation(i, { field: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-muted-foreground">Start</label><Input value={edu.start_date} onChange={(e) => updateEducation(i, { start_date: e.target.value })} placeholder="2018" /></div>
                  <div><label className="text-xs text-muted-foreground">End</label><Input value={edu.end_date} onChange={(e) => updateEducation(i, { end_date: e.target.value })} placeholder="2022" /></div>
                </div>
              </div>
              <div><label className="text-xs text-muted-foreground">Description</label>
                <Input value={edu.description} onChange={(e) => updateEducation(i, { description: e.target.value })} placeholder="GPA, honors, relevant coursework…" />
              </div>
            </Card>
          ))}
          <Button variant="outline" size="sm" onClick={() => update('education', [...activeResume.education, { ...EMPTY_EDUCATION }])}>
            <Plus size={14} className="mr-1" /> Add Education
          </Button>
        </Section>

        {/* Projects */}
        <Section title="Projects" icon={<Code2 size={16} />} count={activeResume.projects.length} defaultOpen={false}>
          {activeResume.projects.map((proj, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">Project #{i + 1}</p>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"
                  onClick={() => update('projects', activeResume.projects.filter((_, j) => j !== i))}>
                  <Trash size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground">Name</label><Input value={proj.name} onChange={(e) => updateProject(i, { name: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Role</label><Input value={proj.role} onChange={(e) => updateProject(i, { role: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Dates</label><Input value={proj.dates} onChange={(e) => updateProject(i, { dates: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">URL</label><Input value={proj.url} onChange={(e) => updateProject(i, { url: e.target.value })} /></div>
              </div>
              <BulletEditor bullets={proj.bullets || []} onChange={(b) => updateProject(i, { bullets: b })} />
            </Card>
          ))}
          <Button variant="outline" size="sm" onClick={() => update('projects', [...activeResume.projects, { ...EMPTY_PROJECT }])}>
            <Plus size={14} className="mr-1" /> Add Project
          </Button>
        </Section>

        {/* Certifications */}
        <Section title="Certifications" icon={<Award size={16} />} count={activeResume.certifications.length} defaultOpen={false}>
          {activeResume.certifications.map((cert, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">Certification #{i + 1}</p>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"
                  onClick={() => update('certifications', activeResume.certifications.filter((_, j) => j !== i))}>
                  <Trash size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground">Name</label><Input value={cert.name} onChange={(e) => updateCertification(i, { name: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Issuer</label><Input value={cert.issuer} onChange={(e) => updateCertification(i, { issuer: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Date</label><Input value={cert.date} onChange={(e) => updateCertification(i, { date: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">URL</label><Input value={cert.url} onChange={(e) => updateCertification(i, { url: e.target.value })} /></div>
              </div>
            </Card>
          ))}
          <Button variant="outline" size="sm" onClick={() => update('certifications', [...activeResume.certifications, { ...EMPTY_CERTIFICATION }])}>
            <Plus size={14} className="mr-1" /> Add Certification
          </Button>
        </Section>

        {/* Languages */}
        <Section title="Languages" icon={<Globe size={16} />} count={activeResume.languages.length} defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {activeResume.languages.map((lang, i) => (
              <div key={i} className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm bg-background">
                <Input
                  value={lang}
                  onChange={(e) => {
                    const next = [...activeResume.languages]
                    next[i] = e.target.value
                    update('languages', next)
                  }}
                  className="border-0 p-0 h-5 w-[100px] text-sm focus-visible:ring-0"
                />
                <button onClick={() => update('languages', activeResume.languages.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => update('languages', [...activeResume.languages, ''])}>
            <Plus size={12} className="mr-1" /> Add language
          </Button>
        </Section>
      </div>
    </div>
  )
}
