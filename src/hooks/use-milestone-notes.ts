import { useKV } from '@github/spark/hooks'
import type { MilestoneNote } from '@/types/career'

export function useMilestoneNotes() {
  const [notes, setNotes] = useKV<Record<string, MilestoneNote>>('milestone-notes', {})

  const getNoteKey = (roleId: string, itemId: string) => `${roleId}:${itemId}`

  const getNote = (roleId: string, itemId: string): MilestoneNote | undefined => {
    const key = getNoteKey(roleId, itemId)
    return notes?.[key]
  }

  const hasNote = (roleId: string, itemId: string): boolean => {
    const key = getNoteKey(roleId, itemId)
    return !!(notes?.[key]?.content)
  }

  const saveNote = (roleId: string, itemId: string, content: string) => {
    const key = getNoteKey(roleId, itemId)
    const existingNote = notes?.[key]
    const now = new Date().toISOString()

    setNotes((currentNotes) => ({
      ...(currentNotes || {}),
      [key]: {
        id: existingNote?.id || `note-${Date.now()}`,
        itemId,
        roleId,
        content,
        createdAt: existingNote?.createdAt || now,
        updatedAt: now
      }
    }))
  }

  const deleteNote = (roleId: string, itemId: string) => {
    const key = getNoteKey(roleId, itemId)
    setNotes((currentNotes) => {
      const updated = { ...(currentNotes || {}) }
      delete updated[key]
      return updated
    })
  }

  const getRoleNotes = (roleId: string): MilestoneNote[] => {
    if (!notes) return []
    return Object.values(notes).filter(note => note.roleId === roleId)
  }

  return {
    getNote,
    hasNote,
    saveNote,
    deleteNote,
    getRoleNotes
  }
}
