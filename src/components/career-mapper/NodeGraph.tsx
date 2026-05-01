import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CareerRole, SyllabusItem } from '@/types/career'

// ─── Props ────────────────────────────────────────────────────────────────────
interface NodeGraphProps {
  role: CareerRole
  completedItems: Set<string>
  onNodeClick: (nodeId: string) => void
  selectedNodeId?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CW       = 1600          // canvas width
const SPINE_X  = CW / 2       // vertical spine x
const MNW      = 210           // main node width
const MNH      = 44            // main node height
const SNW      = 190           // sub node width
const SNH      = 38            // sub node height
const CAW      = 290           // capstone width
const CAH      = 54            // capstone height
const BRANCH_X = 90            // horizontal distance from spine to sub column
const SUB_GAP  = 14            // vertical gap between sub nodes
const ROW_GAP  = 60            // gap between weeks

// ─── Colors (exact roadmap.sh palette) ───────────────────────────────────────
const COL = {
  bg:        '#f4f4f0',
  spine:     '#2563eb',
  mainFill:  '#fdff00',
  mainBd:    '#000000',
  mainText:  '#000000',
  subFill:   '#ffe599',
  subBd:     '#000000',
  subText:   '#000000',
  capFill:   '#000000',
  capText:   '#ffffff',
  doneFill:  '#f0fdf4',
  doneBd:    '#16a34a',
  doneText:  '#15803d',
  badgePurp: '#7c3aed',
  badgeGrn:  '#16a34a',
  connector: '#2563eb',
  monthHdr:  '#1e293b',
  hlFill:    '#4f46e5',
  hlText:    '#ffffff',
}

// ─── Node / Edge types ────────────────────────────────────────────────────────
interface GNode {
  id: string
  item: SyllabusItem
  kind: 'month-hdr' | 'main' | 'sub' | 'capstone'
  cx: number; cy: number; w: number; h: number
  side?: 'left' | 'right'
  isHighlight?: boolean
  floatDelay: number
}
interface GEdge {
  id: string
  d: string
  dashed: boolean
  done: boolean
}

// ─── Build layout ─────────────────────────────────────────────────────────────
function buildLayout(role: CareerRole, completedItems: Set<string>) {
  const sorted = [...role.syllabus].sort(
    (a, b) => a.month - b.month || a.week - b.week || a.sortOrder - b.sortOrder
  )

  const capIds = new Set(sorted.filter(i => i.type === 'deliverable' || i.type === 'milestone').map(i => i.id))

  // month → week → items
  const byMonth = new Map<number, Map<number, SyllabusItem[]>>()
  sorted.forEach(item => {
    if (!byMonth.has(item.month)) byMonth.set(item.month, new Map())
    const wm = byMonth.get(item.month)!
    if (!wm.has(item.week)) wm.set(item.week, [])
    wm.get(item.week)!.push(item)
  })

  const nodes: GNode[] = []
  const edges: GEdge[] = []
  let y = 70
  let prevSpineNode: GNode | null = null
  let weekIdx = 0

  const MONTH_NAMES: Record<number, string> = {
    1: 'Foundation', 2: 'Build', 3: 'Advanced', 4: 'Career Ready'
  }

  byMonth.forEach((weekMap, month) => {
    // Month header — sits on spine
    const hdr: GNode = {
      id: `month-hdr-${month}`,
      item: { id: `month-hdr-${month}`, month: month as any, week: 0, title: `Month ${month} — ${MONTH_NAMES[month] ?? ''}`, description: '', type: 'topic', sortOrder: 0 },
      kind: 'month-hdr',
      cx: SPINE_X, cy: y, w: 240, h: 48,
      floatDelay: 0,
    }
    nodes.push(hdr)

    if (prevSpineNode) {
      edges.push({
        id: `sp-${prevSpineNode.id}-${hdr.id}`,
        d: vLine(prevSpineNode.cy + prevSpineNode.h / 2, hdr.cy - hdr.h / 2),
        dashed: false, done: false,
      })
    }
    prevSpineNode = hdr
    y += hdr.h + ROW_GAP * 0.6

    weekMap.forEach(items => {
      const topics   = items.filter(i => !capIds.has(i.id))
      if (topics.length === 0) return

      const mainItem = topics[0]
      const subs     = topics.slice(1)
      const isDel    = mainItem.type === 'deliverable' || mainItem.type === 'milestone'
      const side: 'left' | 'right' = weekIdx % 2 === 0 ? 'right' : 'left'
      weekIdx++

      // Sub-section total height
      const subsTotalH = subs.length > 0 ? subs.length * SNH + (subs.length - 1) * SUB_GAP : 0
      const mainCy = y + Math.max(MNH, subsTotalH) / 2

      // Main node
      const mainNode: GNode = {
        id: mainItem.id, item: mainItem, kind: 'main',
        cx: SPINE_X, cy: mainCy, w: MNW, h: MNH, side,
        isHighlight: mainItem.type === 'milestone',
      }
      nodes.push(mainNode)

      // Spine edge prev → main
      if (prevSpineNode) {
        const fromC = completedItems.has(prevSpineNode.id)
        const toC   = completedItems.has(mainItem.id)
        edges.push({
          id: `sp-${prevSpineNode.id}-${mainItem.id}`,
          d: vLine(prevSpineNode.cy + prevSpineNode.h / 2, mainCy - MNH / 2),
          dashed: false, done: fromC && toC,
        })
      }
      prevSpineNode = mainNode

      // Sub nodes
      const subColX = side === 'right'
        ? SPINE_X + MNW / 2 + BRANCH_X + SNW / 2
        : SPINE_X - MNW / 2 - BRANCH_X - SNW / 2

      const subStartY = mainCy - subsTotalH / 2

      subs.forEach((sub, si) => {
        const subCy = subStartY + si * (SNH + SUB_GAP) + SNH / 2
        const subNode: GNode = {
          id: sub.id, item: sub, kind: 'sub',
          cx: subColX, cy: subCy, w: SNW, h: SNH, side,
        }
        nodes.push(subNode)

        // L-shaped connector: horizontal segment then vertical then horizontal
        const fromC = completedItems.has(mainItem.id)
        const toC   = completedItems.has(sub.id)
        const ex1   = side === 'right' ? SPINE_X + MNW / 2 : SPINE_X - MNW / 2
        const ex2   = side === 'right' ? subColX - SNW / 2 : subColX + SNW / 2
        const elbX  = side === 'right' ? SPINE_X + MNW / 2 + BRANCH_X * 0.6 : SPINE_X - MNW / 2 - BRANCH_X * 0.6
        edges.push({
          id: `br-${mainItem.id}-${sub.id}`,
          d: lPath(ex1, mainCy, elbX, subCy, ex2),
          dashed: true, done: fromC && toC,
        })
      })

      const sectionH = Math.max(MNH, subsTotalH)
      y += sectionH + ROW_GAP
    })

    // Capstones for this month
    sorted.filter(i => i.month === month && capIds.has(i.id)).forEach(cap => {
      const capNode: GNode = {
        id: cap.id, item: cap, kind: 'capstone',
        cx: SPINE_X, cy: y + CAH / 2, w: CAW, h: CAH,
        floatDelay: Math.random() * 1.5,
      }
      nodes.push(capNode)
      if (prevSpineNode) {
        const fromC = completedItems.has(prevSpineNode.id)
        const toC   = completedItems.has(cap.id)
        edges.push({
          id: `cap-${cap.id}`,
          d: vLine(prevSpineNode.cy + prevSpineNode.h / 2, capNode.cy - CAH / 2),
          dashed: false, done: fromC && toC,
        })
      }
      prevSpineNode = capNode
      y += CAH + ROW_GAP * 1.4
    })
  })

  return { nodes, edges, height: y + 60 }
}

// ─── SVG path helpers ─────────────────────────────────────────────────────────
function vLine(y1: number, y2: number) {
  return `M ${SPINE_X} ${y1} L ${SPINE_X} ${y2}`
}
function lPath(x1: number, y1: number, elbX: number, y2: number, x2: number) {
  // Horizontal → elbow → vertical → horizontal (straight L)
  return `M ${x1} ${y1} H ${elbX} V ${y2} H ${x2}`
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function NodeModal({ item, isCompleted, onClose }: { item: SyllabusItem; isCompleted: boolean; onClose: () => void }) {
  const typeLabel = item.type === 'deliverable' ? 'Capstone Project' : item.type === 'milestone' ? 'Milestone' : 'Topic'
  const accent    = item.type === 'deliverable' ? '#f59e0b' : item.type === 'milestone' ? '#7c3aed' : '#2563eb'
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ border: '2.5px solid #000' }}
        initial={{ scale: 0.88, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: isCompleted ? '#16a34a' : accent, padding: '18px 22px' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/80 text-xs font-bold tracking-widest uppercase">{typeLabel}</span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded">W{item.week}</span>
                {isCompleted && <span className="bg-white text-green-700 text-xs font-black px-2 py-0.5 rounded">✓ DONE</span>}
              </div>
              <h2 className="text-white text-lg font-black leading-tight">{item.title}</h2>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl font-bold leading-none">×</button>
          </div>
        </div>
        {/* Body */}
        <div className="p-5">
          {item.description && <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.description}</p>}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Month', val: item.month },
              { label: 'Week',  val: item.week },
              { label: 'Type',  val: typeLabel },
            ].map(c => (
              <div key={c.label} className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{c.label}</div>
                <div className="text-sm font-black text-gray-900">{c.val}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="inline-flex flex-col gap-2 bg-white rounded-xl border-2 border-black p-4 text-sm shadow mb-6">
      {[
        { color: COL.badgePurp, label: 'Personal Recommendation' },
        { color: COL.badgeGrn,  label: 'Alternative Option' },
        { color: '#6b7280',     label: 'Order not strict' },
      ].map(l => (
        <div key={l.label} className="flex items-center gap-2">
          <svg width={18} height={18}>
            <circle cx={9} cy={9} r={8} fill={l.color} />
            <text x={9} y={13} textAnchor="middle" fontSize={11} fontWeight={900} fill="#fff">✓</text>
          </svg>
          <span className="text-gray-700 font-medium">{l.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function NodeGraph({ role, completedItems, onNodeClick, selectedNodeId }: NodeGraphProps) {
  const { nodes, edges, height } = useMemo(
    () => buildLayout(role, completedItems),
    [role, completedItems]
  )

  const [modal, setModal] = useState<SyllabusItem | null>(null)

  const handleClick = (node: GNode) => {
    if (node.kind === 'month-hdr') return
    onNodeClick(node.id)
    setModal(node.item)
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Legend />
      <div
        className="rounded-2xl overflow-auto border-2 border-gray-200 shadow-lg"
        style={{ background: COL.bg }}
      >
        <svg
          viewBox={`0 0 ${CW} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: 900, display: 'block' }}
        >
          {/* Vertical spine line behind everything */}
          <motion.line
            x1={SPINE_X} y1={40} x2={SPINE_X} y2={height - 40}
            stroke={COL.spine} strokeWidth={3} strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {/* Edges */}
          {edges.map(e => (
            <motion.path
              key={e.id}
              d={e.d}
              fill="none"
              stroke={e.done ? COL.badgeGrn : COL.connector}
              strokeWidth={e.dashed ? 2 : 3.5}
              strokeDasharray={e.dashed ? '6 5' : '0'}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
            />
          ))}

          {/* Nodes */}
          {nodes.map(node => {
            const isCompleted = completedItems.has(node.id)
            const isSelected  = selectedNodeId === node.id

            // Resolve fill/stroke/text
            let fill = COL.subFill, bd = COL.subBd, tc = COL.subText
            if (node.kind === 'month-hdr') { fill = '#1e293b'; bd = '#1e293b'; tc = '#ffffff' }
            else if (node.kind === 'main') { fill = COL.mainFill; bd = COL.mainBd; tc = COL.mainText }
            else if (node.kind === 'capstone') { fill = COL.capFill; bd = COL.capFill; tc = COL.capText }
            if (isCompleted && node.kind !== 'month-hdr') { fill = COL.doneFill; bd = COL.doneBd; tc = COL.doneText }
            if (node.isHighlight && !isCompleted) { fill = COL.hlFill; bd = COL.hlFill; tc = COL.hlText }

            const rx = node.kind === 'capstone' ? 10 : 6
            const lx = node.cx - node.w / 2
            const ty = node.cy - node.h / 2
            const titleTrunc = node.item.title.length > 28 ? node.item.title.slice(0, 26) + '…' : node.item.title
            const floatDelay = node.floatDelay

            return (
              <motion.g
                key={node.id}
                onClick={() => handleClick(node)}
                style={{ cursor: node.kind === 'month-hdr' ? 'default' : 'pointer' }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1, y: node.kind !== 'month-hdr' ? [0, -4, 0] : 0 }}
                transition={{
                  opacity: { duration: 0.35, delay: 0.1 },
                  scale:   { duration: 0.35, delay: 0.1 },
                  y:       { repeat: Infinity, duration: 3.5, delay: floatDelay, ease: 'easeInOut' },
                }}
                whileHover={node.kind !== 'month-hdr' ? { scale: 1.06 } : {}}
              >
                {/* Selection ring */}
                {isSelected && (
                  <rect x={lx - 4} y={ty - 4} width={node.w + 8} height={node.h + 8} rx={rx + 3}
                    fill="none" stroke="#2563eb" strokeWidth={3} opacity={0.6} />
                )}

                {/* Main rectangle */}
                <rect x={lx} y={ty} width={node.w} height={node.h} rx={rx}
                  fill={fill} stroke={bd} strokeWidth={2.5} />

                {/* Capstone label row */}
                {node.kind === 'capstone' && (
                  <text x={node.cx} y={ty + 16} textAnchor="middle"
                    fontSize={10} fontWeight={700} fill="#aaaaaa" letterSpacing={2}>
                    {node.item.type === 'deliverable' ? 'CAPSTONE PROJECT' : 'MILESTONE'}
                  </text>
                )}

                {/* Title */}
                <text
                  x={node.cx}
                  y={node.kind === 'capstone' ? node.cy + 9 : node.cy}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={node.kind === 'month-hdr' ? 15 : node.kind === 'capstone' ? 14 : 13}
                  fontWeight={node.kind === 'sub' ? 500 : 700}
                  fill={tc}
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {node.kind === 'month-hdr'
                    ? `${node.item.title}`
                    : titleTrunc}
                </text>

                {/* Week pill on sub-nodes */}
                {node.kind === 'sub' && (
                  <>
                    <rect x={lx + 5} y={ty - 13} width={30} height={15} rx={4} fill="#27272a" />
                    <text x={lx + 20} y={ty - 5} textAnchor="middle"
                      fontSize={9} fontWeight={700} fill="#fff" fontFamily="monospace">
                      W{node.item.week}
                    </text>
                  </>
                )}

                {/* Completion badge (right edge of sub/main nodes) */}
                {isCompleted && node.kind !== 'month-hdr' && (
                  <g transform={`translate(${node.cx + node.w / 2 - 2}, ${node.cy})`}>
                    <circle cx={0} cy={0} r={11} fill={COL.badgeGrn} stroke="#fff" strokeWidth={2} />
                    <text x={0} y={4} textAnchor="middle" fontSize={11} fontWeight={900} fill="#fff">✓</text>
                  </g>
                )}
              </motion.g>
            )
          })}
        </svg>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <NodeModal
            item={modal}
            isCompleted={completedItems.has(modal.id)}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
