import { useState } from 'react'
import {
  PlaneTakeoff,
  PlaneLanding,
  CheckCircle2,
  Lock,
  NotebookPen,
  StickyNote,
  Target,
  Rocket,
  Flag,
} from 'lucide-react'
import { MilestoneNoteDialog } from './MilestoneNoteDialog'
import { useMilestoneNotes } from '@/hooks/use-milestone-notes'
import type { CareerRole, SyllabusItem } from '@/types/career'

const MONTH_NAMES = ['Foundation', 'Build', 'Advanced', 'Career Ready']

function ItemTypeIcon({ type, size }: { type: SyllabusItem['type']; size?: number }) {
  const s = size ?? 14
  if (type === 'deliverable') return <Rocket size={s} />
  if (type === 'milestone')   return <Flag size={s} />
  return <Target size={s} />
}

interface LearningRoadmapProps {
  role: CareerRole
  completedItems: Set<string>
  isAuthenticated: boolean
  canSkipMonths?: number[]
  focusMonths?: number[]
  compact?: boolean
  onToggleItem?: (itemId: string) => void
  onOpenQuiz?: (quizId: string, itemId: string) => void
  onOpenProject?: (projectId: string, itemId: string) => void
}

export function LearningRoadmap({
  role,
  completedItems,
  isAuthenticated,
  canSkipMonths = [],
  focusMonths = [],
  compact = false,
  onToggleItem,
  onOpenQuiz,
  onOpenProject,
}: LearningRoadmapProps) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SyllabusItem | null>(null)
  const { hasNote, getNote } = useMilestoneNotes()

  const syllabusByMonth = {
    1: role.syllabus.filter(i => i.month === 1).sort((a, b) => a.sortOrder - b.sortOrder),
    2: role.syllabus.filter(i => i.month === 2).sort((a, b) => a.sortOrder - b.sortOrder),
    3: role.syllabus.filter(i => i.month === 3).sort((a, b) => a.sortOrder - b.sortOrder),
    4: role.syllabus.filter(i => i.month === 4).sort((a, b) => a.sortOrder - b.sortOrder),
  }

  const isUnlocked = (item: SyllabusItem, monthItems: SyllabusItem[]) => {
    const sorted = [...monthItems].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex(i => i.id === item.id)
    if (idx === 0) {
      if (item.month === 1) return true
      const prevMonth = (item.month - 1) as 1 | 2 | 3 | 4
      const prevItems = role.syllabus.filter(i => i.month === prevMonth)
      return prevItems.every(prev => completedItems.has(prev.id))
    }
    return sorted.slice(0, idx).every(prev => completedItems.has(prev.id))
  }

  const openNoteDialog = (e: React.MouseEvent, item: SyllabusItem) => {
    e.stopPropagation()
    setSelectedItem(item)
    setNoteDialogOpen(true)
  }

  const getMonthStatus = (month: number) => {
    if (canSkipMonths.includes(month)) return 'skip'
    if (focusMonths.includes(month)) return 'focus'
    return 'normal'
  }

  // ── Compact mode ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-5">
        {([1, 2, 3, 4] as const).map((month) => {
          const items = syllabusByMonth[month]
          const done = items.filter(i => completedItems.has(i.id)).length
          const pct  = items.length > 0 ? Math.round((done / items.length) * 100) : 0
          const status = getMonthStatus(month)

          return (
            <div key={month}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  M{month} · {MONTH_NAMES[month - 1]}
                </span>
                {status === 'skip'  && <span className="text-[10px] text-emerald-600 border border-emerald-200 bg-emerald-50 rounded-full px-2 py-0.5">SKIP</span>}
                {status === 'focus' && <span className="text-[10px] text-amber-600 border border-amber-200 bg-amber-50 rounded-full px-2 py-0.5">FOCUS</span>}
                <span className="ml-auto text-[10px] text-slate-400 font-medium">{pct}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="space-y-1.5">
                {items.map((item) => {
                  const isDone   = completedItems.has(item.id)
                  const unlocked = isUnlocked(item, items)
                  const itemHasNote = hasNote(role.id, item.id)
                  return (
                    <div
                      key={item.id}
                      onClick={() => unlocked && onToggleItem?.(item.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150
                        ${isDone    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : unlocked  ? 'bg-white border-slate-200 text-slate-700 cursor-pointer hover:border-blue-300 hover:bg-blue-50'
                        : 'bg-slate-50 border-slate-100 text-slate-300 opacity-50 pointer-events-none'}`}
                    >
                      <span className="flex-shrink-0">
                        {isDone       ? <CheckCircle2 size={12} className="text-emerald-600" />
                          : !unlocked ? <Lock size={12} className="text-slate-300" />
                          : <ItemTypeIcon type={item.type} size={12} />}
                      </span>
                      <span className="flex-1">{item.title}</span>
                      {itemHasNote && <StickyNote size={10} className="text-blue-400 flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {selectedItem && (
          <MilestoneNoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} roleId={role.id} item={selectedItem} />
        )}
      </div>
    )
  }

  // ── Full Flight Plan view ─────────────────────────────────────────────────
  const totalItems = role.syllabus.length
  const totalDone  = completedItems.size
  const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Flight plan header */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 flex items-center gap-4 shadow-sm">
        <PlaneTakeoff size={18} className="text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-800 mb-1.5 tracking-tight">
            {role.title} · Flight Plan
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
        <span className="text-xs font-bold text-blue-600 whitespace-nowrap font-mono">{totalDone}/{totalItems} · {overallPct}%</span>
        <PlaneLanding size={18} className={`flex-shrink-0 ${overallPct === 100 ? 'text-emerald-500' : 'text-slate-300'}`} />
      </div>

      {/* Monthly phases */}
      <div className="flex flex-col gap-0">
        {([1, 2, 3, 4] as const).map((month, monthIdx) => {
          const items   = syllabusByMonth[month]
          const done    = items.filter(i => completedItems.has(i.id)).length
          const pct     = items.length > 0 ? Math.round((done / items.length) * 100) : 0
          const allDone = done === items.length && items.length > 0
          const status  = getMonthStatus(month)

          const prevMonth = (month > 1 ? month - 1 : 1) as 1 | 2 | 3 | 4
          const moduleLocked = month > 1
            && !syllabusByMonth[prevMonth].every(i => completedItems.has(i.id))

          const phaseColor = allDone ? 'text-emerald-600'
            : moduleLocked ? 'text-slate-300'
            : status === 'focus' ? 'text-amber-600'
            : 'text-blue-600'

          return (
            <div key={month} className="flex gap-0">
              {/* Vertical timeline spine */}
              <div className="flex flex-col items-center w-10 flex-shrink-0">
                {/* Phase marker circle */}
                <div className={`w-7 h-7 rounded-full flex-shrink-0 z-10 mt-3.5 flex items-center justify-center border
                  ${allDone   ? 'bg-emerald-50 border-emerald-300'
                  : moduleLocked ? 'bg-slate-50 border-slate-200'
                  : 'bg-white border-blue-200'}`}
                >
                  {allDone
                    ? <CheckCircle2 size={14} className="text-emerald-600" />
                    : moduleLocked
                    ? <Lock size={13} className="text-slate-300" />
                    : <span className={`text-[10px] font-bold font-mono ${phaseColor}`}>{month}</span>}
                </div>
                {/* Connector line */}
                {monthIdx < 3 && (
                  <div className={`flex-1 w-px min-h-6 mt-1 mb-1 ${allDone ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                )}
              </div>

              {/* Phase content */}
              <div className="flex-1 pl-4 pb-0 pt-2" style={{ paddingBottom: monthIdx < 3 ? 0 : 24 }}>
                {/* Phase header */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {moduleLocked && <Lock size={12} className="text-slate-300 flex-shrink-0" />}
                  <span className={`text-sm font-bold tracking-tight ${phaseColor}`}>
                    Month {month} — {MONTH_NAMES[month - 1]}
                  </span>
                  {status === 'skip' && (
                    <span className="text-[10px] text-emerald-600 border border-emerald-200 bg-emerald-50 rounded-full px-2 py-0.5 tracking-wide">
                      SKIP ELIGIBLE
                    </span>
                  )}
                  {status === 'focus' && (
                    <span className="text-[10px] text-amber-600 border border-amber-200 bg-amber-50 rounded-full px-2 py-0.5 tracking-wide">
                      FOCUS AREA
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-slate-400 font-semibold font-mono">{done}/{items.length}</span>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-slate-100 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-emerald-500' : status === 'focus' ? 'bg-amber-400' : 'bg-blue-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Items list */}
                <div className="flex flex-col gap-1.5 mb-5">
                  {items.map((item, itemIdx) => {
                    const isDone   = completedItems.has(item.id)
                    const unlocked = isUnlocked(item, items)
                    const isLast   = itemIdx === items.length - 1
                    const itemHasNote   = hasNote(role.id, item.id)
                    const itemNoteData  = getNote(role.id, item.id)

                    return (
                      <div key={item.id} className="flex flex-col gap-0">
                        <div
                          onClick={() => unlocked && onToggleItem?.(item.id)}
                          className={`rounded-lg border px-4 py-3 transition-all duration-150
                            ${isDone    ? 'bg-emerald-50 border-emerald-200'
                            : unlocked  ? 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer'
                            : 'bg-slate-50 border-slate-100 opacity-40 pointer-events-none grayscale'}`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <span className={`flex-shrink-0 mt-0.5
                              ${isDone ? 'text-emerald-500' : unlocked ? 'text-slate-400' : 'text-slate-200'}`}>
                              {isDone       ? <CheckCircle2 size={15} />
                                : !unlocked ? <Lock size={15} />
                                : <ItemTypeIcon type={item.type} size={15} />}
                            </span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-xs font-semibold leading-snug tracking-tight
                                  ${isDone ? 'text-emerald-700' : unlocked ? 'text-slate-900' : 'text-slate-300'}`}>
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-slate-400 border border-slate-200 rounded-full px-1.5 py-0.5 font-mono">W{item.week}</span>
                                {item.type === 'deliverable' && (
                                  <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5 font-semibold">PROJECT</span>
                                )}
                                {item.type === 'milestone' && (
                                  <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5 font-semibold">MILESTONE</span>
                                )}
                                {isDone && (
                                  <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5 font-semibold ml-auto">✓ DONE</span>
                                )}
                              </div>
                              <p className={`text-xs leading-relaxed ${isDone ? 'text-emerald-600/70' : 'text-slate-500'}`}>
                                {item.description}
                              </p>

                              {/* Note preview */}
                              {itemHasNote && itemNoteData && (
                                <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                                  <StickyNote size={11} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{itemNoteData.content}</span>
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex-shrink-0 flex flex-col gap-1.5 items-end">
                              {item.quizId && onOpenQuiz && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onOpenQuiz(item.quizId!, item.id) }}
                                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-blue-600 border border-blue-200 rounded-md hover:bg-blue-600 hover:text-white transition-all duration-150"
                                >
                                  QUIZ →
                                </button>
                              )}
                              {item.projectId && onOpenProject && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onOpenProject(item.projectId!, item.id) }}
                                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-red-600 border border-red-200 rounded-md hover:bg-red-600 hover:text-white transition-all duration-150"
                                >
                                  BUILD →
                                </button>
                              )}
                              {isAuthenticated && (
                                <button
                                  type="button"
                                  onClick={(e) => openNoteDialog(e, item)}
                                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-500 border border-slate-200 rounded-md hover:bg-slate-100 transition-all duration-150"
                                >
                                  <NotebookPen size={10} />
                                  {itemHasNote ? 'EDIT' : 'NOTE'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Connector between items */}
                        {!isLast && (
                          <div className="pl-4">
                            <div className={`w-px h-2 ${isDone ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer destination */}
      <div className={`rounded-xl border px-5 py-4 flex items-center gap-3
        ${overallPct === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'} shadow-sm`}>
        <PlaneLanding size={18} className={overallPct === 100 ? 'text-emerald-500' : 'text-slate-300'} />
        <div>
          <div className={`text-xs font-semibold ${overallPct === 100 ? 'text-emerald-700' : 'text-slate-800'}`}>
            {overallPct === 100 ? 'Destination reached — Career Ready!' : `${role.title} · Destination`}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {overallPct === 100 ? 'All milestones complete. Time to apply!' : `${totalItems - totalDone} items remaining`}
          </div>
        </div>
      </div>

      {selectedItem && (
        <MilestoneNoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} roleId={role.id} item={selectedItem} />
      )}
    </div>
  )
}
