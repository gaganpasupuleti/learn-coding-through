import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartLineUp, Sparkle } from '@phosphor-icons/react'
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

// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:         '#0b0b0b',
  surface:    '#111118',
  border:     'rgba(255,255,255,0.08)',
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
  textPrimary:'#ffffff',
  textSub:    '#9ca3af',
  textDone:   '#4ade80',
  glowColor:  '#818cf8',
  fontMono:   "'JetBrains Mono', monospace",
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
    if (s.has(month)) {
      s.delete(month)
    } else {
      s.add(month)
    }
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
    const cX = 60, cY = 60, cW = 235, cH = 100
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
        <foreignObject x={cX + 10} y={cY + 10} width={cW - 20} height={cH - 20}
          style={{ pointerEvents: 'none' }}>
          <div style={{ fontFamily: C.fontMono, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '8px 10px', boxSizing: 'border-box', height: '100%' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: C.textSub, marginBottom: 5, textTransform: 'uppercase' }}>
              Course
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', lineHeight: 1.25, textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
              {role.title}
            </div>
          </div>
        </foreignObject>
      </g>
    )

    const monthStartY = 220
    const mX = 110, mW = 150, mH = 82, mSpacing = 44
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
          strokeWidth={1} opacity={0.18}
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
          <foreignObject x={mX + 8} y={mY + 8} width={mW - 16} height={mH - 16}
            style={{ pointerEvents: 'none' }}>
            <div style={{ fontFamily: C.fontMono, background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '6px 8px', boxSizing: 'border-box', height: '100%' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: allDone ? C.doneText : C.textSub, marginBottom: 3, textTransform: 'uppercase' }}>
                Month {month}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: allDone ? C.doneText : '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.9)', marginBottom: 2 }}>
                {doneCount}/{items.length} done
              </div>
              <div style={{ fontSize: 9, color: C.textSub, letterSpacing: '0.06em' }}>
                {isExpanded ? '▼ collapse' : '▶ expand'}
              </div>
            </div>
          </foreignObject>
        </g>
      )

      if (isExpanded) {
        const weeks = getWeeksByMonth(month)
        const wStartX = mX + mW + 110, wW = 160, wH = 70, wSpacing = 36

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
              strokeWidth={1} opacity={0.2}
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
              <foreignObject x={wStartX + 8} y={wY + 8} width={wW - 16} height={wH - 16}
                style={{ pointerEvents: 'none' }}>
                <div style={{ fontFamily: C.fontMono, background: 'rgba(0,0,0,0.5)', borderRadius: 5, padding: '5px 8px', boxSizing: 'border-box', height: '100%' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: allWDone ? C.doneText : C.textSub, marginBottom: 3, textTransform: 'uppercase' }}>
                    Week {weekNum}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: allWDone ? C.doneText : '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                    {wDone}/{weekItems.length} topics
                  </div>
                </div>
              </foreignObject>
            </g>
          )

          const tStartX = wStartX + wW + 90, tW = 185, tH = 64, tSpacing = 20

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
                strokeWidth={1} opacity={0.15}
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
                <foreignObject x={tStartX + 8} y={tY + 7} width={tW - 16} height={tH - 14}
                  style={{ pointerEvents: 'none' }}>
                  <div style={{ fontFamily: C.fontMono, background: 'rgba(0,0,0,0.5)', borderRadius: 5, padding: '5px 8px', boxSizing: 'border-box', height: '100%' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: txtCol, lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 9, color: C.textSub, marginTop: 2, textTransform: 'capitalize', letterSpacing: '0.08em' }}>
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
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in duration-700 hover:border-primary/50 transition-colors">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ChartLineUp className="text-primary" size={18} weight="duotone" />
              Hierarchical Course Flow
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Course → Months → Weeks → Topics · Click months to expand
            </p>
          </div>
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary animate-pulse [animation-duration:3s]">
            <Sparkle className="mr-1.5" size={12} weight="fill" />
            Interactive Graph
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { color: C.topicBorder, label: 'Topic' },
            { color: C.deliverBorder, label: 'Deliverable' },
            { color: C.milestoneBorder, label: 'Milestone' },
            { color: C.doneBorder, label: 'Completed' },
          ].map(({ color, label }) => (
            <Badge key={label} variant="secondary" className="border-border/50 bg-secondary/40 text-foreground hover:border-primary/50 transition-colors">
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: color }} />
              {label}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Canvas */}
        <div className="overflow-x-auto overflow-y-auto rounded-xl border border-border/50 bg-background/40 hover:border-primary/40 transition-colors">
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
          <div className="rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm animate-in fade-in duration-700">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{hoveredNode.item.title}</p>
                  <Badge variant="outline" className="border-border/60 text-muted-foreground">
                    M{hoveredNode.item.month} · W{hoveredNode.item.week}
                  </Badge>
                  <Badge variant="secondary" className="bg-secondary/50 text-foreground capitalize">
                    {hoveredNode.item.type}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{hoveredNode.item.description}</p>
              </div>
              {hoveredNode.isCompleted && (
                <Badge className="bg-primary/20 text-primary border-primary/40">Completed</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
