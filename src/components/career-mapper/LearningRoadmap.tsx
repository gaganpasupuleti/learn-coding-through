import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CheckCircle, Target, BookOpen, FlagCheckered, NotePencil, Note } from '@phosphor-icons/react'
import { MilestoneNoteDialog } from './MilestoneNoteDialog'
import { useMilestoneNotes } from '@/hooks/use-milestone-notes'
import type { CareerRole, SyllabusItem } from '@/types/career'

interface LearningRoadmapProps {
  role: CareerRole
  completedItems: Set<string>
  isAuthenticated: boolean
  canSkipMonths?: number[]
  focusMonths?: number[]
  compact?: boolean
  /** Optional: called when user clicks an item card to toggle completion */
  onToggleItem?: (itemId: string) => void
}

export function LearningRoadmap({
  role,
  completedItems,
  isAuthenticated,
  canSkipMonths = [],
  focusMonths = [],
  compact = false,
  onToggleItem,
}: LearningRoadmapProps) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SyllabusItem | null>(null)
  const { hasNote, getNote } = useMilestoneNotes()

  const syllabusByMonth = {
    1: role.syllabus.filter(item => item.month === 1).sort((a, b) => a.sortOrder - b.sortOrder),
    2: role.syllabus.filter(item => item.month === 2).sort((a, b) => a.sortOrder - b.sortOrder),
    3: role.syllabus.filter(item => item.month === 3).sort((a, b) => a.sortOrder - b.sortOrder),
    4: role.syllabus.filter(item => item.month === 4).sort((a, b) => a.sortOrder - b.sortOrder),
  }

  const openNoteDialog = (item: SyllabusItem) => {
    setSelectedItem(item)
    setNoteDialogOpen(true)
  }

  const getItemIcon = (item: SyllabusItem, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle weight="fill" className="text-accent" size={compact ? 18 : 24} />
    if (item.type === 'deliverable') return <Target className="text-primary" size={compact ? 18 : 24} />
    if (item.type === 'milestone') return <FlagCheckered className="text-primary" size={compact ? 18 : 24} />
    return <BookOpen className="text-muted-foreground" size={compact ? 18 : 24} />
  }

  const getMonthStatus = (month: number) => {
    if (canSkipMonths.includes(month)) return 'skip'
    if (focusMonths.includes(month)) return 'focus'
    return 'normal'
  }

  const getMonthColor = (status: string) => {
    if (status === 'skip') return 'border-green-300 bg-green-50/50'
    if (status === 'focus') return 'border-accent bg-accent/5'
    return 'border-border bg-card'
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <Accordion type="multiple" defaultValue={['1']} className="space-y-2">
          {([1, 2, 3, 4] as const).map((month) => {
            const monthStatus = getMonthStatus(month)
            const items = syllabusByMonth[month]
            const monthComplete = items.every(item => completedItems.has(item.id))
            const monthProgress = items.length > 0
              ? (items.filter(item => completedItems.has(item.id)).length / items.length) * 100
              : 0

            return (
              <AccordionItem key={month} value={month.toString()} className="border rounded-lg px-3">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 ${monthComplete ? 'bg-accent border-accent text-accent-foreground' : 'bg-card border-primary text-primary'}`}>
                      {monthComplete ? <CheckCircle weight="fill" size={20} /> : month}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">Month {month}</h4>
                        {monthStatus === 'skip' && <Badge className="bg-green-500 text-white border-0 px-1.5 py-0 text-xs h-4">Skip</Badge>}
                        {monthStatus === 'focus' && <Badge className="bg-accent text-accent-foreground border-0 px-1.5 py-0 text-xs h-4">Focus</Badge>}
                      </div>
                      {isAuthenticated && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${monthProgress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{Math.round(monthProgress)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3 pt-1">
                  <div className="space-y-2">
                    {items.map((item) => {
                      const isCompleted = completedItems.has(item.id)
                      const itemHasNote = hasNote(role.id, item.id)
                      const itemNote = getNote(role.id, item.id)
                      return (
                        <Card
                          key={item.id}
                          className={`p-3 transition-all duration-200 ${isCompleted ? 'border-accent/50 bg-accent/5' : getMonthColor(monthStatus)} ${onToggleItem ? 'cursor-pointer hover:shadow-sm' : ''}`}
                          onClick={() => onToggleItem?.(item.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">{getItemIcon(item, isCompleted)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <h5 className="font-medium text-sm">{item.title}</h5>
                                <Badge variant="outline" className="text-xs h-4 px-1">W{item.week}</Badge>
                                {item.type === 'deliverable' && <Badge className="text-xs h-4 px-1.5 bg-primary text-primary-foreground">Project</Badge>}
                                {item.type === 'milestone' && <Badge className="text-xs h-4 px-1.5 bg-accent text-accent-foreground">Milestone</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.description}</p>
                              {itemHasNote && itemNote && (
                                <div className="mb-2 p-2 bg-accent/5 border border-accent/20 rounded">
                                  <div className="flex items-start gap-2">
                                    <Note className="text-accent flex-shrink-0 mt-0.5" size={12} weight="fill" />
                                    <p className="text-xs text-muted-foreground line-clamp-1">{itemNote.content}</p>
                                  </div>
                                </div>
                              )}
                              {isAuthenticated && (
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openNoteDialog(item) }} className="gap-1.5 h-6 text-xs px-2 -ml-2">
                                  <NotePencil size={12} />
                                  {itemHasNote ? 'Edit' : 'Note'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
        {selectedItem && (
          <MilestoneNoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} roleId={role.id} item={selectedItem} />
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary opacity-20 rounded-full hidden md:block" />
      <div className="space-y-8">
        {([1, 2, 3, 4] as const).map((month, monthIndex) => {
          const monthStatus = getMonthStatus(month)
          const items = syllabusByMonth[month]
          const monthComplete = items.every(item => completedItems.has(item.id))
          const monthProgress = items.length > 0
            ? (items.filter(item => completedItems.has(item.id)).length / items.length) * 100
            : 0

          return (
            <div key={month} className="relative">
              <div className="flex items-start gap-6">
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center font-bold text-xl ${monthComplete ? 'bg-accent border-accent text-accent-foreground' : 'bg-card border-primary text-primary'} shadow-lg transition-all duration-300`}>
                    {monthComplete ? <CheckCircle weight="fill" size={32} /> : month}
                  </div>
                  {monthStatus === 'skip' && <Badge className="absolute -top-2 -right-2 bg-green-500 text-white border-0 px-1.5 py-0.5 text-xs">Skip</Badge>}
                  {monthStatus === 'focus' && <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground border-0 px-1.5 py-0.5 text-xs">Focus</Badge>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold">Month {month}</h3>
                      {isAuthenticated && <span className="text-sm font-semibold text-muted-foreground">{Math.round(monthProgress)}% Complete</span>}
                    </div>
                    {isAuthenticated && (
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${monthProgress}%` }} />
                      </div>
                    )}
                    {monthStatus === 'skip' && <p className="text-sm text-green-700 mt-2 font-medium">✓ You already know these skills - feel free to skip or use as review</p>}
                    {monthStatus === 'focus' && <p className="text-sm text-accent-foreground mt-2 font-medium">⚡ Key learning area - dedicate extra time here</p>}
                  </div>
                  <div className="space-y-3">
                    {items.map((item, itemIndex) => {
                      const isCompleted = completedItems.has(item.id)
                      const isLast = itemIndex === items.length - 1
                      const itemHasNote = hasNote(role.id, item.id)
                      const itemNote = getNote(role.id, item.id)
                      return (
                        <div key={item.id} className="relative">
                          <Card
                            className={`p-4 transition-all duration-300 hover:shadow-md ${isCompleted ? 'border-accent/50 bg-accent/5' : getMonthColor(monthStatus)} ${onToggleItem ? 'cursor-pointer' : ''}`}
                            onClick={() => onToggleItem?.(item.id)}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-0.5">{getItemIcon(item, isCompleted)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className={`font-semibold ${isCompleted ? 'text-foreground' : ''}`}>{item.title}</h4>
                                  <Badge variant="outline" className="text-xs">Week {item.week}</Badge>
                                  {item.type === 'deliverable' && <Badge className="text-xs bg-primary text-primary-foreground">Project</Badge>}
                                  {item.type === 'milestone' && <Badge className="text-xs bg-accent text-accent-foreground">Milestone</Badge>}
                                  {isCompleted && <Badge className="text-xs bg-accent/20 text-accent-foreground border-accent">✓ Completed</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                                {itemHasNote && itemNote && (
                                  <div className="mb-3 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <Note className="text-accent flex-shrink-0 mt-0.5" size={16} weight="fill" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-accent-foreground mb-1">Your Note:</p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{itemNote.content}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {isAuthenticated && (
                                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openNoteDialog(item) }} className="gap-2 h-8 text-xs">
                                    <NotePencil size={14} />
                                    {itemHasNote ? 'Edit Note' : 'Add Note'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                          {!isLast && (
                            <div className="flex justify-center py-2">
                              <div className={`h-6 w-0.5 rounded-full border-l-2 border-dashed ${monthStatus === 'skip' ? 'border-green-300' : monthStatus === 'focus' ? 'border-accent' : 'border-muted'}`} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              {monthIndex < 3 && (
                <div className="flex justify-start ml-8 my-6">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-8 w-0.5 bg-gradient-to-b from-primary to-accent rounded-full" />
                    <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
                    <div className="h-8 w-0.5 bg-gradient-to-b from-accent to-primary rounded-full" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-8 text-center">
        <Card className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FlagCheckered className="text-primary" size={32} weight="fill" />
            <h3 className="text-2xl font-bold">Career Ready!</h3>
          </div>
          <p className="text-muted-foreground">Complete all milestones to become job-ready in {role.title}</p>
        </Card>
      </div>
      {selectedItem && (
        <MilestoneNoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} roleId={role.id} item={selectedItem} />
      )}
    </div>
  )
}
