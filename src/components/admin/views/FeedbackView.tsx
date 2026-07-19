import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { formatDateTimeIST } from '@/lib/formatDateTimeIST'
import { cn } from '@/lib/utils'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { StatusBadge } from '../widgets/StatusBadge'

import {
  adminPaneCardClass,
  adminPaneHeaderClass,
  adminPaneScrollBodyClass,
  adminSectionRootClass,
} from './dashboardPolish'

type FeedbackFilter = 'pending' | 'all'

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  concern: 'Concern',
  bug: 'Bug',
  suggestion: 'Suggestion',
}

export function FeedbackView() {
  const { feedbackEntries, isLoading, reviewFeedback } = useAdminWorkspaceContext()
  const [filter, setFilter] = useState<FeedbackFilter>('pending')
  const [notesById, setNotesById] = useState<Record<number, string>>({})
  const [reviewingId, setReviewingId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return feedbackEntries
    return feedbackEntries.filter((e) => e.status === 'pending')
  }, [feedbackEntries, filter])

  const pendingCount = feedbackEntries.filter((e) => e.status === 'pending').length

  const handleReview = async (id: number) => {
    try {
      setReviewingId(id)
      await reviewFeedback(id, notesById[id]?.trim() || null)
      toast.success('Marked as reviewed')
      setNotesById((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update feedback')
    } finally {
      setReviewingId(null)
    }
  }

  return (
    <div className={adminSectionRootClass}>
      <Card className={cn(adminPaneCardClass, 'min-h-0 flex-1 p-0')}>
        <div className={cn(adminPaneHeaderClass, 'flex flex-wrap items-center justify-between gap-2')}>
          <span>Student feedback</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={cn(
                'rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors',
                filter === 'pending'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors',
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              All ({feedbackEntries.length})
            </button>
          </div>
        </div>

        <div className={cn(adminPaneScrollBodyClass, 'space-y-3')}>
          {filtered.map((entry) => (
            <div key={entry.id} className="rounded-md border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.student_name}</p>
                  <p className="text-[11px] text-muted-foreground">{entry.student_email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge text={CATEGORY_LABELS[entry.category] ?? entry.category} />
                  <StatusBadge text={entry.status} />
                </div>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-foreground">
                {entry.message}
              </p>

              <p className="mt-2 text-[10px] text-muted-foreground">
                {entry.created_at_ist ?? formatDateTimeIST(entry.created_at)}
              </p>

              {entry.status === 'reviewed' && entry.admin_notes ? (
                <p className="mt-2 rounded-md bg-muted/50 p-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Admin note: </span>
                  {entry.admin_notes}
                </p>
              ) : null}

              {entry.status === 'reviewed' && entry.reviewed_at ? (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Reviewed {entry.reviewed_at_ist ?? formatDateTimeIST(entry.reviewed_at)}
                </p>
              ) : null}

              {entry.status === 'pending' ? (
                <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                  <Textarea
                    placeholder="Optional note for your team (not sent to student)"
                    rows={2}
                    className="resize-none text-xs"
                    value={notesById[entry.id] ?? ''}
                    onChange={(e) =>
                      setNotesById((prev) => ({ ...prev, [entry.id]: e.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={isLoading || reviewingId === entry.id}
                    onClick={() => void handleReview(entry.id)}
                  >
                    {reviewingId === entry.id ? 'Saving…' : 'Mark reviewed'}
                  </Button>
                </div>
              ) : null}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-[11px] text-muted-foreground">
              {filter === 'pending' ? 'No pending feedback.' : 'No feedback submissions yet.'}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
