import type { CareerRole } from '@/types/career'
import { CAREER_ROLES } from './career-data'

/**
 * Project-to-Node Mastery Mapping
 * Each project helps master specific nodes in the learning roadmap
 */
export const PROJECT_NODE_MASTERY: Record<string, string[]> = {
  'digital-clock': [
    'jsBasics-item',      // Learn JavaScript basics
    'dom-item',           // Learn DOM manipulation
  ],
  'calculator': [
    'jsBasics-item',      // Reinforce JavaScript
    'dom-item',           // More DOM manipulation
    'state-item',         // State management patterns
  ],
  'temperature-converter': [
    'jsBasics-item',      // JavaScript fundamentals
    'dom-item',           // DOM manipulation
    'responsive-item',    // Responsive design
  ],
  
}

/**
 * Get nodes that are mastered by completing a specific project
 */
export function getNodesMasteredByProject(projectId: string): string[] {
  return PROJECT_NODE_MASTERY[projectId] || []
}

/**
 * Get all nodes mastered based on a list of completed projects
 */
export function getMasteredNodes(completedProjects: string[]): Set<string> {
  const mastered = new Set<string>()
  completedProjects.forEach(projectId => {
    getNodesMasteredByProject(projectId).forEach(node => mastered.add(node))
  })
  return mastered
}

/**
 * Calculate skill gap for a role based on mastered nodes
 */
export interface NodeSkillGap {
  roleId: string
  roleName: string
  masteredNodes: Set<string>
  requiredNodes: Set<string>
  missingNodes: Set<string>
  completionPercentage: number
  readinessScore: number
  missingProjectSuggestions: ProjectSuggestion[]
}

export interface ProjectSuggestion {
  projectId: string
  projectName: string
  nodesCovered: string[]
  priorityScore: number
}

/**
 * Calculate comprehensive skill gap report
 */
export function calculateNodeSkillGap(
  roleId: string,
  completedProjects: string[]
): NodeSkillGap | null {
  const role = CAREER_ROLES.find(r => r.id === roleId) as any
  if (!role) return null

  const masteredNodes = getMasteredNodes(completedProjects)
  const requiredNodesSet = new Set(role.roadmapNodes)

  // Find missing nodes
  const missingNodes = new Set<string>()
  requiredNodesSet.forEach(node => {
    if (!masteredNodes.has(node)) {
      missingNodes.add(node)
    }
  })

  // Calculate completion percentage
  const completionPercentage = requiredNodesSet.size > 0
    ? Math.round((masteredNodes.size / requiredNodesSet.size) * 100)
    : 0

  // Calculate readiness score (0-100)
  const readinessScore = Math.min(completionPercentage, 100)

  // Find project suggestions for missing nodes
  const missingProjectSuggestions = getProjectSuggestionsForMissingNodes(
    missingNodes,
    role.requiredProjects
  )

  return {
    roleId,
    roleName: role.title,
    masteredNodes,
    requiredNodes: requiredNodesSet,
    missingNodes,
    completionPercentage,
    readinessScore,
    missingProjectSuggestions,
  }
}

/**
 * Get project suggestions for missing nodes
 */
function getProjectSuggestionsForMissingNodes(
  missingNodes: Set<string>,
  availableProjects: string[]
): ProjectSuggestion[] {
  const suggestions: Map<string, ProjectSuggestion> = new Map()

  // Iterate through available projects
  availableProjects.forEach(projectId => {
    const nodesMastered = getNodesMasteredByProject(projectId)
    const coversMissingNodes = nodesMastered.filter(node => missingNodes.has(node))

    if (coversMissingNodes.length > 0) {
      const priorityScore = coversMissingNodes.length
      suggestions.set(projectId, {
        projectId,
        projectName: getProjectDisplayName(projectId),
        nodesCovered: coversMissingNodes,
        priorityScore,
      })
    }
  })

  // Sort by priority (most nodes covered first)
  return Array.from(suggestions.values()).sort((a, b) => b.priorityScore - a.priorityScore)
}

/**
 * Get human-readable project name
 */
function getProjectDisplayName(projectId: string): string {
  const names: Record<string, string> = {
    'digital-clock': 'Digital Clock',
    'calculator': 'Calculator',
    'temperature-converter': 'Temperature Converter',
  }
  return names[projectId] || projectId
}

/**
 * Generate personalized skill gap message
 */
export function generateSkillGapMessage(gap: NodeSkillGap): string {
  const { roleName, masteredNodes, missingNodes, missingProjectSuggestions } = gap

  if (missingNodes.size === 0) {
    return `🎉 Excellent! You've mastered all nodes needed to become a ${roleName}. Time to apply!`
  }

  const masteredCount = masteredNodes.size
  const totalCount = gap.requiredNodes.size

  let message = `To become a ${roleName}, you have mastered ${masteredCount}/${totalCount} nodes. `

  if (missingProjectSuggestions.length > 0) {
    const topSuggestion = missingProjectSuggestions[0]
    const missingNodesList = Array.from(missingNodes).slice(0, 2).join(', ')
    message += `You're missing ${missingNodesList}. Try the ${topSuggestion.projectName} project next to accelerate your progress.`
  } else {
    message += `Focus on mastering the remaining nodes to complete your journey.`
  }

  return message
}

/**
 * Get top 3 career recommendations based on node mastery
 */
export interface CareerRecommendation {
  roleId: string
  roleName: string
  matchScore: number
  masteredPercentage: number
  nextStepsCount: number
  suggestion: string
}

export function getCareerRecommendations(
  completedProjects: string[]
): CareerRecommendation[] {
  const recommendations: CareerRecommendation[] = []

  CAREER_ROLES.forEach(role => {
    const gap = calculateNodeSkillGap(role.id, completedProjects)
    if (!gap) return

    const matchScore = gap.completionPercentage
    const nextStepsCount = gap.missingNodes.size

    // Calculate recommendation based on readiness
    let suggestion = ''
    if (matchScore >= 75) {
      suggestion = `Perfect fit! You're ${matchScore}% ready.`
    } else if (matchScore >= 50) {
      suggestion = `Good foundation. Only ${nextStepsCount} more nodes to master.`
    } else if (matchScore >= 25) {
      suggestion = `Potential match. Build your foundation with projects.`
    } else {
      suggestion = `Explore this path with beginner-friendly projects.`
    }

    recommendations.push({
      roleId: role.id,
      roleName: role.title,
      matchScore,
      masteredPercentage: matchScore,
      nextStepsCount,
      suggestion,
    })
  })

  // Sort by match score and return top recommendations
  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5)
}
