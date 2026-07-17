/**
 * Provider-neutral CodeQuest Resume contract (v1).
 * Adapters convert Reactive Resume / Resume Matcher shapes without dropping unknown sections.
 */

import { z } from 'zod'

export const CODEQUEST_RESUME_VERSION = 1 as const

const idSchema = z.string().min(1)

export const codeQuestResumeV1Schema = z.object({
  version: z.literal(CODEQUEST_RESUME_VERSION),
  basics: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    summary: z.string().optional(),
    headline: z.string().optional(),
  }),
  experience: z.array(
    z.object({
      id: idSchema,
      company: z.string(),
      position: z.string(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      summary: z.string().optional(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      id: idSchema,
      institution: z.string(),
      degree: z.string().optional(),
      area: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      score: z.string().optional(),
    }),
  ),
  skills: z.array(
    z.object({
      id: idSchema,
      name: z.string(),
      keywords: z.array(z.string()),
      level: z.string().optional(),
    }),
  ),
  projects: z.array(
    z.object({
      id: idSchema,
      name: z.string(),
      description: z.string().optional(),
      highlights: z.array(z.string()),
      technologies: z.array(z.string()),
      url: z.string().optional(),
    }),
  ),
  certifications: z.array(
    z.object({
      id: idSchema,
      name: z.string(),
      issuer: z.string().optional(),
      date: z.string().optional(),
      url: z.string().optional(),
    }),
  ),
  languages: z
    .array(
      z.object({
        name: z.string(),
        fluency: z.string().optional(),
      }),
    )
    .optional(),
  /** Preserve unknown Reactive Resume sections / custom content for round-trips */
  customSections: z
    .array(
      z.object({
        id: idSchema,
        title: z.string(),
        content: z.unknown(),
      }),
    )
    .optional(),
  /** Opaque RR metadata passthrough (templates, layout) — never silently discard */
  reactiveResumePassthrough: z.record(z.unknown()).optional(),
})

export type CodeQuestResumeV1 = z.infer<typeof codeQuestResumeV1Schema>

function newId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Reactive Resume `ResumeData`-like object → CodeQuestResumeV1 */
export function reactiveResumeToCodeQuestV1(data: unknown): CodeQuestResumeV1 {
  const root = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  const basics = (root.basics && typeof root.basics === 'object' ? root.basics : {}) as Record<
    string,
    unknown
  >
  const website =
    basics.website && typeof basics.website === 'object'
      ? asString((basics.website as Record<string, unknown>).url)
      : asString(basics.website)
  const summaryObj =
    root.summary && typeof root.summary === 'object' ? (root.summary as Record<string, unknown>) : {}
  const sections =
    root.sections && typeof root.sections === 'object' ? (root.sections as Record<string, unknown>) : {}

  const experienceSection = (sections.experience ?? {}) as Record<string, unknown>
  const educationSection = (sections.education ?? {}) as Record<string, unknown>
  const skillsSection = (sections.skills ?? {}) as Record<string, unknown>
  const projectsSection = (sections.projects ?? {}) as Record<string, unknown>
  const certsSection = (sections.certifications ?? {}) as Record<string, unknown>
  const languagesSection = (sections.languages ?? {}) as Record<string, unknown>

  const experience = (Array.isArray(experienceSection.items) ? experienceSection.items : []).map(
    (item, index) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      return {
        id: asString(row.id, newId('exp', index)),
        company: asString(row.company),
        position: asString(row.position),
        location: asString(row.location) || undefined,
        startDate: asString(row.date) || undefined,
        endDate: undefined,
        current: undefined,
        summary: stripHtml(asString(row.summary)) || undefined,
        highlights: asStringArray(row.highlights).map(stripHtml).filter(Boolean),
      }
    },
  )

  const education = (Array.isArray(educationSection.items) ? educationSection.items : []).map(
    (item, index) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      return {
        id: asString(row.id, newId('edu', index)),
        institution: asString(row.institution),
        degree: asString(row.studyType) || undefined,
        area: asString(row.area) || undefined,
        startDate: asString(row.date) || undefined,
        score: asString(row.score) || undefined,
      }
    },
  )

  const skills = (Array.isArray(skillsSection.items) ? skillsSection.items : []).map((item, index) => {
    const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
    return {
      id: asString(row.id, newId('skill', index)),
      name: asString(row.name),
      keywords: asStringArray(row.keywords),
      level: asString(row.level) || undefined,
    }
  })

  const projects = (Array.isArray(projectsSection.items) ? projectsSection.items : []).map(
    (item, index) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      const projectWebsite =
        row.website && typeof row.website === 'object'
          ? asString((row.website as Record<string, unknown>).url)
          : ''
      return {
        id: asString(row.id, newId('proj', index)),
        name: asString(row.name),
        description: stripHtml(asString(row.description)) || undefined,
        highlights: asStringArray(row.highlights).map(stripHtml).filter(Boolean),
        technologies: asStringArray(row.keywords),
        url: projectWebsite || undefined,
      }
    },
  )

  const certifications = (Array.isArray(certsSection.items) ? certsSection.items : []).map(
    (item, index) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      const certWebsite =
        row.website && typeof row.website === 'object'
          ? asString((row.website as Record<string, unknown>).url)
          : ''
      return {
        id: asString(row.id, newId('cert', index)),
        name: asString(row.name),
        issuer: asString(row.issuer) || undefined,
        date: asString(row.date) || undefined,
        url: certWebsite || undefined,
      }
    },
  )

  const languages = (Array.isArray(languagesSection.items) ? languagesSection.items : []).map(
    (item) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      return {
        name: asString(row.name),
        fluency: asString(row.description) || asString(row.level) || undefined,
      }
    },
  )

  const knownSectionKeys = new Set([
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'languages',
    'profiles',
  ])
  const customSections = Object.entries(sections)
    .filter(([key]) => !knownSectionKeys.has(key))
    .map(([key, value]) => ({
      id: key,
      title: asString((value as Record<string, unknown>)?.title, key),
      content: value,
    }))

  if (Array.isArray(root.customSections)) {
    for (const [index, section] of root.customSections.entries()) {
      const row = (section && typeof section === 'object' ? section : {}) as Record<string, unknown>
      customSections.push({
        id: asString(row.id, newId('custom', index)),
        title: asString(row.title, 'Custom'),
        content: section,
      })
    }
  }

  const passthrough: Record<string, unknown> = {}
  if (root.metadata !== undefined) passthrough.metadata = root.metadata
  if (root.picture !== undefined) passthrough.picture = root.picture
  if (sections.profiles !== undefined) passthrough.profiles = sections.profiles

  return codeQuestResumeV1Schema.parse({
    version: CODEQUEST_RESUME_VERSION,
    basics: {
      name: asString(basics.name),
      email: asString(basics.email),
      phone: asString(basics.phone) || undefined,
      location: asString(basics.location) || undefined,
      website: website || undefined,
      summary: stripHtml(asString(summaryObj.content)) || undefined,
      headline: asString(basics.headline) || undefined,
    },
    experience,
    education,
    skills,
    projects,
    certifications,
    languages: languages.length ? languages : undefined,
    customSections: customSections.length ? customSections : undefined,
    reactiveResumePassthrough: Object.keys(passthrough).length ? passthrough : undefined,
  })
}

/** CodeQuestResumeV1 → partial Reactive Resume `ResumeData` patch (merge-friendly) */
export function codeQuestV1ToReactiveResumePatch(resume: CodeQuestResumeV1): Record<string, unknown> {
  const passthrough = resume.reactiveResumePassthrough ?? {}
  return {
    picture: passthrough.picture,
    basics: {
      name: resume.basics.name,
      headline: resume.basics.headline ?? '',
      email: resume.basics.email,
      phone: resume.basics.phone ?? '',
      location: resume.basics.location ?? '',
      website: { url: resume.basics.website ?? '', label: '' },
      customFields: [],
    },
    summary: {
      title: 'Summary',
      columns: 1,
      hidden: false,
      content: resume.basics.summary ? `<p>${resume.basics.summary}</p>` : '',
    },
    sections: {
      profiles: passthrough.profiles ?? { title: 'Profiles', columns: 1, hidden: false, items: [] },
      experience: {
        title: 'Experience',
        columns: 1,
        hidden: false,
        items: resume.experience.map((item) => ({
          id: item.id,
          hidden: false,
          company: item.company,
          position: item.position,
          location: item.location ?? '',
          date: [item.startDate, item.current ? 'Present' : item.endDate].filter(Boolean).join(' - '),
          summary: item.summary ? `<p>${item.summary}</p>` : '',
          highlights: item.highlights,
        })),
      },
      education: {
        title: 'Education',
        columns: 1,
        hidden: false,
        items: resume.education.map((item) => ({
          id: item.id,
          hidden: false,
          institution: item.institution,
          studyType: item.degree ?? '',
          area: item.area ?? '',
          score: item.score ?? '',
          date: [item.startDate, item.endDate].filter(Boolean).join(' - '),
          summary: '',
          url: { url: '', label: '', inlineLink: false },
        })),
      },
      skills: {
        title: 'Skills',
        columns: 1,
        hidden: false,
        items: resume.skills.map((item) => ({
          id: item.id,
          hidden: false,
          name: item.name,
          description: item.level ?? '',
          level: 1,
          keywords: item.keywords,
        })),
      },
      projects: {
        title: 'Projects',
        columns: 1,
        hidden: false,
        items: resume.projects.map((item) => ({
          id: item.id,
          hidden: false,
          name: item.name,
          description: item.description ? `<p>${item.description}</p>` : '',
          date: '',
          keywords: item.technologies,
          website: { url: item.url ?? '', label: '', inlineLink: false },
          highlights: item.highlights,
        })),
      },
      certifications: {
        title: 'Certifications',
        columns: 1,
        hidden: false,
        items: resume.certifications.map((item) => ({
          id: item.id,
          hidden: false,
          name: item.name,
          issuer: item.issuer ?? '',
          date: item.date ?? '',
          website: { url: item.url ?? '', label: '', inlineLink: false },
          summary: '',
        })),
      },
      languages: {
        title: 'Languages',
        columns: 1,
        hidden: false,
        items: (resume.languages ?? []).map((item, index) => ({
          id: newId('lang', index),
          hidden: false,
          name: item.name,
          description: item.fluency ?? '',
          level: 0,
        })),
      },
    },
    customSections: (resume.customSections ?? [])
      .filter((section) => section.content && typeof section.content === 'object')
      .map((section) => section.content),
    metadata: passthrough.metadata,
  }
}

/** Resume Matcher parse/analysis resume dict → CodeQuestResumeV1 */
export function resumeMatcherToCodeQuestV1(data: unknown): CodeQuestResumeV1 {
  const root = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  const personal =
    (root.personalInfo && typeof root.personalInfo === 'object'
      ? root.personalInfo
      : root.basics && typeof root.basics === 'object'
        ? root.basics
        : {}) as Record<string, unknown>

  const work = Array.isArray(root.workExperience)
    ? root.workExperience
    : Array.isArray(root.experience)
      ? root.experience
      : []
  const education = Array.isArray(root.education) ? root.education : []
  const projects = Array.isArray(root.personalProjects)
    ? root.personalProjects
    : Array.isArray(root.projects)
      ? root.projects
      : []
  const additional =
    root.additional && typeof root.additional === 'object'
      ? (root.additional as Record<string, unknown>)
      : {}

  const techSkills = asStringArray(additional.technicalSkills)
  const skillItems =
    Array.isArray(root.skills) && root.skills.length
      ? root.skills
      : techSkills.map((name) => ({ name, keywords: [] }))

  return codeQuestResumeV1Schema.parse({
    version: CODEQUEST_RESUME_VERSION,
    basics: {
      name: asString(personal.name) || asString(personal.fullName),
      email: asString(personal.email),
      phone: asString(personal.phone) || undefined,
      location: asString(personal.location) || undefined,
      website: asString(personal.website) || asString(personal.linkedin) || undefined,
      summary: asString(root.summary) || undefined,
    },
    experience: work.map((item, index) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      return {
        id: asString(row.id, newId('exp', index)),
        company: asString(row.company),
        position: asString(row.position) || asString(row.title),
        location: asString(row.location) || undefined,
        startDate: asString(row.years) || asString(row.startDate) || undefined,
        highlights: asStringArray(row.description).length
          ? asStringArray(row.description)
          : asStringArray(row.highlights),
        summary: asString(row.summary) || undefined,
      }
    }),
    education: education.map((item, index) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      return {
        id: asString(row.id, newId('edu', index)),
        institution: asString(row.institution) || asString(row.school),
        degree: asString(row.degree) || asString(row.studyType) || undefined,
        area: asString(row.area) || undefined,
        startDate: asString(row.years) || asString(row.startDate) || undefined,
        score: asString(row.score) || undefined,
      }
    }),
    skills: skillItems.map((item, index) => {
      if (typeof item === 'string') {
        return { id: newId('skill', index), name: item, keywords: [] as string[] }
      }
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      return {
        id: asString(row.id, newId('skill', index)),
        name: asString(row.name),
        keywords: asStringArray(row.keywords),
        level: asString(row.level) || undefined,
      }
    }),
    projects: projects.map((item, index) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      return {
        id: asString(row.id, newId('proj', index)),
        name: asString(row.name) || asString(row.title),
        description: asString(row.description) || undefined,
        highlights: asStringArray(row.description).length
          ? asStringArray(row.description)
          : asStringArray(row.highlights),
        technologies: asStringArray(row.technologies),
        url: asString(row.url) || undefined,
      }
    }),
    certifications: asStringArray(additional.certificationsTraining).map((name, index) => ({
      id: newId('cert', index),
      name,
    })),
    languages: asStringArray(additional.languages).map((name) => ({ name })),
  })
}

/** CodeQuestResumeV1 → Resume Matcher analysis request resume dict */
export function codeQuestV1ToResumeMatcherAnalysis(resume: CodeQuestResumeV1): Record<string, unknown> {
  return {
    personalInfo: {
      name: resume.basics.name,
      email: resume.basics.email,
      phone: resume.basics.phone ?? '',
      location: resume.basics.location ?? '',
      website: resume.basics.website ?? '',
    },
    summary: resume.basics.summary ?? '',
    workExperience: resume.experience.map((item, index) => ({
      id: index + 1,
      company: item.company,
      position: item.position,
      location: item.location ?? '',
      years: [item.startDate, item.current ? 'Present' : item.endDate].filter(Boolean).join(' - '),
      description: item.highlights.length ? item.highlights : item.summary ? [item.summary] : [],
    })),
    education: resume.education.map((item, index) => ({
      id: index + 1,
      institution: item.institution,
      degree: item.degree ?? '',
      years: [item.startDate, item.endDate].filter(Boolean).join(' - '),
      description: [],
    })),
    personalProjects: resume.projects.map((item, index) => ({
      id: index + 1,
      name: item.name,
      years: '',
      description: item.highlights.length
        ? item.highlights
        : item.description
          ? [item.description]
          : [],
    })),
    additional: {
      technicalSkills: resume.skills.flatMap((skill) => [skill.name, ...skill.keywords]),
      languages: (resume.languages ?? []).map((language) => language.name),
      certificationsTraining: resume.certifications.map((cert) => cert.name),
      awards: [],
    },
  }
}

/** Resume Matcher analyze/match response → Code Quest result contract */
export function resumeMatcherAnalysisToCodeQuestResult(payload: unknown): {
  requiredSkills: string[]
  preferredSkills: string[]
  keywords: string[]
  matchedKeywords: string[]
  missingKeywords: string[]
  keywordCoveragePercent: number
  findings: string[]
  extractionMode: string
} {
  const root = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
  return {
    requiredSkills: asStringArray(root.required_skills ?? root.requiredSkills),
    preferredSkills: asStringArray(root.preferred_skills ?? root.preferredSkills),
    keywords: asStringArray(root.keywords),
    matchedKeywords: asStringArray(root.matched_keywords ?? root.matchedKeywords),
    missingKeywords: asStringArray(root.missing_keywords ?? root.missingKeywords),
    keywordCoveragePercent: Number(root.keyword_coverage_percent ?? root.keywordCoveragePercent ?? 0),
    findings: asStringArray(root.findings),
    extractionMode: asString(root.extraction_mode ?? root.extractionMode, 'deterministic'),
  }
}

/** Markdown parse preview → minimal CodeQuestResumeV1 (pre-structure) */
export function markdownParseToCodeQuestV1Preview(markdown: string, filename: string): CodeQuestResumeV1 {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.replace(/^#+\s*/, '').trim())
    .filter(Boolean)
  const name = lines[0] ?? filename
  return codeQuestResumeV1Schema.parse({
    version: CODEQUEST_RESUME_VERSION,
    basics: {
      name,
      email: '',
      summary: markdown.slice(0, 4000),
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    customSections: [
      {
        id: 'imported-markdown',
        title: 'Imported markdown',
        content: { markdown, filename },
      },
    ],
  })
}
