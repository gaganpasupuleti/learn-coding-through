import { useState } from 'react'
import type { CareerRole, SyllabusItem } from '@/types/career'

interface FlowChart3DProps {
  role: CareerRole
  completedItems: Set<string>
}

interface HierarchyNode {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  item?: SyllabusItem
  isCompleted?: boolean
}

// ── Dark palette ────────────────────────────────────────────────────────────
const C = {
  bg:         '#0b0b0b',
  surface:    '#111111',
  border:     '#1f1f1f',
  courseFrom: '#1a1a2e',
  courseTo:   '#16213e',
  courseBorder:'#3b3b5c',
  month:      '#0f1117',
  monthBorder:'#2a2a3d',
  week:       '#101014',
  weekBorder: '#252530',
  topic:      '#0d1117',
  topicBorder:'#1e1e2e',
  done:       '#052e16',
  doneBorder: '#166534',
  doneText:   '#4ade80',
  deliver:    '#1a0a0a',
  deliverBorder:'#7f1d1d',
  deliverText:'#f87171',
  milestone:  '#1a140a',
  milestoneBorder:'#78350f',
  milestoneText:'#fbbf24',
  lineDefault:'#2a2a3d',
  lineDone:   '#166534',
  textPrimary:'#e2e8f0',
  textSub:    '#64748b',
  textDone:   '#4ade80',
  glowColor:  '#818cf8',
} as const

export function FlowChart3D({ role, completedItems }: FlowChart3DProps) {
  const [hoveredNode, setHoveredNode] = useState<HierarchyNode | null>(null)
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1]))

  const syllabusByMonth = {
    1: role.syllabus.filter(i => i.month === 1).sort((a, b) => a.sortOrder - b.sortOrder),
    2: role.syllabus.filter(i => i.month === 2).sort((a, b) => a.sortOrder - b.sortOrder),
    3: role.syllabus.filter(i => i.month === 3).sort((a, b) => a.sortOrder - b.sortOrder),
    4: role.syllabus.filter(i => i.month === 4).sort((a, b) => a.sortOrder - b.sortOrder),
  }

  const toggleMonth = (month: number) => {
    const s = new Set(expandedMonths)
    s.has(month) ? s.delete(month) : s.add(month)
    setExpandedMonths(s)
  }

  const getWeeksByMonth = (month: 1 | 2 | 3 | 4) => {
    const items = syllabusByMonth[month]
    const map = new Map<number, SyllabusItem[]>()
    items.forEach(item => {
      if (!map.has(item.week)) map.set(item.week, [])
      map.get(item.week)!.push(item)
    })
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0])
  }

  const renderHierarchy = () => {
    const nodes: React.ReactElement[] = []
    const conns: React.ReactElement[] = []

    // Course root node
    const cX = 60, cY = 60, cW = 220, cH = 90
    const isHovered = (id: string) => hoveredNode?.id === id

    nodes.push(
      <g key="course-node">
        {isHovered('__course__') && (
          <rect x={cX - 4} y={cY - 4} width={cW + 8} height={cH + 8} rx={18}
            fill="none" stroke={C.glowColor} strokeWidth={2} opacity={0.6}
            filter="url(#glow)" />
        )}
        <rect x={cX} y={cY} width={cW} height={cH} rx={14}
          fill={`url(#courseGrad)`} stroke={C.courseBorder} strokeWidth={1} />
        <foreignObject x={cX + 16} y={cY + 14} width={cW - 32} height={cH - 28}
          style={{ pointerEvents: 'none' }}>
          <div style={{ fontFamily: 'inherit' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: C.textSub, marginBottom: 4 }}>
              COURSE
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, lineHeight: 1.3 }}>
              {role.title}
            </div>
          </div>
        </foreignObject>
      </g>
    )

    const monthStartY = 220
    const mX = 110, mW = 140, mH = 75, mSpacing = 44
    let currentY = monthStartY

    ;([1, 2, 3, 4] as const).forEach((month) => {
      const isExpanded = expandedMonths.has(month)
      const items = syllabusByMonth[month]
      const doneCount = items.filter(i => completedItems.has(i.id)).length
      const allDone = items.length > 0 && doneCount === items.length
      const mY = currentY
      const mHovered = isHovered(`__month_${month}__`)

      conns.push(
        <line key={`c-cm${month}`}
          x1={cX + cW / 2} y1={cY + cH}
          x2={mX + mW / 2} y2={mY}
          stroke={allDone ? C.lineDone : C.lineDefault}
          strokeWidth={1} opacity={0.7}
          markerEnd={`url(#arr-${allDone ? 'done' : 'def'})`} />
      )

      nodes.push(
        <g key={`month-${month}`} onClick={() => toggleMonth(month)} style={{ cursor: 'pointer' }}
          onMouseEnter={() => setHoveredNode({ id: `__month_${month}__`, label: `Month ${month}`, x: mX, y: mY, width: mW, height: mH })}
          onMouseLeave={() => setHoveredNode(null)}>
          {mHovered && (
            <rect x={mX - 3} y={mY - 3} width={mW + 6} height={mH + 6} rx={12}
              fill="none" stroke={C.glowColor} strokeWidth={1.5} opacity={0.5}
              filter="url(#glow)" />
          )}
          <rect x={mX} y={mY} width={mW} height={mH} rx={10}
            fill={allDone ? C.done : C.month}
            stroke={allDone ? C.doneBorder : C.monthBorder} strokeWidth={1} />
          <foreignObject x={mX + 12} y={mY + 10} width={mW - 24} height={mH - 20}
            style={{ pointerEvents: 'none' }}>
            <div style={{ fontFamily: 'inherit' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: allDone ? C.doneText : C.textSub, marginBottom: 3 }}>
                MONTH {month}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: allDone ? C.doneText : C.textPrimary }}>
                {doneCount}/{items.length} done
              </div>
              <div style={{ fontSize: 10, color: C.textSub, marginTop: 3 }}>
                {isExpanded ? '▼ collapse' : '▶ expand'}
              </div>
            </div>
          </foreignObject>
        </g>
      )

      if (isExpanded) {
        const weeks = getWeeksByMonth(month)
        const wStartX = mX + mW + 110, wW = 150, wH = 64, wSpacing = 36

        weeks.forEach(([weekNum, weekItems], wIdx) => {
          const wY = mY + wIdx * (wH + wSpacing)
          const wDone = weekItems.filter(i => completedItems.has(i.id)).length
          const allWDone = weekItems.length > 0 && wDone === weekItems.length
          const wHov = isHovered(`__week_${month}_${weekNum}__`)

          conns.push(
            <line key={`c-mw${month}-${weekNum}`}
              x1={mX + mW} y1={mY + mH / 2}
              x2={wStartX} y2={wY + wH / 2}
              stroke={allWDone ? C.lineDone : C.lineDefault}
              strokeWidth={1} opacity={0.5}
              markerEnd={`url(#arr-${allWDone ? 'done' : 'def'})`} />
          )

          nodes.push(
            <g key={`week-${month}-${weekNum}`}
              onMouseEnter={() => setHoveredNode({ id: `__week_${month}_${weekNum}__`, label: `Week ${weekNum}`, x: wStartX, y: wY, width: wW, height: wH })}
              onMouseLeave={() => setHoveredNode(null)}>
              {wHov && (
                <rect x={wStartX - 2} y={wY - 2} width={wW + 4} height={wH + 4} rx={8}
                  fill="none" stroke={C.glowColor} strokeWidth={1.5} opacity={0.45}
                  filter="url(#glow)" />
              )}
              <rect x={wStartX} y={wY} width={wW} height={wH} rx={7}
                fill={allWDone ? C.done : C.week}
                stroke={allWDone ? C.doneBorder : C.weekBorder} strokeWidth={1} />
              <foreignObject x={wStartX + 10} y={wY + 10} width={wW - 20} height={wH - 20}
                style={{ pointerEvents: 'none' }}>
                <div style={{ fontFamily: 'inherit' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: allWDone ? C.doneText : C.textSub, marginBottom: 3 }}>
                    WEEK {weekNum}
                  </div>
                  <div style={{ fontSize: 11, color: allWDone ? C.doneText : C.textPrimary }}>
                    {wDone}/{weekItems.length} topics
                  </div>
                </div>
              </foreignObject>
            </g>
          )

          const tStartX = wStartX + wW + 90, tW = 175, tH = 56, tSpacing = 18

          weekItems.forEach((item, tIdx) => {
            const tY = wY + tIdx * (tH + tSpacing) - ((weekItems.length - 1) * (tH + tSpacing)) / 2
            const done = completedItems.has(item.id)
            const tHov = isHovered(item.id)

            const fill   = done ? C.done : item.type === 'deliverable' ? C.deliver : item.type === 'milestone' ? C.milestone : C.topic
            const border = done ? C.doneBorder : item.type === 'deliverable' ? C.deliverBorder : item.type === 'milestone' ? C.milestoneBorder : C.topicBorder
            const txtCol = done ? C.doneText : item.type === 'deliverable' ? C.deliverText : item.type === 'milestone' ? C.milestoneText : C.textPrimary

            const nodeData: HierarchyNode = { id: item.id, label: item.title, x: tStartX, y: tY, width: tW, height: tH, item, isCompleted: done }

            conns.push(
              <line key={`c-wt-${item.id}`}
                x1={wStartX + wW} y1={wY + wH / 2}
                x2={tStartX} y2={tY + tH / 2}
                stroke={done ? C.lineDone : C.lineDefault}
                strokeWidth={1} opacity={0.4}
                markerEnd={`url(#arr-${done ? 'done' : 'def'})`} />
            )

            nodes.push(
              <g key={`topic-${item.id}`}
                onMouseEnter={() => setHoveredNode(nodeData)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}>
                {tHov && (
                  <rect x={tStartX - 3} y={tY - 3} width={tW + 6} height={tH + 6} rx={9}
                    fill="none" stroke={C.glowColor} strokeWidth={1.5} opacity={0.7}
                    filter="url(#glow)" />
                )}
                <rect x={tStartX} y={tY} width={tW} height={tH} rx={7}
                  fill={fill} stroke={border} strokeWidth={1} />
                <foreignObject x={tStartX + 10} y={tY + 9} width={tW - 20} height={tH - 18}
                  style={{ pointerEvents: 'none' }}>
                  <div style={{ fontFamily: 'inherit' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: txtCol, lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 9, color: C.textSub, marginTop: 3, textTransform: 'capitalize', letterSpacing: '0.05em' }}>
                      {item.type}
                    </div>
                  </div>
                </foreignObject>
                {done && (
                  <>
                    <circle cx={tStartX + tW - 12} cy={tY + 12} r={7} fill={C.done} stroke={C.doneBorder} strokeWidth={1} />
                    <text x={tStartX + tW - 12} y={tY + 16} fill={C.doneText} fontSize={10} fontWeight="bold" textAnchor="middle">✓</text>
                  </>
                )}
              </g>
            )
          })
        })

        currentY += Math.max(weeks.length * (wH + wSpacing), mH) + mSpacing
      } else {
        currentY += mH + mSpacing
      }
    })

    return { nodes, conns }
  }

  const { nodes, conns } = renderHierarchy()
  const svgH = 100 + expandedMonths.size * 580 + (4 - expandedMonths.size) * 140
  const svgW = 1360

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', color: '#e2e8f0', marginBottom: 4 }}>
            Hierarchical Course Flow
          </div>
          <div style={{ fontSize: 11, color: C.textSub }}>
            Course → Months → Weeks → Topics · Click months to expand
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { color: C.topicBorder, label: 'Topic' },
            { color: C.deliverBorder, label: 'Deliverable' },
            { color: C.milestoneBorder, label: 'Milestone' },
            { color: C.doneBorder, label: 'Completed' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 10, borderRadius: 3, border: `1px solid ${color}`, background: 'transparent' }} />
              <span style={{ fontSize: 10, color: C.textSub }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg }}>
        <svg width={svgW} height={svgH} style={{ minWidth: '100%' }}>
          <defs>
            <linearGradient id="courseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={C.courseFrom} />
              <stop offset="100%" stopColor={C.courseTo} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id="arr-def" markerWidth="6" markerHeight="6" refX="5" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill={C.lineDefault} />
            </marker>
            <marker id="arr-done" markerWidth="6" markerHeight="6" refX="5" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill={C.lineDone} />
            </marker>
          </defs>
          {conns}
          {nodes}
        </svg>
      </div>

      {/* Hover tooltip */}
      {hoveredNode?.item && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{hoveredNode.item.title}</span>
                <span style={{ fontSize: 10, color: C.textSub, border: `1px solid ${C.border}`, borderRadius: 4, padding: '1px 6px' }}>
                  M{hoveredNode.item.month} · W{hoveredNode.item.week}
                </span>
                <span style={{ fontSize: 10, color: C.textSub, border: `1px solid ${C.border}`, borderRadius: 4, padding: '1px 6px', textTransform: 'capitalize' }}>
                  {hoveredNode.item.type}
                </span>
              </div>
              <p style={{ fontSize: 11, color: C.textSub, lineHeight: 1.6 }}>{hoveredNode.item.description}</p>
            </div>
            {hoveredNode.isCompleted && (
              <span style={{ fontSize: 10, color: C.doneText, border: `1px solid ${C.doneBorder}`, borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                ✓ Completed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
