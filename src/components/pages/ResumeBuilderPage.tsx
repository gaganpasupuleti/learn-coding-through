import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Briefcase,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  createResume,
  updateResume,
  fetchResumeList,
  fetchResume,
  deleteResume,
  type ResumeData,
  type ResumeCreatePayload,
  type ResumeExperienceItem,
  type ResumeEducationItem,
  type ResumeProjectItem,
} from '@/lib/api'

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Template = 'modern' | 'classic' | 'minimal'

interface ResumeFormState {
  title: string
  template: Template
  full_name: string
  email: string
  phone: string
  location: string
  website: string
  summary: string
  skills: string[]
  experience: ResumeExperienceItem[]
  education: ResumeEducationItem[]
  projects: ResumeProjectItem[]
  certifications: string[]
}

const EMPTY_EXPERIENCE: ResumeExperienceItem = { title: '', company: '', location: '', start_date: '', end_date: '', description: '' }
const EMPTY_EDUCATION: ResumeEducationItem = { degree: '', school: '', location: '', start_date: '', end_date: '', description: '' }
const EMPTY_PROJECT: ResumeProjectItem = { name: '', description: '', technologies: '', url: '' }

function blankForm(): ResumeFormState {
  return {
    title: 'Untitled Resume',
    template: 'modern',
    full_name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: '',
    skills: [],
    experience: [{ ...EMPTY_EXPERIENCE }],
    education: [{ ...EMPTY_EDUCATION }],
    projects: [],
    certifications: [],
  }
}

function resumeToForm(r: ResumeData): ResumeFormState {
  return {
    title: r.title ?? 'Untitled Resume',
    template: (r.template as Template) ?? 'modern',
    full_name: r.full_name ?? '',
    email: r.email ?? '',
    phone: r.phone ?? '',
    location: r.location ?? '',
    website: r.website ?? '',
    summary: r.summary ?? '',
    skills: r.skills ?? [],
    experience: r.experience?.length ? r.experience : [{ ...EMPTY_EXPERIENCE }],
    education: r.education?.length ? r.education : [{ ...EMPTY_EDUCATION }],
    projects: r.projects ?? [],
    certifications: r.certifications ?? [],
  }
}

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ResumeBuilderPageProps {
  onBack: () => void
}

export function ResumeBuilderPage({ onBack }: ResumeBuilderPageProps) {
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [activeResumeId, setActiveResumeId] = useState<number | null>(null)
  const [form, setForm] = useState<ResumeFormState>(blankForm())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [skillInput, setSkillInput] = useState('')
  const [certInput, setCertInput] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  // Load resumes on mount
  useEffect(() => {
    fetchResumeList()
      .then((list) => {
        setResumes(list)
        if (list.length > 0) {
          setActiveResumeId(list[0].id)
          setForm(resumeToForm(list[0]))
        }
      })
      .catch(() => toast.error('Failed to load resumes'))
      .finally(() => setLoading(false))
  }, [])

  const loadResume = useCallback(async (id: number) => {
    try {
      const data = await fetchResume(id)
      setActiveResumeId(data.id)
      setForm(resumeToForm(data))
    } catch {
      toast.error('Failed to load resume')
    }
  }, [])

  const handleNew = useCallback(async () => {
    setSaving(true)
    try {
      const created = await createResume({ full_name: 'Your Name', title: 'Untitled Resume' })
      setResumes((prev) => [created, ...prev])
      setActiveResumeId(created.id)
      setForm(resumeToForm(created))
      toast.success('New resume created')
    } catch {
      toast.error('Failed to create resume')
    } finally {
      setSaving(false)
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!activeResumeId) {
      // Create new
      setSaving(true)
      try {
        const payload: ResumeCreatePayload = { ...form }
        const created = await createResume(payload)
        setResumes((prev) => [created, ...prev])
        setActiveResumeId(created.id)
        toast.success('Resume saved')
      } catch {
        toast.error('Failed to save resume')
      } finally {
        setSaving(false)
      }
      return
    }

    setSaving(true)
    try {
      const updated = await updateResume(activeResumeId, { ...form })
      setResumes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      toast.success('Resume saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [activeResumeId, form])

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteResume(id)
      setResumes((prev) => prev.filter((r) => r.id !== id))
      if (activeResumeId === id) {
        setActiveResumeId(null)
        setForm(blankForm())
      }
      toast.success('Resume deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }, [activeResumeId])

  const handlePrint = useCallback(() => {
    if (!previewRef.current) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>${form.title}</title>
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 26px; margin-bottom: 4px; } h2 { font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; margin: 18px 0 10px; }
        h3 { font-size: 14px; font-weight: 600; } p, li { font-size: 13px; line-height: 1.5; }
        ul { padding-left: 18px; } .contact { font-size: 13px; color: #475569; }
        .entry { margin-bottom: 12px; } .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .date { font-size: 12px; color: #64748b; } .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { background: #eff6ff; color: #1d4ed8; padding: 2px 10px; border-radius: 4px; font-size: 12px; }
        @media print { body { padding: 0; } }
      </style></head><body>
    `)
    printWindow.document.write(previewRef.current.innerHTML)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }, [form.title])

  // â”€â”€ Field updaters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const updateField = <K extends keyof ResumeFormState>(key: K, value: ResumeFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) {
      updateField('skills', [...form.skills, s])
    }
    setSkillInput('')
  }

  const removeSkill = (idx: number) => {
    updateField('skills', form.skills.filter((_, i) => i !== idx))
  }

  const addCert = () => {
    const c = certInput.trim()
    if (c && !form.certifications.includes(c)) {
      updateField('certifications', [...form.certifications, c])
    }
    setCertInput('')
  }

  const removeCert = (idx: number) => {
    updateField('certifications', form.certifications.filter((_, i) => i !== idx))
  }

  const updateExperience = (idx: number, field: keyof ResumeExperienceItem, value: string) => {
    const updated = form.experience.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    updateField('experience', updated)
  }

  const addExperience = () => updateField('experience', [...form.experience, { ...EMPTY_EXPERIENCE }])
  const removeExperience = (idx: number) => updateField('experience', form.experience.filter((_, i) => i !== idx))

  const updateEducation = (idx: number, field: keyof ResumeEducationItem, value: string) => {
    const updated = form.education.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    updateField('education', updated)
  }

  const addEducation = () => updateField('education', [...form.education, { ...EMPTY_EDUCATION }])
  const removeEducation = (idx: number) => updateField('education', form.education.filter((_, i) => i !== idx))

  const updateProject = (idx: number, field: keyof ResumeProjectItem, value: string) => {
    const updated = form.projects.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    updateField('projects', updated)
  }

  const addProject = () => updateField('projects', [...form.projects, { ...EMPTY_PROJECT }])
  const removeProject = (idx: number) => updateField('projects', form.projects.filter((_, i) => i !== idx))

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
        <div className="flex-1 flex items-center gap-2">
          <FileText size={18} className="text-blue-600" />
          <Input
            className="max-w-[260px] h-8 text-sm font-medium"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs"
            value={form.template}
            onChange={(e) => updateField('template', e.target.value as Template)}
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
          </select>
          <Button size="sm" variant="outline" onClick={handlePrint} title="Download PDF">
            <Download size={14} className="mr-1" /> PDF
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar â€“ resume list */}
        <div className="w-56 shrink-0 border-r border-slate-200 bg-white p-3 hidden lg:block overflow-y-auto max-h-[calc(100vh-56px)]">
          <Button size="sm" variant="outline" className="w-full mb-3" onClick={handleNew} disabled={saving}>
            <Plus size={14} className="mr-1" /> New Resume
          </Button>
          <div className="space-y-1">
            {resumes.map((r) => (
              <div
                key={r.id}
                className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-slate-100 ${
                  r.id === activeResumeId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                }`}
                onClick={() => loadResume(r.id)}
              >
                <span className="truncate">{r.title || 'Untitled'}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-0.5"
                  onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main content â€“ editor + preview */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Editor panel */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-56px)] p-4 space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="personal" className="text-xs"><User size={12} className="mr-1" /> Personal</TabsTrigger>
                <TabsTrigger value="experience" className="text-xs"><Briefcase size={12} className="mr-1" /> Work</TabsTrigger>
                <TabsTrigger value="education" className="text-xs"><GraduationCap size={12} className="mr-1" /> Education</TabsTrigger>
                <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
                <TabsTrigger value="projects" className="text-xs">Projects</TabsTrigger>
              </TabsList>

              {/* Personal Info */}
              <TabsContent value="personal" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Full Name</Label>
                    <Input value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Location</Label>
                    <Input value={form.location} onChange={(e) => updateField('location', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Website / Portfolio</Label>
                    <Input value={form.website} onChange={(e) => updateField('website', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Professional Summary</Label>
                  <Textarea
                    rows={4}
                    value={form.summary}
                    onChange={(e) => updateField('summary', e.target.value)}
                    placeholder="A brief professional summary..."
                  />
                </div>
              </TabsContent>

              {/* Experience */}
              <TabsContent value="experience" className="space-y-4 pt-4">
                {form.experience.map((exp, idx) => (
                  <div key={idx} className="relative border border-slate-200 rounded-lg p-4 space-y-3">
                    {form.experience.length > 1 && (
                      <button className="absolute top-2 right-2 text-red-400 hover:text-red-600" onClick={() => removeExperience(idx)}>
                        <X size={14} />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Job Title</Label>
                        <Input value={exp.title} onChange={(e) => updateExperience(idx, 'title', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Company</Label>
                        <Input value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Location</Label>
                        <Input value={exp.location} onChange={(e) => updateExperience(idx, 'location', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Start</Label>
                          <Input value={exp.start_date} onChange={(e) => updateExperience(idx, 'start_date', e.target.value)} placeholder="Jan 2024" />
                        </div>
                        <div>
                          <Label className="text-xs">End</Label>
                          <Input value={exp.end_date} onChange={(e) => updateExperience(idx, 'end_date', e.target.value)} placeholder="Present" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea rows={3} value={exp.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} placeholder="Key responsibilities and achievements..." />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addExperience}>
                  <Plus size={14} className="mr-1" /> Add Experience
                </Button>
              </TabsContent>

              {/* Education */}
              <TabsContent value="education" className="space-y-4 pt-4">
                {form.education.map((edu, idx) => (
                  <div key={idx} className="relative border border-slate-200 rounded-lg p-4 space-y-3">
                    {form.education.length > 1 && (
                      <button className="absolute top-2 right-2 text-red-400 hover:text-red-600" onClick={() => removeEducation(idx)}>
                        <X size={14} />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Degree</Label>
                        <Input value={edu.degree} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">School</Label>
                        <Input value={edu.school} onChange={(e) => updateEducation(idx, 'school', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Location</Label>
                        <Input value={edu.location} onChange={(e) => updateEducation(idx, 'location', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Start</Label>
                          <Input value={edu.start_date} onChange={(e) => updateEducation(idx, 'start_date', e.target.value)} placeholder="2020" />
                        </div>
                        <div>
                          <Label className="text-xs">End</Label>
                          <Input value={edu.end_date} onChange={(e) => updateEducation(idx, 'end_date', e.target.value)} placeholder="2024" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea rows={2} value={edu.description} onChange={(e) => updateEducation(idx, 'description', e.target.value)} />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addEducation}>
                  <Plus size={14} className="mr-1" /> Add Education
                </Button>
              </TabsContent>

              {/* Skills & Certifications */}
              <TabsContent value="skills" className="space-y-6 pt-4">
                <div>
                  <Label className="text-xs mb-2 block">Skills</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Type a skill and press Enter"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={addSkill}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium">
                        {skill}
                        <button onClick={() => removeSkill(idx)} className="hover:text-red-600"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Certifications</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
                      placeholder="Type a certification and press Enter"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={addCert}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.certifications.map((cert, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-3 py-1 text-xs font-medium">
                        {cert}
                        <button onClick={() => removeCert(idx)} className="hover:text-red-600"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Projects */}
              <TabsContent value="projects" className="space-y-4 pt-4">
                {form.projects.map((proj, idx) => (
                  <div key={idx} className="relative border border-slate-200 rounded-lg p-4 space-y-3">
                    <button className="absolute top-2 right-2 text-red-400 hover:text-red-600" onClick={() => removeProject(idx)}>
                      <X size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Project Name</Label>
                        <Input value={proj.name} onChange={(e) => updateProject(idx, 'name', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Technologies</Label>
                        <Input value={proj.technologies} onChange={(e) => updateProject(idx, 'technologies', e.target.value)} placeholder="React, Node.js..." />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea rows={2} value={proj.description} onChange={(e) => updateProject(idx, 'description', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">URL</Label>
                      <Input value={proj.url} onChange={(e) => updateProject(idx, 'url', e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addProject}>
                  <Plus size={14} className="mr-1" /> Add Project
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview panel */}
          <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 border-l border-slate-200 bg-white overflow-y-auto max-h-[calc(100vh-56px)]">
            <div className="p-2">
              <div className="text-[10px] text-slate-400 text-center mb-2">LIVE PREVIEW</div>
              <ResumePreview ref={previewRef} form={form} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Live Preview Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { forwardRef } from 'react'

interface PreviewProps {
  form: ResumeFormState
}

const ResumePreview = forwardRef<HTMLDivElement, PreviewProps>(({ form }, ref) => {
  const accentColor = form.template === 'modern' ? '#3b82f6' : form.template === 'classic' ? '#1e293b' : '#6b7280'

  const contactParts = [form.email, form.phone, form.location, form.website].filter(Boolean)

  return (
    <div
      ref={ref}
      className="bg-white shadow-sm border border-slate-200 rounded-md p-6 text-slate-800 min-h-[600px]"
      style={{ fontSize: '12px', lineHeight: '1.6' }}
    >
      {/* Header */}
      <div className="text-center mb-4" style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: '10px' }}>
        <h1 className="text-xl font-bold" style={{ color: accentColor }}>{form.full_name || 'Your Name'}</h1>
        {contactParts.length > 0 && (
          <p className="text-[11px] text-slate-500 mt-1">{contactParts.join(' â€¢ ')}</p>
        )}
      </div>

      {/* Summary */}
      {form.summary && (
        <section className="mb-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider mb-1" style={{ color: accentColor }}>Summary</h2>
          <p className="text-[11px] text-slate-600 whitespace-pre-line">{form.summary}</p>
        </section>
      )}

      {/* Experience */}
      {form.experience.some((e) => e.title || e.company) && (
        <section className="mb-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Experience</h2>
          {form.experience.filter((e) => e.title || e.company).map((exp, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="text-[12px] font-semibold">{exp.title}{exp.company ? ` â€” ${exp.company}` : ''}</h3>
                {(exp.start_date || exp.end_date) && (
                  <span className="text-[10px] text-slate-400">{exp.start_date}{exp.end_date ? ` â€“ ${exp.end_date}` : ''}</span>
                )}
              </div>
              {exp.location && <p className="text-[10px] text-slate-400">{exp.location}</p>}
              {exp.description && <p className="text-[11px] text-slate-600 mt-1 whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {form.education.some((e) => e.degree || e.school) && (
        <section className="mb-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Education</h2>
          {form.education.filter((e) => e.degree || e.school).map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-[12px] font-semibold">{edu.degree}{edu.school ? ` â€” ${edu.school}` : ''}</h3>
                {(edu.start_date || edu.end_date) && (
                  <span className="text-[10px] text-slate-400">{edu.start_date}{edu.end_date ? ` â€“ ${edu.end_date}` : ''}</span>
                )}
              </div>
              {edu.location && <p className="text-[10px] text-slate-400">{edu.location}</p>}
              {edu.description && <p className="text-[11px] text-slate-600 mt-1">{edu.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {form.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {form.skills.map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {form.projects.some((p) => p.name) && (
        <section className="mb-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Projects</h2>
          {form.projects.filter((p) => p.name).map((proj, idx) => (
            <div key={idx} className="mb-2">
              <h3 className="text-[12px] font-semibold">
                {proj.name}
                {proj.technologies && <span className="text-[10px] text-slate-400 font-normal ml-2">({proj.technologies})</span>}
              </h3>
              {proj.description && <p className="text-[11px] text-slate-600">{proj.description}</p>}
              {proj.url && <p className="text-[10px] text-blue-500">{proj.url}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {form.certifications.length > 0 && (
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Certifications</h2>
          <ul className="list-disc pl-4">
            {form.certifications.map((cert, idx) => (
              <li key={idx} className="text-[11px] text-slate-600">{cert}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
})

ResumePreview.displayName = 'ResumePreview'
