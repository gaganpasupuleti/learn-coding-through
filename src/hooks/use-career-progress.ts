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

  const markComplete = (itemId: string) => {
    setProgress(current => {
      const cp = current || safeProgress
      if (cp.completedItems[itemId] === true) return cp
      return {
        ...cp,
        completedItems: { ...cp.completedItems, [itemId]: true },
        lastUpdated: new Date().toISOString(),
      }
    })
  }

  const isCompleted = (itemId: string) => safeProgress.completedItems[itemId] || false

  const getCompletionPercentage = (totalItems: number) => {
    const completed = Object.values(safeProgress.completedItems).filter(Boolean).length
    return totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0
  }

  /**
   * An item is unlocked when:
   * - First item of month N > 1: all items in month N-1 are complete
   * - Otherwise: all lower-sortOrder items in the same month are complete
   * Pass allSyllabus to enable cross-month gating.
   */
  const isUnlocked = (item: SyllabusItem, allMonthItems: SyllabusItem[], allSyllabus?: SyllabusItem[]) => {
    const sorted = [...allMonthItems].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex(i => i.id === item.id)
    if (idx === 0) {
      if (item.month === 1) return true
      if (allSyllabus) {
        const prevMonth = (item.month - 1) as 1 | 2 | 3 | 4
        const prevItems = allSyllabus.filter(i => i.month === prevMonth)
        return prevItems.every(prev => safeProgress.completedItems[prev.id] === true)
      }
      return true
    }
    return sorted.slice(0, idx).every(prev => safeProgress.completedItems[prev.id] === true)
  }

  return {
    progress: safeProgress,
    toggleItem,
    markComplete,
    isCompleted,
    isUnlocked,
    getCompletionPercentage
  }
}
