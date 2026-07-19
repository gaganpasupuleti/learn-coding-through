import { describe, expect, it } from 'vitest'
import {
  codeQuestV1ToResumeMatcherAnalysis,
  markdownParseToCodeQuestV1Preview,
  resumeMatcherAnalysisToCodeQuestResult,
  resumeMatcherToCodeQuestV1,
} from '@/lib/resume/codequest-resume-v1'

describe('CodeQuestResumeV1 adapters', () => {
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
    const v1 = resumeMatcherToCodeQuestV1({
      personalInfo: { name: 'Only Name', email: '' },
      summary: '',
      workExperience: [],
      education: [],
      additional: {},
    })
    expect(v1.basics.name).toBe('Only Name')
    expect(v1.experience).toEqual([])
    expect(v1.basics.phone).toBeUndefined()
  })
})
