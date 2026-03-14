import { useKV } from '@github/spark/hooks'
import type { UserProgress } from '@/types/career'

export function useCareerProgress(roleId: string) {
  const [progress, setProgress] = useKV<UserProgress>(`career-progress-${roleId}`, {
    roleId,
    completedItems: {},
    lastUpdated: new Date().toISOString()
  })

  const safeProgress = progress || { roleId, completedItems: {}, lastUpdated: new Date().toISOString() }

  const toggleItem = (itemId: string) => {
    setProgress(current => {
      const currentProgress = current || safeProgress
      const newCompleted = { ...currentProgress.completedItems }
      newCompleted[itemId] = !newCompleted[itemId]
      return {
        ...currentProgress,
        completedItems: newCompleted,
        lastUpdated: new Date().toISOString()
      }
    })
  }

  const isCompleted = (itemId: string) => safeProgress.completedItems[itemId] || false

  const getCompletionPercentage = (totalItems: number) => {
    const completed = Object.values(safeProgress.completedItems).filter(Boolean).length
    return totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0
  }

  return {
    progress: safeProgress,
    toggleItem,
    isCompleted,
    getCompletionPercentage
  }
}
