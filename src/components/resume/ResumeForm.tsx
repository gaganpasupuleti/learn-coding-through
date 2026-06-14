import { Plus, Trash2 } from 'lucide-react'

import {
  newId,
  type ResumeData,
  type ResumeEducationEntry,
  type ResumeExperienceEntry,
  type ResumeProjectEntry,
} from '@/components/resume/resume-demo-data'
import { ResumeSectionCard, ResumeTextField } from '@/components/resume/ResumeSectionCard'

interface ResumeFormProps {
  data: ResumeData
  onChange: (data: ResumeData) => void
}

export function ResumeForm({ data, onChange }: ResumeFormProps) {
  const update = (patch: Partial<ResumeData>) => onChange({ ...data, ...patch })

  return (
    <div className="space-y-5">
      <ResumeSectionCard title="Personal info" description="Name and contact details for recruiters">
        <ResumeTextField
          label="Full name"
          value={data.personal.fullName}
          onChange={(fullName) => update({ personal: { ...data.personal, fullName } })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ResumeTextField
            label="Email"
            value={data.personal.email}
            onChange={(email) => update({ personal: { ...data.personal, email } })}
          />
          <ResumeTextField
            label="Phone"
            value={data.personal.phone}
            onChange={(phone) => update({ personal: { ...data.personal, phone } })}
          />
        </div>
        <ResumeTextField
          label="Location"
          value={data.personal.location}
          onChange={(location) => update({ personal: { ...data.personal, location } })}
        />
      </ResumeSectionCard>

      <ResumeSectionCard title="Summary">
        <ResumeTextField
          label="Professional summary"
          value={data.summary}
          onChange={(summary) => update({ summary })}
          multiline
          placeholder="2–3 sentences about your goals and strengths"
        />
      </ResumeSectionCard>

      <ResumeSectionCard title="Education">
        {data.education.map((entry, index) => (
          <EducationRow
            key={entry.id}
            entry={entry}
            onChange={(next) => {
              const education = [...data.education]
              education[index] = next
              update({ education })
            }}
            onRemove={() => update({ education: data.education.filter((e) => e.id !== entry.id) })}
          />
        ))}
        <button
          type="button"
          onClick={() =>
            update({
              education: [
                ...data.education,
                {
                  id: newId('edu'),
                  school: '',
                  degree: '',
                  field: '',
                  startDate: '',
                  endDate: '',
                  details: '',
                },
              ],
            })
          }
          className="inline-flex items-center gap-1 rounded text-sm font-medium text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <Plus className="h-4 w-4" /> Add education
        </button>
      </ResumeSectionCard>

      <ResumeSectionCard title="Skills" description="Comma-separated list">
        <ResumeTextField
          label="Skills"
          value={data.skills.join(', ')}
          onChange={(raw) =>
            update({
              skills: raw
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="Python, SQL, React"
        />
      </ResumeSectionCard>

      <ResumeSectionCard title="Projects">
        {data.projects.map((entry, index) => (
          <ProjectRow
            key={entry.id}
            entry={entry}
            onChange={(next) => {
              const projects = [...data.projects]
              projects[index] = next
              update({ projects })
            }}
            onRemove={() => update({ projects: data.projects.filter((p) => p.id !== entry.id) })}
          />
        ))}
        <button
          type="button"
          onClick={() =>
            update({
              projects: [
                ...data.projects,
                { id: newId('proj'), name: '', description: '', tech: '', link: '' },
              ],
            })
          }
          className="inline-flex items-center gap-1 rounded text-sm font-medium text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <Plus className="h-4 w-4" /> Add project
        </button>
      </ResumeSectionCard>

      <ResumeSectionCard title="Experience / Internship">
        {data.experience.map((entry, index) => (
          <ExperienceRow
            key={entry.id}
            entry={entry}
            onChange={(next) => {
              const experience = [...data.experience]
              experience[index] = next
              update({ experience })
            }}
            onRemove={() => update({ experience: data.experience.filter((e) => e.id !== entry.id) })}
          />
        ))}
        <button
          type="button"
          onClick={() =>
            update({
              experience: [
                ...data.experience,
                {
                  id: newId('exp'),
                  company: '',
                  role: '',
                  startDate: '',
                  endDate: '',
                  bullets: [''],
                },
              ],
            })
          }
          className="inline-flex items-center gap-1 rounded text-sm font-medium text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <Plus className="h-4 w-4" /> Add experience
        </button>
      </ResumeSectionCard>

      <ResumeSectionCard title="Certifications">
        {data.certifications.map((entry, index) => (
          <div key={entry.id} className="grid gap-3 rounded-lg border border-slate-100 p-3">
            <ResumeTextField
              label="Certification name"
              value={entry.name}
              onChange={(name) => {
                const certifications = [...data.certifications]
                certifications[index] = { ...entry, name }
                update({ certifications })
              }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <ResumeTextField
                label="Issuer"
                value={entry.issuer}
                onChange={(issuer) => {
                  const certifications = [...data.certifications]
                  certifications[index] = { ...entry, issuer }
                  update({ certifications })
                }}
              />
              <ResumeTextField
                label="Date"
                value={entry.date}
                onChange={(date) => {
                  const certifications = [...data.certifications]
                  certifications[index] = { ...entry, date }
                  update({ certifications })
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => update({ certifications: data.certifications.filter((c) => c.id !== entry.id) })}
              className="inline-flex items-center gap-1 text-xs text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update({
              certifications: [
                ...data.certifications,
                { id: newId('cert'), name: '', issuer: '', date: '' },
              ],
            })
          }
          className="inline-flex items-center gap-1 rounded text-sm font-medium text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <Plus className="h-4 w-4" /> Add certification
        </button>
      </ResumeSectionCard>

      <ResumeSectionCard title="Achievements" description="One per line">
        <ResumeTextField
          label="Achievements"
          value={data.achievements.join('\n')}
          onChange={(raw) =>
            update({
              achievements: raw
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          multiline
        />
      </ResumeSectionCard>

      <ResumeSectionCard title="Links">
        <ResumeTextField
          label="GitHub"
          value={data.links.github}
          onChange={(github) => update({ links: { ...data.links, github } })}
        />
        <ResumeTextField
          label="LinkedIn"
          value={data.links.linkedin}
          onChange={(linkedin) => update({ links: { ...data.links, linkedin } })}
        />
        <ResumeTextField
          label="Portfolio"
          value={data.links.portfolio}
          onChange={(portfolio) => update({ links: { ...data.links, portfolio } })}
        />
      </ResumeSectionCard>
    </div>
  )
}

function EducationRow({
  entry,
  onChange,
  onRemove,
}: {
  entry: ResumeEducationEntry
  onChange: (entry: ResumeEducationEntry) => void
  onRemove: () => void
}) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
      <ResumeTextField label="School" value={entry.school} onChange={(school) => onChange({ ...entry, school })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <ResumeTextField label="Degree" value={entry.degree} onChange={(degree) => onChange({ ...entry, degree })} />
        <ResumeTextField label="Field" value={entry.field} onChange={(field) => onChange({ ...entry, field })} />
      </div>
      <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs text-red-600">
        <Trash2 className="h-3.5 w-3.5" /> Remove
      </button>
    </div>
  )
}

function ProjectRow({
  entry,
  onChange,
  onRemove,
}: {
  entry: ResumeProjectEntry
  onChange: (entry: ResumeProjectEntry) => void
  onRemove: () => void
}) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
      <ResumeTextField label="Project name" value={entry.name} onChange={(name) => onChange({ ...entry, name })} />
      <ResumeTextField
        label="Description"
        value={entry.description}
        onChange={(description) => onChange({ ...entry, description })}
        multiline
      />
      <ResumeTextField label="Tech stack" value={entry.tech} onChange={(tech) => onChange({ ...entry, tech })} />
      <ResumeTextField label="Link" value={entry.link} onChange={(link) => onChange({ ...entry, link })} />
      <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs text-red-600">
        <Trash2 className="h-3.5 w-3.5" /> Remove
      </button>
    </div>
  )
}

function ExperienceRow({
  entry,
  onChange,
  onRemove,
}: {
  entry: ResumeExperienceEntry
  onChange: (entry: ResumeExperienceEntry) => void
  onRemove: () => void
}) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
      <ResumeTextField label="Company" value={entry.company} onChange={(company) => onChange({ ...entry, company })} />
      <ResumeTextField label="Role" value={entry.role} onChange={(role) => onChange({ ...entry, role })} />
      <ResumeTextField
        label="Highlights (one per line)"
        value={entry.bullets.join('\n')}
        onChange={(raw) =>
          onChange({
            ...entry,
            bullets: raw
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
        multiline
      />
      <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs text-red-600">
        <Trash2 className="h-3.5 w-3.5" /> Remove
      </button>
    </div>
  )
}
