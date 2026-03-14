import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { NotePencil, Trash } from '@phosphor-icons/react'
import { useMilestoneNotes } from '@/hooks/use-milestone-notes'
import { toast } from 'sonner'
import type { SyllabusItem } from '@/types/career'

interface MilestoneNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleId: string
  item: SyllabusItem
  onSaved?: () => void
}

export function MilestoneNoteDialog({ 
  open, 
  onOpenChange, 
  roleId, 
  item,
  onSaved 
}: MilestoneNoteDialogProps) {
  const { getNote, saveNote, deleteNote, hasNote } = useMilestoneNotes()
  const [noteContent, setNoteContent] = useState('')

  useEffect(() => {
    if (open) {
      const existingNote = getNote(roleId, item.id)
      setNoteContent(existingNote?.content || '')
    }
  }, [open, roleId, item.id, getNote])

  const handleSave = () => {
    if (!noteContent.trim()) {
      toast.error('Please enter a note')
      return
    }

    saveNote(roleId, item.id, noteContent.trim())
    toast.success('Note saved successfully')
    onSaved?.()
    onOpenChange(false)
  }

  const handleDelete = () => {
    deleteNote(roleId, item.id)
    toast.success('Note deleted')
    setNoteContent('')
    onSaved?.()
    onOpenChange(false)
  }

  const existingNote = hasNote(roleId, item.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NotePencil size={24} className="text-accent" />
            {existingNote ? 'Edit Note' : 'Add Note'}
          </DialogTitle>
          <DialogDescription>
            Add personal notes or comments about: <strong>{item.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note-content">Your Note</Label>
            <Textarea
              id="note-content"
              placeholder="Add your thoughts, resources, progress updates, or any helpful information..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {noteContent.length} characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {existingNote && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="gap-2 mr-auto"
            >
              <Trash size={16} />
              Delete Note
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
