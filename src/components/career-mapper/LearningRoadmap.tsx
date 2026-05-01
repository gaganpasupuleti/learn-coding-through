import { useState, useEffect } from 'react'
import {
  AirplaneTakeoff,
  AirplaneLanding,
  CheckCircle,
  Lock,
  NotePencil,
  Note,
  Target,
  Rocket,
  Flag,
} from '@phosphor-icons/react'
import { MilestoneNoteDialog } from './MilestoneNoteDialog'
import { useMilestoneNotes } from '@/hooks/use-milestone-notes'
import type { CareerRole, SyllabusItem } from '@/types/career'

// ── Design tokens for the Flight Plan ───────────────────────────────────────
const T = {
  bg:          'transparent',
  surface:     'hsl(var(--card))',
  surfaceHover:'hsl(var(--muted))',
  border:      'hsl(var(--border))',
  borderFocus: 'hsl(var(--ring))',
  done:        '#f0fdf4',
  doneBorder:  '#bbf7d0',
  locked:      'hsl(var(--muted))',
  lockedBorder:'hsl(var(--border))',
  skip:        '#f0fdf4',
  skipBorder:  '#bbf7d0',
  focus:       '#fffbeb',
  focusBorder: '#fde68a',
  textPrimary: 'hsl(var(--foreground))',
  textSub:     'hsl(var(--muted-foreground))',
  textDone:    '#15803d',
  textLocked:  '#94a3b8',
  accent:      'hsl(var(--primary))',
  accentDim:   'hsl(var(--secondary))',
  lineColor:   'hsl(var(--border))',
  lineDone:    '#22c55e',
  fontMono:    'var(--font-mono)',
  fontSans:    'var(--font-inter)',
} as const

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

const MONTH_NAMES = ['Foundation', 'Build', 'Advanced', 'Career Ready']

function ItemTypeIcon({ type, size }: { type: SyllabusItem['type']; size?: number }) {
  const s = size ?? 14
  if (type === 'deliverable') return <Rocket size={s} />
  if (type === 'milestone')   return <Flag size={s} />
  return <Target size={s} />
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
  const [masteryStatuses, setMasteryStatuses] = useState<Record<string, boolean>>({})

  // Fetch mastery status from the backend
  useEffect(() => {
    const fetchMasteries = async () => {
      const statuses: Record<string, boolean> = {}
      for (const item of role.syllabus) {
        if (item.quizId || item.projectId) {
          let url = `/api/v1/progress/mastery/${item.id}?`
          if (item.quizId) url += `quiz_slug=${item.quizId}&`
          if (item.projectId) url += `project_slug=${item.projectId}`
          try {
            const res = await fetch(url)
            if (res.ok) {
              const data = await res.json()
              if (data.status === 'completed') {
                statuses[item.id] = true
              }
            }
          } catch (e) {
            console.error('Failed to fetch mastery status', e)
          }
        }
      }
      setMasteryStatuses(statuses)
    }
    fetchMasteries()
  }, [role.syllabus])

  const syllabusByMonth = {
    1: role.syllabus.filter(i => i.month === 1).sort((a, b) => a.sortOrder - b.sortOrder),
    2: role.syllabus.filter(i => i.month === 2).sort((a, b) => a.sortOrder - b.sortOrder),
    3: role.syllabus.filter(i => i.month === 3).sort((a, b) => a.sortOrder - b.sortOrder),
    4: role.syllabus.filter(i => i.month === 4).sort((a, b) => a.sortOrder - b.sortOrder),
  }

  // An item is unlocked when:
  // - first of month N > 1: all items in month N-1 are complete
  // - otherwise: all lower-sortOrder items in the same month are complete
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

  // ── Compact mode (used inside accordions elsewhere) ──────────────────────
  if (compact) {
    return (
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
        {([1, 2, 3, 4] as const).map((month) => {
          const items = syllabusByMonth[month]
          const done = items.filter(i => completedItems.has(i.id)).length
          const pct  = items.length > 0 ? Math.round((done / items.length) * 100) : 0
          const status = getMonthStatus(month)

          return (
            <div key={month} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: T.textSub }}>
                  M{month} · {MONTH_NAMES[month - 1].toUpperCase()}
                </span>
                {status === 'skip'  && <span style={{ fontSize: 9, color: T.textDone, border: `1px solid ${T.doneBorder}`, borderRadius: 3, padding: '1px 5px' }}>SKIP</span>}
                {status === 'focus' && <span style={{ fontSize: 9, color: '#d97706', border: '1px solid #fde68a', borderRadius: 3, padding: '1px 5px' }}>FOCUS</span>}
                <span style={{ marginLeft: 'auto', fontSize: 9, color: T.textSub }}>{pct}%</span>
              </div>
              <div style={{ height: 1, background: T.border, marginBottom: 8 }}>
                <div style={{ height: 1, background: T.accent, width: `${pct}%`, transition: 'width 0.5s' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.map((item) => {
                  const isDone = (item.quizId || item.projectId) ? !!masteryStatuses[item.id] : completedItems.has(item.id)
                  const unlocked  = isUnlocked(item, items)
                  const itemHasNote = hasNote(role.id, item.id)
                  return (
                      <div
                        key={item.id}
                        onClick={() => {
                          // Removed local onClick completion toggle to enforce backend mastery check
                        }}
                        style={{
                          padding: '6px 10px',
                          border: `1px solid ${isDone ? T.doneBorder : unlocked ? T.border : T.lockedBorder}`,
                          borderRadius: 6,
                          background: isDone ? T.done : unlocked ? T.surface : T.locked,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          cursor: unlocked && onToggleItem && !(item.quizId || item.projectId) ? 'pointer' : 'default',
                        opacity: unlocked ? 1 : 0.3,
                        filter: unlocked ? 'none' : 'grayscale(1)',
                        pointerEvents: unlocked ? 'auto' : 'none',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                      <span style={{ color: isDone ? T.textDone : unlocked ? T.textSub : T.textLocked, flexShrink: 0 }}>
                        {isDone        ? <CheckCircle size={12} weight="fill" />
                          : !unlocked  ? <Lock size={12} />
                          : <ItemTypeIcon type={item.type} size={12} />}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isDone ? T.textDone : T.textPrimary, flex: 1, letterSpacing: '-0.01em' }}>
                        {item.title}
                      </span>
                      {itemHasNote && <Note size={10} style={{ color: T.accent, flexShrink: 0 }} weight="fill" />}
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
    <div style={{ background: T.bg, fontFamily: 'inherit' }}>
      {/* Flight plan header */}
      <div style={{
        border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 20px',
        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
      }}>
        <AirplaneTakeoff size={20} style={{ color: T.accent, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em', color: T.textPrimary, marginBottom: 4 }}>
            {role.title} · Flight Plan
          </div>
          <div style={{ height: 2, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: 2, background: T.accent, width: `${overallPct}%`, transition: 'width 0.5s', borderRadius: 2 }} />
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, whiteSpace: 'nowrap', fontFamily: T.fontMono }}>
          {totalDone}/{totalItems} · {overallPct}%
        </span>
        <AirplaneLanding size={20} style={{ color: overallPct === 100 ? T.textDone : T.textSub, flexShrink: 0 }} />
      </div>

      {/* Monthly phases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {([1, 2, 3, 4] as const).map((month, monthIdx) => {
          const items   = syllabusByMonth[month]
          const done    = items.filter(i => completedItems.has(i.id)).length
          const pct     = items.length > 0 ? Math.round((done / items.length) * 100) : 0
          const allDone = done === items.length && items.length > 0
          const status  = getMonthStatus(month)

          const prevMonth = (month > 1 ? month - 1 : 1) as 1 | 2 | 3 | 4
          const moduleLocked = month > 1
            && !syllabusByMonth[prevMonth].every(i => completedItems.has(i.id))
          const phaseAccent = allDone ? T.textDone
            : moduleLocked ? T.textLocked
            : status === 'focus' ? '#d97706'
            : T.accent

          return (
            <div key={month} style={{ display: 'flex', gap: 0 }}>
              {/* Vertical timeline spine */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                {/* Phase marker */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0, zIndex: 1, marginTop: 14,
                  border: `1px solid ${allDone ? T.doneBorder : moduleLocked ? T.lockedBorder : T.borderFocus}`,
                  background: allDone ? T.done : moduleLocked ? T.locked : T.surface,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: allDone ? `0 0 8px ${T.doneBorder}` : 'none',
                }}>
                  {allDone
                    ? <CheckCircle size={14} weight="fill" style={{ color: T.textDone }} />
                    : moduleLocked
                    ? <Lock size={14} style={{ color: T.textLocked }} />
                    : <span style={{ fontSize: 10, fontWeight: 700, fontFamily: T.fontMono, color: phaseAccent }}>{month}</span>}
                </div>
                {/* Connecting line to next phase */}
                {monthIdx < 3 && (
                  <div style={{
                    flex: 1, width: 1, minHeight: 24,
                    background: `linear-gradient(${allDone ? T.lineDone : T.lineColor}, ${T.lineColor})`,
                    marginTop: 4, marginBottom: 4,
                  }} />
                )}
              </div>

              {/* Phase content */}
              <div style={{ flex: 1, paddingLeft: 16, paddingBottom: monthIdx < 3 ? 0 : 24, paddingTop: 8 }}>
                {/* Phase header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  {moduleLocked && <Lock size={12} style={{ color: T.textLocked, flexShrink: 0 }} />}
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', color: phaseAccent }}>
                    Month {month} — {MONTH_NAMES[month - 1]}
                  </span>
                  {status === 'skip' && (
                    <span style={{ fontSize: 9, color: T.textDone, border: `1px solid ${T.doneBorder}`, borderRadius: 3, padding: '1px 6px', letterSpacing: '0.05em' }}>
                      SKIP ELIGIBLE
                    </span>
                  )}
                  {status === 'focus' && (
                    <span style={{ fontSize: 9, color: '#d97706', border: '1px solid #fde68a', borderRadius: 3, padding: '1px 6px', letterSpacing: '0.05em' }}>
                      FOCUS AREA
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: T.textSub, fontWeight: 600, fontFamily: T.fontMono }}>
                    {done}/{items.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 1, background: T.border, borderRadius: 1, marginBottom: 14, overflow: 'hidden' }}>
                  <div style={{ height: 1, background: phaseAccent, width: `${pct}%`, transition: 'width 0.5s' }} />
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                  {items.map((item, itemIdx) => {
                    const isDone = (item.quizId || item.projectId) ? !!masteryStatuses[item.id] : completedItems.has(item.id)
                    const unlocked  = isUnlocked(item, items)
                    const isLast    = itemIdx === items.length - 1
                    const itemHasNote = hasNote(role.id, item.id)
                    const itemNoteData = getNote(role.id, item.id)

                    const bgColor  = isDone ? T.done : unlocked ? T.surface : T.locked
                    const bdColor  = isDone ? T.doneBorder
                      : item.type === 'deliverable' ? '#fecaca'
                      : item.type === 'milestone'   ? '#fde68a'
                      : unlocked ? T.border : T.lockedBorder
                    const txtColor = isDone ? T.textDone : unlocked ? T.textPrimary : T.textLocked
                    const metaColor= isDone ? T.textDone : T.textSub

                    return (
                      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        <div
                          onClick={() => {
                            // Removed local onClick completion toggle to enforce backend mastery check
                          }}
                          style={{
                            border: `1px solid ${bdColor}`,
                            borderRadius: 8,
                            background: bgColor,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                            padding: '10px 14px',
                            cursor: unlocked && onToggleItem && !(item.quizId || item.projectId) ? 'pointer' : 'default',
                            opacity: unlocked ? 1 : 0.3,
                            filter: unlocked ? 'none' : 'grayscale(1)',
                            pointerEvents: unlocked ? 'auto' : 'none',
                            transition: 'background 0.15s, border-color 0.15s',
                          }}
                          onMouseEnter={e => {
                            if (unlocked && !isDone) (e.currentTarget as HTMLDivElement).style.background = T.surfaceHover
                          }}
                          onMouseLeave={e => {
                            if (unlocked && !isDone) (e.currentTarget as HTMLDivElement).style.background = bgColor
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            {/* Status icon */}
                            <div style={{ flexShrink: 0, marginTop: 1, color: isDone ? T.textDone : unlocked ? metaColor : T.textLocked }}>
                              {isDone       ? <CheckCircle size={15} weight="fill" />
                                : !unlocked ? <Lock size={15} />
                                : <ItemTypeIcon type={item.type} size={15} />}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em', color: txtColor, lineHeight: 1.3 }}>
                                  {item.title}
                                </span>
                                <span style={{ fontSize: 9, color: metaColor, border: `1px solid ${T.border}`, borderRadius: 3, padding: '1px 5px', letterSpacing: '0.04em' }}>
                                  W{item.week}
                                </span>
                                {item.type === 'deliverable' && (
                                  <span style={{ fontSize: 9, color: '#dc2626', border: '1px solid #fecaca', borderRadius: 3, padding: '1px 5px', letterSpacing: '0.04em' }}>
                                    PROJECT
                                  </span>
                                )}
                                {item.type === 'milestone' && (
                                  <span style={{ fontSize: 9, color: '#d97706', border: '1px solid #fde68a', borderRadius: 3, padding: '1px 5px', letterSpacing: '0.04em' }}>
                                    MILESTONE
                                  </span>
                                )}
                                {isDone && (
                                  <span style={{ fontSize: 9, color: T.textDone, border: `1px solid ${T.doneBorder}`, borderRadius: 3, padding: '1px 5px', letterSpacing: '0.04em', marginLeft: 'auto' }}>
                                    ✓ DONE
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: 11, color: T.textSub, lineHeight: 1.6, marginBottom: itemHasNote ? 8 : 0, fontFamily: T.fontSans }}>
                                {item.description}
                              </p>

                              {/* Note preview */}
                              {itemHasNote && itemNoteData && (
                                <div style={{ padding: '6px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 5, marginBottom: 4 }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                    <Note size={11} style={{ color: T.accent, flexShrink: 0, marginTop: 1 }} weight="fill" />
                                    <span style={{ fontSize: 10, color: T.textSub, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                      {itemNoteData.content}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Note button + action buttons */}
                            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                            {item.quizId && onOpenQuiz && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onOpenQuiz(item.quizId!, item.id) }}
                                style={{ background: 'transparent', border: `1px solid ${T.accentDim}`, borderRadius: 5, padding: '3px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                              >
                                <span style={{ fontSize: 9, color: T.accent, letterSpacing: '0.03em' }}>QUIZ →</span>
                              </button>
                            )}
                            {item.projectId && onOpenProject && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onOpenProject(item.projectId!, item.id) }}
                                style={{ background: 'transparent', border: '1px solid #fecaca', borderRadius: 5, padding: '3px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                              >
                                <span style={{ fontSize: 9, color: '#dc2626', letterSpacing: '0.03em' }}>BUILD →</span>
                              </button>
                            )}
                            {isAuthenticated && (
                              <button
                                type="button"
                                onClick={(e) => openNoteDialog(e, item)}
                                style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 5, padding: '3px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <NotePencil size={11} style={{ color: T.textSub }} />
                                <span style={{ fontSize: 9, color: T.textSub, letterSpacing: '0.03em' }}>{itemHasNote ? 'EDIT' : 'NOTE'}</span>
                              </button>
                            )}
                            </div>
                          </div>
                        </div>

                        {/* Connector between items */}
                        {!isLast && (
                          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 16 }}>
                            <div style={{ width: 1, height: 8, background: isDone ? T.lineDone : T.lineColor }} />
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

      {/* Landing footer */}
      <div style={{
        border: `1px solid ${overallPct === 100 ? T.doneBorder : T.border}`,
        borderRadius: 10, padding: '14px 20px',
        background: overallPct === 100 ? T.done : T.surface,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <AirplaneLanding size={18} style={{ color: overallPct === 100 ? T.textDone : T.textSub }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em', color: overallPct === 100 ? T.textDone : T.textPrimary }}>
            {overallPct === 100 ? 'Destination reached — Career Ready!' : `${role.title} · Destination`}
          </div>
          <div style={{ fontSize: 10, color: T.textSub, marginTop: 2 }}>
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
