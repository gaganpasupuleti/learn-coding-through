import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { submitStudentFeedback, type FeedbackCategory } from '@/lib/api'

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'concern', label: 'Concern / issue' },
  { value: 'bug', label: 'Bug' },
  { value: 'suggestion', label: 'Suggestion' },
]

const MAX_MESSAGE = 2000
const MIN_MESSAGE = 10

interface SubmitFeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmitFeedbackDialog({ open, onOpenChange }: SubmitFeedbackDialogProps) {
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const trimmed = message.trim()
  const canSubmit = trimmed.length >= MIN_MESSAGE && trimmed.length <= MAX_MESSAGE && !submitting

  const resetForm = () => {
    setCategory('general')
    setMessage('')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && !submitting) resetForm()
    onOpenChange(next)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      setSubmitting(true)
      await submitStudentFeedback({ category, message: trimmed })
      toast.success('Thank you — your feedback was submitted.')
      resetForm()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Share your response, concerns, or ideas. Our team reviews every submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="feedback-category">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as FeedbackCategory)}
            >
              <SelectTrigger id="feedback-category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="feedback-message">Message</Label>
              <span className="text-xs text-gray-500">
                {trimmed.length}/{MAX_MESSAGE}
              </span>
            </div>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
              placeholder="Tell us what's on your mind…"
              rows={5}
              className="resize-none"
            />
            {trimmed.length > 0 && trimmed.length < MIN_MESSAGE && (
              <p className="text-xs text-amber-600">
                Please write at least {MIN_MESSAGE} characters.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={!canSubmit}>
            {submitting ? 'Sending…' : 'Submit feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
