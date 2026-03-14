import { useKV } from '@github/spark/hooks'
import { useState, useCallback } from 'react'
import { Job, CareerRole, SkillAssessment } from '@/types/career'

export interface MLJobRecommendation {
  jobId: string
  score: number
  reasoning: string[]
  skillMatches: { skill: string; relevance: number }[]
  careerFit: number
  growthPotential: number
  confidenceLevel: number
  generatedAt: string
}

export interface MLCareerRecommendation {
  roleId: string
  score: number
  reasoning: string[]
  skillGaps: { skill: string; priority: 'high' | 'medium' | 'low' }[]
  timeToReady: number
  successProbability: number
  generatedAt: string
}

export interface UserPreference {
  viewedJobs: string[]
  appliedJobs: string[]
  dismissedJobs: string[]
  favoriteSkills: string[]
  preferredLocations: string[]
  preferredJobTypes: string[]
  salaryExpectation?: { min: number; max: number }
}

export interface MLModel {
  lastTrainedAt: string
  userSkillVector: Record<string, number>
  jobPreferences: Record<string, number>
  interactionHistory: { jobId: string; action: 'view' | 'apply' | 'dismiss'; timestamp: string }[]
}

export function useMLRecommendations() {
  const [recommendations, setRecommendations] = useKV<Record<string, MLJobRecommendation>>('ml-job-recommendations', {})
  const [careerRecommendations, setCareerRecommendations] = useKV<Record<string, MLCareerRecommendation>>('ml-career-recommendations', {})
  const [userPreferences, setUserPreferences] = useKV<UserPreference>('ml-user-preferences', {
    viewedJobs: [],
    appliedJobs: [],
    dismissedJobs: [],
    favoriteSkills: [],
    preferredLocations: [],
    preferredJobTypes: []
  })
  const [mlModel, setMLModel] = useKV<MLModel>('ml-model', {
    lastTrainedAt: new Date().toISOString(),
    userSkillVector: {},
    jobPreferences: {},
    interactionHistory: []
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const calculateSkillSimilarity = (userSkills: string[], jobSkills: string[]): number => {
    if (!userSkills.length || !jobSkills.length) return 0
    const userSkillsLower = userSkills.map(s => s.toLowerCase())
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase())
    const matches = userSkillsLower.filter(skill => jobSkillsLower.includes(skill))
    const jaccardSimilarity = matches.length / (userSkillsLower.length + jobSkillsLower.length - matches.length)
    return Math.round(jaccardSimilarity * 100)
  }

  const extractUserSkills = (assessments: SkillAssessment[]): string[] => {
    return assessments
      .filter(a => a.level === 'proficient' || a.level === 'partial')
      .map(a => a.skill)
  }

  const trackJobInteraction = useCallback((jobId: string, action: 'view' | 'apply' | 'dismiss') => {
    setMLModel(current => ({
      ...current!,
      interactionHistory: [
        ...(current?.interactionHistory || []),
        { jobId, action, timestamp: new Date().toISOString() }
      ].slice(-100)
    }))
    setUserPreferences(current => {
      const updated = { ...current! }
      if (action === 'view' && !updated.viewedJobs.includes(jobId)) {
        updated.viewedJobs = [...updated.viewedJobs, jobId]
      } else if (action === 'apply' && !updated.appliedJobs.includes(jobId)) {
        updated.appliedJobs = [...updated.appliedJobs, jobId]
      } else if (action === 'dismiss' && !updated.dismissedJobs.includes(jobId)) {
        updated.dismissedJobs = [...updated.dismissedJobs, jobId]
      }
      return updated
    })
  }, [setMLModel, setUserPreferences])

  const updateSkillPreferences = useCallback((skills: string[]) => {
    setUserPreferences(current => ({ ...current!, favoriteSkills: skills }))
  }, [setUserPreferences])

  const generateJobRecommendation = useCallback(async (
    job: Job,
    userSkills: SkillAssessment[],
    roles: CareerRole[]
  ): Promise<MLJobRecommendation> => {
    const userSkillList = extractUserSkills(userSkills)
    const skillSimilarity = calculateSkillSimilarity(userSkillList, job.skills)
    const userRole = roles.find(r => r.id === job.roleId)
    const hasRoleExperience = userRole && userSkills.some(a =>
      userRole.skills.map((s: string) => s.toLowerCase()).includes(a.skill.toLowerCase()) &&
      a.level === 'proficient'
    )
    const matchedSkills = job.skills.filter(skill =>
      userSkillList.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
    )
    const missingSkills = job.skills.filter(skill =>
      !userSkillList.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
    )
    const preferences = userPreferences || { viewedJobs: [], appliedJobs: [], dismissedJobs: [], favoriteSkills: [], preferredLocations: [], preferredJobTypes: [] }
    const locationMatch = preferences.preferredLocations.length === 0 || preferences.preferredLocations.includes(job.location)
    const jobTypeMatch = preferences.preferredJobTypes.length === 0 || preferences.preferredJobTypes.includes(job.type)
    let baseScore = skillSimilarity
    if (hasRoleExperience) baseScore += 15
    if (locationMatch) baseScore += 10
    if (jobTypeMatch) baseScore += 5
    if (missingSkills.length <= 2) baseScore += 10
    const careerFit = Math.min(100, baseScore)
    const growthPotential = Math.round((missingSkills.length / job.skills.length) * 100)
    const confidenceLevel = matchedSkills.length >= 3 ? 85 : matchedSkills.length >= 1 ? 60 : 40
    const reasoning: string[] = []
    if (matchedSkills.length > 0) reasoning.push(`You have ${matchedSkills.length} matching skill${matchedSkills.length > 1 ? 's' : ''}: ${matchedSkills.slice(0, 3).join(', ')}${matchedSkills.length > 3 ? '...' : ''}`)
    if (hasRoleExperience) reasoning.push('Strong alignment with your career path')
    if (missingSkills.length > 0 && missingSkills.length <= 2) reasoning.push(`Only ${missingSkills.length} new skill${missingSkills.length > 1 ? 's' : ''} to learn: ${missingSkills.join(', ')}`)
    else if (missingSkills.length === 0) reasoning.push('You already have all required skills!')
    if (growthPotential > 40) reasoning.push('Great opportunity to expand your skill set')
    if (locationMatch && preferences.preferredLocations.length > 0) reasoning.push('Matches your location preference')
    if (job.remote && preferences.preferredLocations.includes('Remote')) reasoning.push('Remote position matching your preference')
    const skillMatchDetails = job.skills.map(skill => ({
      skill,
      relevance: matchedSkills.includes(skill) ? 100 : missingSkills.includes(skill) ? 0 : 50
    }))
    return { jobId: job.id, score: Math.min(100, Math.round(careerFit)), reasoning, skillMatches: skillMatchDetails, careerFit, growthPotential, confidenceLevel, generatedAt: new Date().toISOString() }
  }, [userPreferences])

  const generateCareerRecommendation = useCallback(async (
    role: CareerRole,
    userSkills: SkillAssessment[]
  ): Promise<MLCareerRecommendation> => {
    const userSkillList = extractUserSkills(userSkills)
    const skillSimilarity = calculateSkillSimilarity(userSkillList, role.skills)
    const matchedSkills = role.skills.filter((skill: string) => userSkillList.some(u => u.toLowerCase() === skill.toLowerCase()))
    const missingSkills = role.skills.filter((skill: string) => !userSkillList.some(u => u.toLowerCase() === skill.toLowerCase()))
    const proficientSkills = userSkills.filter(a => a.level === 'proficient').length
    const partialSkills = userSkills.filter(a => a.level === 'partial').length
    let baseScore = skillSimilarity
    if (proficientSkills >= 5) baseScore += 20
    if (partialSkills >= 3) baseScore += 10
    if (missingSkills.length <= 3) baseScore += 15
    const score = Math.min(100, Math.round(baseScore))
    const timeToReady = Math.max(1, Math.ceil(missingSkills.length * 0.5))
    const successProbability = Math.max(40, 100 - (missingSkills.length * 8))
    const skillGaps = missingSkills.map((skill: string, index: number) => ({
      skill,
      priority: (index < 3 ? 'high' : index < 6 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    }))
    const reasoning: string[] = []
    if (matchedSkills.length > 0) reasoning.push(`You already have ${matchedSkills.length}/${role.skills.length} required skills`)
    if (skillSimilarity >= 70) reasoning.push('Strong skill match - you\'re nearly ready!')
    else if (skillSimilarity >= 40) reasoning.push('Good foundation - focus on bridging skill gaps')
    else reasoning.push('This role will require significant upskilling')
    reasoning.push(`Estimated time to job-ready: ${timeToReady} month${timeToReady > 1 ? 's' : ''}`)
    if (successProbability >= 70) reasoning.push('High probability of success with focused learning')
    if (role.demandLevel === 'High') reasoning.push('High demand role with many opportunities')
    return { roleId: role.id, score, reasoning, skillGaps, timeToReady, successProbability, generatedAt: new Date().toISOString() }
  }, [])

  const generateAllJobRecommendations = useCallback(async (jobs: Job[], userSkills: SkillAssessment[], roles: CareerRole[]) => {
    setIsGenerating(true)
    try {
      const newRecommendations: Record<string, MLJobRecommendation> = {}
      for (const job of jobs) {
        const recommendation = await generateJobRecommendation(job, userSkills, roles)
        newRecommendations[job.id] = recommendation
      }
      setRecommendations(newRecommendations)
      return newRecommendations
    } finally {
      setIsGenerating(false)
    }
  }, [generateJobRecommendation, setRecommendations])

  const generateAllCareerRecommendations = useCallback(async (roles: CareerRole[], userSkills: SkillAssessment[]) => {
    setIsGenerating(true)
    try {
      const newRecommendations: Record<string, MLCareerRecommendation> = {}
      for (const role of roles) {
        const recommendation = await generateCareerRecommendation(role, userSkills)
        newRecommendations[role.id] = recommendation
      }
      setCareerRecommendations(newRecommendations)
      return newRecommendations
    } finally {
      setIsGenerating(false)
    }
  }, [generateCareerRecommendation, setCareerRecommendations])

  const getTopJobRecommendations = (count: number = 5): MLJobRecommendation[] => {
    const prefs = userPreferences || { dismissedJobs: [] as string[] }
    return Object.values(recommendations || {})
      .filter(rec => !prefs.dismissedJobs.includes(rec.jobId))
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
  }

  const getTopCareerRecommendations = (count: number = 3): MLCareerRecommendation[] => {
    return Object.values(careerRecommendations || {})
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
  }

  return {
    recommendations: recommendations || {},
    careerRecommendations: careerRecommendations || {},
    userPreferences: userPreferences || { viewedJobs: [], appliedJobs: [], dismissedJobs: [], favoriteSkills: [], preferredLocations: [], preferredJobTypes: [] },
    mlModel: mlModel || { lastTrainedAt: new Date().toISOString(), userSkillVector: {}, jobPreferences: {}, interactionHistory: [] },
    isGenerating,
    trackJobInteraction,
    updateSkillPreferences,
    generateJobRecommendation,
    generateCareerRecommendation,
    generateAllJobRecommendations,
    generateAllCareerRecommendations,
    getTopJobRecommendations,
    getTopCareerRecommendations,
    setUserPreferences
  }
}
