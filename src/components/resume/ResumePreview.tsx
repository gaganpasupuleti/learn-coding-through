import type { ResumeData } from '@/components/resume/resume-demo-data'

interface ResumePreviewProps {
  data: ResumeData
}

export function ResumePreview({ data }: ResumePreviewProps) {
  const { personal } = data
  const contact = [personal.email, personal.phone, personal.location].filter(Boolean).join(' · ')
  const linkItems = [
    { label: 'GitHub', url: data.links.github },
    { label: 'LinkedIn', url: data.links.linkedin },
    { label: 'Portfolio', url: data.links.portfolio },
  ].filter((l) => l.url.trim())

  return (
    <article
      id="resume-print-root"
      className="mx-auto max-w-[720px] bg-white text-[11pt] leading-relaxed text-slate-900 print:max-w-none"
    >
      <header className="border-b border-slate-300 pb-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{personal.fullName || 'Your Name'}</h1>
        {contact && <p className="mt-1 text-sm text-slate-700">{contact}</p>}
        {linkItems.length > 0 && (
          <p className="mt-1 text-sm text-slate-600">
            {linkItems.map((l, i) => (
              <span key={l.label}>
                {i > 0 && ' · '}
                <span>{l.label}: {l.url.replace(/^https?:\/\//, '')}</span>
              </span>
            ))}
          </p>
        )}
      </header>

      {data.summary && (
        <Section title="Summary">
          <p>{data.summary}</p>
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title="Skills">
          <p>{data.skills.join(' · ')}</p>
        </Section>
      )}

      {data.education.length > 0 && (
        <Section title="Education">
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-3 last:mb-0">
              <p className="font-semibold">{edu.school}</p>
              <p className="text-sm text-slate-700">
                {[edu.degree, edu.field].filter(Boolean).join(' — ')}
                {(edu.startDate || edu.endDate) &&
                  ` · ${[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}`}
              </p>
              {edu.details && <p className="mt-1 text-sm">{edu.details}</p>}
            </div>
          ))}
        </Section>
      )}

      {data.experience.length > 0 && (
        <Section title="Experience">
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3 last:mb-0">
              <p className="font-semibold">
                {exp.role}
                {exp.company ? ` — ${exp.company}` : ''}
              </p>
              {(exp.startDate || exp.endDate) && (
                <p className="text-sm text-slate-700">
                  {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
                </p>
              )}
              {exp.bullets.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {exp.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="Projects">
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-3 last:mb-0">
              <p className="font-semibold">{proj.name}</p>
              {proj.tech && <p className="text-sm italic text-slate-700">{proj.tech}</p>}
              {proj.description && <p className="mt-1 text-sm">{proj.description}</p>}
              {proj.link && <p className="mt-1 text-sm text-slate-600">{proj.link}</p>}
            </div>
          ))}
        </Section>
      )}

      {data.certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="list-disc pl-5 text-sm">
            {data.certifications.map((cert) => (
              <li key={cert.id}>
                {cert.name}
                {cert.issuer ? ` — ${cert.issuer}` : ''}
                {cert.date ? ` (${cert.date})` : ''}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.achievements.length > 0 && (
        <Section title="Achievements">
          <ul className="list-disc pl-5 text-sm">
            {data.achievements.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="border-b border-slate-200 pb-1 text-sm font-bold uppercase tracking-wide text-slate-800">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}
