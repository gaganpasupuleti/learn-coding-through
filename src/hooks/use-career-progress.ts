import { useKV } from '@github/spark/hooks'
import type { UserProgress, SyllabusItem } from '@/types/career'

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

  /**
   * An item is unlocked when all items with a lower sortOrder in the same month
   * are already completed. The first item in each month is always unlocked.
   */
  const isUnlocked = (item: SyllabusItem, allMonthItems: SyllabusItem[]) => {
    const sorted = [...allMonthItems].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex(i => i.id === item.id)
    if (idx <= 0) return true
    return sorted.slice(0, idx).every(prev => safeProgress.completedItems[prev.id] === true)
  }

  return {
    progress: safeProgress,
    toggleItem,
    isCompleted,
    isUnlocked,
    getCompletionPercentage
  }
}
