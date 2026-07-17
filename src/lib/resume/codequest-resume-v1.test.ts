import { describe, expect, it } from 'vitest'
import {
  codeQuestV1ToReactiveResumePatch,
  codeQuestV1ToResumeMatcherAnalysis,
  markdownParseToCodeQuestV1Preview,
  reactiveResumeToCodeQuestV1,
  resumeMatcherAnalysisToCodeQuestResult,
  resumeMatcherToCodeQuestV1,
} from '@/lib/resume/codequest-resume-v1'

const sampleReactive = {
  basics: {
    name: 'Ada Lovelace',
    headline: 'Engineer',
    email: 'ada@example.com',
    phone: '555',
    location: 'London',
    website: { url: 'https://ada.dev', label: 'Site' },
    customFields: [],
  },
  summary: { title: 'Summary', columns: 1, hidden: false, content: '<p>Math pioneer</p>' },
  sections: {
    experience: {
      title: 'Experience',
      columns: 1,
      hidden: false,
      items: [
        {
          id: 'exp-1',
          company: 'Analytical Engine Co',
          position: 'Programmer',
          location: 'London',
          date: '1842 - 1852',
          summary: '<p>Wrote notes</p>',
          highlights: ['First algorithm'],
        },
      ],
    },
    education: {
      title: 'Education',
      columns: 1,
      hidden: false,
      items: [
        {
          id: 'edu-1',
          institution: 'Home',
          studyType: 'Private',
          area: 'Math',
          score: '',
          date: '1830',
        },
      ],
    },
    skills: {
      title: 'Skills',
      columns: 1,
      hidden: false,
      items: [{ id: 'skill-1', name: 'Mathematics', keywords: ['Calculus'], level: 1 }],
    },
    projects: {
      title: 'Projects',
      columns: 1,
      hidden: false,
      items: [
        {
          id: 'proj-1',
          name: 'Bernoulli numbers',
          description: '<p>Computed sequence</p>',
          keywords: ['Math'],
          highlights: ['Published notes'],
          website: { url: '', label: '', inlineLink: false },
        },
      ],
    },
    certifications: { title: 'Certifications', columns: 1, hidden: false, items: [] },
    languages: { title: 'Languages', columns: 1, hidden: false, items: [] },
    volunteer: {
      title: 'Volunteer',
      columns: 1,
      hidden: false,
      items: [{ id: 'vol-1', organization: 'Science Society', summary: 'Helped' }],
    },
  },
  customSections: [],
  metadata: { template: 'azurill' },
  picture: { url: '', hidden: true },
}

describe('CodeQuestResumeV1 adapters', () => {
  it('round-trips Reactive Resume without dropping custom sections or metadata', () => {
    const v1 = reactiveResumeToCodeQuestV1(sampleReactive)
    expect(v1.basics.name).toBe('Ada Lovelace')
    expect(v1.basics.summary).toBe('Math pioneer')
    expect(v1.experience[0]?.highlights).toContain('First algorithm')
    expect(v1.customSections?.some((section) => section.id === 'volunteer')).toBe(true)
    expect(v1.reactiveResumePassthrough?.metadata).toEqual({ template: 'azurill' })

    const patch = codeQuestV1ToReactiveResumePatch(v1)
    const again = reactiveResumeToCodeQuestV1(patch)
    expect(again.basics.email).toBe(v1.basics.email)
    expect(again.experience[0]?.company).toBe(v1.experience[0]?.company)
    expect(again.skills[0]?.keywords).toEqual(v1.skills[0]?.keywords)
  })

  it('maps Resume Matcher parsed shape and analysis request', () => {
    const v1 = resumeMatcherToCodeQuestV1({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      summary: 'Engineer',
      workExperience: [
        {
          company: 'Acme',
          position: 'Dev',
          description: ['Built APIs'],
        },
      ],
      education: [{ institution: 'MIT', degree: 'BS' }],
      additional: { technicalSkills: ['Python', 'SQL'], languages: ['English'] },
    })
    expect(v1.skills.map((skill) => skill.name)).toEqual(expect.arrayContaining(['Python', 'SQL']))
    const analysis = codeQuestV1ToResumeMatcherAnalysis(v1)
    expect(analysis.personalInfo).toMatchObject({ name: 'Ada', email: 'ada@example.com' })
    expect(analysis.additional.technicalSkills).toEqual(expect.arrayContaining(['Python', 'SQL']))
  })

  it('normalizes Resume Matcher analysis responses', () => {
    const result = resumeMatcherAnalysisToCodeQuestResult({
      required_skills: ['Python'],
      preferred_skills: ['Docker'],
      keywords: ['Python', 'Docker'],
      matched_keywords: ['Python'],
      missing_keywords: ['Docker'],
      keyword_coverage_percent: 50,
      findings: ['Missing Docker'],
      extraction_mode: 'deterministic',
    })
    expect(result.keywordCoveragePercent).toBe(50)
    expect(result.matchedKeywords).toEqual(['Python'])
  })

  it('builds a markdown import preview without inventing experience', () => {
    const preview = markdownParseToCodeQuestV1Preview('# Jane Doe\n\nPython developer', 'resume.pdf')
    expect(preview.basics.name).toContain('Jane')
    expect(preview.experience).toEqual([])
    expect(preview.customSections?.[0]?.id).toBe('imported-markdown')
  })

  it('handles missing optional fields', () => {
    const v1 = reactiveResumeToCodeQuestV1({
      basics: { name: 'Only Name', email: '', phone: '', location: '', website: { url: '' }, customFields: [] },
      summary: { content: '' },
      sections: {},
    })
    expect(v1.basics.name).toBe('Only Name')
    expect(v1.experience).toEqual([])
    expect(v1.basics.phone).toBeUndefined()
  })
})
