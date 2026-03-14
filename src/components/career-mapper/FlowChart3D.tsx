import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CareerRole, SyllabusItem } from '@/types/career'

interface FlowChart3DProps {
  role: CareerRole
  completedItems: Set<string>
}

interface HierarchyNode {
  id: string
  type: 'course' | 'month' | 'week' | 'topic'
  label: string
  x: number
  y: number
  width: number
  height: number
  color: string
  children?: HierarchyNode[]
  item?: SyllabusItem
  isCompleted?: boolean
}

export function FlowChart3D({ role, completedItems }: FlowChart3DProps) {
  const [hoveredNode, setHoveredNode] = useState<HierarchyNode | null>(null)
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1]))

  const syllabusByMonth = {
    1: role.syllabus.filter(item => item.month === 1).sort((a, b) => a.sortOrder - b.sortOrder),
    2: role.syllabus.filter(item => item.month === 2).sort((a, b) => a.sortOrder - b.sortOrder),
    3: role.syllabus.filter(item => item.month === 3).sort((a, b) => a.sortOrder - b.sortOrder),
    4: role.syllabus.filter(item => item.month === 4).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const toggleMonth = (month: number) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(month)) {
      newExpanded.delete(month)
    } else {
      newExpanded.add(month)
    }
    setExpandedMonths(newExpanded)
  }

  const getWeeksByMonth = (month: 1 | 2 | 3 | 4) => {
    const items = syllabusByMonth[month]
    const weekMap = new Map<number, SyllabusItem[]>()
    
    items.forEach(item => {
      if (!weekMap.has(item.week)) {
        weekMap.set(item.week, [])
      }
      weekMap.get(item.week)!.push(item)
    })
    
    return Array.from(weekMap.entries()).sort((a, b) => a[0] - b[0])
  }

  const renderHierarchy = () => {
    const nodes: React.ReactElement[] = []
    const connections: React.ReactElement[] = []
    
    const courseStartX = 50
    const courseStartY = 50
    const courseWidth = 200
    const courseHeight = 100
    
    nodes.push(
      <g key="course-node">
        <rect
          x={courseStartX}
          y={courseStartY}
          width={courseWidth}
          height={courseHeight}
          rx={16}
          fill="url(#courseGradient)"
          stroke="#6366f1"
          strokeWidth={3}
          filter="url(#shadow)"
        />
        <foreignObject
          x={courseStartX + 20}
          y={courseStartY + 20}
          width={courseWidth - 40}
          height={courseHeight - 40}
        >
          <div className="flex flex-col justify-center h-full">
            <div className="text-xs font-semibold text-white/80 mb-1">
              COURSE
            </div>
            <div className="text-base font-bold text-white leading-tight line-clamp-2">
              {role.title}
            </div>
          </div>
        </foreignObject>
      </g>
    )
    
    const monthStartY = 220
    const monthX = 100
    const monthWidth = 140
    const monthHeight = 80
    const monthSpacing = 50
    let currentY = monthStartY
    
    ;([1, 2, 3, 4] as const).forEach((month) => {
      const isExpanded = expandedMonths.has(month)
      const items = syllabusByMonth[month]
      const completedCount = items.filter(item => completedItems.has(item.id)).length
      const allCompleted = items.length > 0 && completedCount === items.length
      
      const monthY = currentY
      
      connections.push(
        <line
          key={`conn-course-month${month}`}
          x1={courseStartX + courseWidth / 2}
          y1={courseStartY + courseHeight}
          x2={monthX + monthWidth / 2}
          y2={monthY}
          stroke={allCompleted ? '#10b981' : '#8b5cf6'}
          strokeWidth={allCompleted ? 3 : 2}
          opacity={0.6}
          markerEnd={`url(#arrowhead-${allCompleted ? 'completed' : 'default'})`}
        />
      )
      
      nodes.push(
        <g
          key={`month-${month}`}
          onClick={() => toggleMonth(month)}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={monthX}
            y={monthY}
            width={monthWidth}
            height={monthHeight}
            rx={12}
            fill={allCompleted ? '#10b981' : '#8b5cf6'}
            stroke={allCompleted ? '#059669' : '#7c3aed'}
            strokeWidth={2}
            filter="url(#shadow)"
          />
          <foreignObject
            x={monthX + 15}
            y={monthY + 15}
            width={monthWidth - 30}
            height={monthHeight - 30}
          >
            <div className="flex flex-col justify-center h-full">
              <div className="text-xs font-semibold text-white/90 mb-1">
                MONTH {month}
              </div>
              <div className="text-sm font-bold text-white">
                {completedCount}/{items.length} completed
              </div>
              <div className="text-xs text-white/80 mt-1">
                {isExpanded ? '▼ Click to collapse' : '▶ Click to expand'}
              </div>
            </div>
          </foreignObject>
        </g>
      )
      
      if (isExpanded) {
        const weeks = getWeeksByMonth(month)
        const weekStartX = monthX + monthWidth + 120
        const weekWidth = 160
        const weekHeight = 70
        const weekSpacing = 40
        
        weeks.forEach(([weekNum, weekItems], weekIdx) => {
          const weekY = monthY + (weekIdx * (weekHeight + weekSpacing))
          const weekCompletedCount = weekItems.filter(item => completedItems.has(item.id)).length
          const weekAllCompleted = weekItems.length > 0 && weekCompletedCount === weekItems.length
          
          connections.push(
            <line
              key={`conn-month${month}-week${weekNum}`}
              x1={monthX + monthWidth}
              y1={monthY + monthHeight / 2}
              x2={weekStartX}
              y2={weekY + weekHeight / 2}
              stroke={weekAllCompleted ? '#10b981' : '#cbd5e1'}
              strokeWidth={weekAllCompleted ? 2 : 1}
              opacity={0.5}
              markerEnd={`url(#arrowhead-${weekAllCompleted ? 'completed' : 'default'})`}
            />
          )
          
          nodes.push(
            <g key={`week-${month}-${weekNum}`}>
              <rect
                x={weekStartX}
                y={weekY}
                width={weekWidth}
                height={weekHeight}
                rx={8}
                fill={weekAllCompleted ? '#10b981' : '#3b82f6'}
                stroke={weekAllCompleted ? '#059669' : '#2563eb'}
                strokeWidth={2}
                filter="url(#shadow-sm)"
              />
              <foreignObject
                x={weekStartX + 12}
                y={weekY + 12}
                width={weekWidth - 24}
                height={weekHeight - 24}
                style={{ pointerEvents: 'none' }}
              >
                <div className="flex flex-col justify-center h-full">
                  <div className="text-xs font-semibold text-white/90 mb-0.5">
                    WEEK {weekNum}
                  </div>
                  <div className="text-xs text-white/80">
                    {weekCompletedCount}/{weekItems.length} topics
                  </div>
                </div>
              </foreignObject>
            </g>
          )
          
          const topicStartX = weekStartX + weekWidth + 100
          const topicWidth = 180
          const topicHeight = 60
          const topicSpacing = 20
          
          weekItems.forEach((item, topicIdx) => {
            const topicY = weekY + (topicIdx * (topicHeight + topicSpacing)) - ((weekItems.length - 1) * (topicHeight + topicSpacing)) / 2
            const isCompleted = completedItems.has(item.id)
            
            let topicColor = '#6366f1'
            let topicShape: 'diamond' | 'rect' | 'rounded' = 'rounded'
            
            if (item.type === 'milestone') {
              topicColor = isCompleted ? '#10b981' : '#f59e0b'
              topicShape = 'diamond'
            } else if (item.type === 'deliverable') {
              topicColor = isCompleted ? '#10b981' : '#ec4899'
              topicShape = 'rect'
            } else {
              topicColor = isCompleted ? '#10b981' : '#6366f1'
              topicShape = 'rounded'
            }
            
            connections.push(
              <line
                key={`conn-week${month}-${weekNum}-topic${topicIdx}`}
                x1={weekStartX + weekWidth}
                y1={weekY + weekHeight / 2}
                x2={topicStartX}
                y2={topicY + topicHeight / 2}
                stroke={isCompleted ? '#10b981' : '#cbd5e1'}
                strokeWidth={isCompleted ? 2 : 1}
                opacity={0.4}
                markerEnd={`url(#arrowhead-${isCompleted ? 'completed' : 'default'})`}
              />
            )
            
            const nodeData: HierarchyNode = {
              id: item.id,
              type: 'topic',
              label: item.title,
              x: topicStartX,
              y: topicY,
              width: topicWidth,
              height: topicHeight,
              color: topicColor,
              item: item,
              isCompleted
            }
            
            if (topicShape === 'diamond') {
              const cx = topicStartX + topicWidth / 2
              const cy = topicY + topicHeight / 2
              const size = 30
              
              nodes.push(
                <g
                  key={`topic-${item.id}`}
                  onMouseEnter={() => setHoveredNode(nodeData)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <path
                    d={`M ${cx} ${cy - size} L ${cx + size} ${cy} L ${cx} ${cy + size} L ${cx - size} ${cy} Z`}
                    fill={topicColor}
                    stroke={topicColor}
                    strokeWidth={2}
                    filter="url(#shadow-sm)"
                  />
                  <foreignObject
                    x={cx - 60}
                    y={cy - 20}
                    width={120}
                    height={40}
                    style={{ pointerEvents: 'none' }}
                  >
                    <div className="flex items-center justify-center h-full text-center px-2">
                      <div className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {item.title}
                      </div>
                    </div>
                  </foreignObject>
                  {isCompleted && (
                    <circle
                      cx={cx + size - 10}
                      cy={cy - size + 10}
                      r={8}
                      fill="white"
                    />
                  )}
                  {isCompleted && (
                    <text
                      x={cx + size - 10}
                      y={cy - size + 14}
                      fill="#10b981"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ✓
                    </text>
                  )}
                </g>
              )
            } else {
              const rx = topicShape === 'rounded' ? 30 : 6
              
              nodes.push(
                <g
                  key={`topic-${item.id}`}
                  onMouseEnter={() => setHoveredNode(nodeData)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={topicStartX}
                    y={topicY}
                    width={topicWidth}
                    height={topicHeight}
                    rx={rx}
                    fill={topicColor}
                    stroke={topicColor}
                    strokeWidth={2}
                    filter="url(#shadow-sm)"
                  />
                  <foreignObject
                    x={topicStartX + 10}
                    y={topicY + 10}
                    width={topicWidth - 20}
                    height={topicHeight - 20}
                    style={{ pointerEvents: 'none' }}
                  >
                    <div className="flex flex-col justify-center h-full">
                      <div className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-white/70 mt-1 capitalize">
                        {item.type}
                      </div>
                    </div>
                  </foreignObject>
                  {isCompleted && (
                    <circle
                      cx={topicStartX + topicWidth - 12}
                      cy={topicY + 12}
                      r={8}
                      fill="white"
                    />
                  )}
                  {isCompleted && (
                    <text
                      x={topicStartX + topicWidth - 12}
                      y={topicY + 16}
                      fill="#10b981"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ✓
                    </text>
                  )}
                </g>
              )
            }
          })
        })
        
        currentY += Math.max(weeks.length * (weekHeight + weekSpacing), monthHeight) + monthSpacing
      } else {
        currentY += monthHeight + monthSpacing
      }
    })
    
    return { nodes, connections }
  }

  const { nodes, connections } = renderHierarchy()

  const svgHeight = 100 + (expandedMonths.size * 600) + ((4 - expandedMonths.size) * 150)
  const svgWidth = 1400

  return (
    <div className="relative w-full">
      <Card className="p-6 bg-gradient-to-br from-secondary/30 via-background to-secondary/20 border-border/50">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-xl font-bold mb-2">Hierarchical Course Flow</h3>
            <p className="text-sm text-muted-foreground">
              Course → Months → Weeks → Topics. Click months to expand/collapse.
            </p>
          </div>
          <div className="flex gap-4 items-center text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 rounded-full bg-blue-500" />
              <span>Topic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pink-500 rounded" />
              <span>Deliverable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-500 rotate-45" />
              <span>Milestone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-full" />
              <span>Completed</span>
            </div>
          </div>
        </div>

        <div className="overflow-auto border border-border/40 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50/30">
          <svg
            width={svgWidth}
            height={svgHeight}
            className="min-w-full"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
          >
            <defs>
              <linearGradient id="courseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.2" />
              </filter>
              <filter id="shadow-sm" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
              </filter>
              <marker
                id="arrowhead-default"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#cbd5e1" opacity="0.6" />
              </marker>
              <marker
                id="arrowhead-completed"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#10b981" opacity="0.8" />
              </marker>
            </defs>

            {connections}
            {nodes}
          </svg>
        </div>

        {hoveredNode && hoveredNode.item && (
          <Card className="mt-4 p-4 bg-background border-border/60">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="font-bold text-base">{hoveredNode.item.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    Month {hoveredNode.item.month}, Week {hoveredNode.item.week}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {hoveredNode.item.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {hoveredNode.item.description}
                </p>
              </div>
              {hoveredNode.isCompleted && (
                <Badge className="bg-emerald-500 text-white border-0">
                  ✓ Completed
                </Badge>
              )}
            </div>
          </Card>
        )}
      </Card>
    </div>
  )
}
