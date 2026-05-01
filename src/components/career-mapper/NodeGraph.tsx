import React, { useMemo, useState } from 'react'
import { X } from '@phosphor-icons/react'
import type { CareerRole, SyllabusItem } from '@/types/career'

interface NodeGraphProps {
  role: CareerRole
  completedItems: Set<string>
  onNodeClick: (nodeId: string) => void
  selectedNodeId?: string
}

interface NodePosition {
  id: string
  x: number
  y: number
  title: string
  type: 'core' | 'specialization' | 'milestone'
  completed: boolean
  projectId?: string
}

const COLORS = {
  core: {
    bg: '#fbbf24',
    border: '#ca8a04',
    text: '#1f2937',
    glow: 'rgba(251, 191, 36, 0.3)',
  },
  specialization: {
    bg: '#c084fc',
    border: '#9333ea',
    text: '#ffffff',
    glow: 'rgba(192, 132, 252, 0.3)',
  },
  completed: {
    bg: '#4ade80',
    border: '#22c55e',
    text: '#ffffff',
    glow: 'rgba(74, 222, 128, 0.3)',
  },
}

/**
 * Calculates hierarchical node positions based on syllabus months
 */
function calculateNodePositions(role: CareerRole, completedItems: Set<string>): NodePosition[] {
  const nodes: NodePosition[] = []
  const cols = 4
  const rowHeight = 140
  const colWidth = 200

  // Group items by month
  const monthGroups = {
    1: role.syllabus.filter(i => i.month === 1 && i.type !== 'deliverable').sort((a, b) => a.sortOrder - b.sortOrder),
    2: role.syllabus.filter(i => i.month === 2 && i.type !== 'deliverable').sort((a, b) => a.sortOrder - b.sortOrder),
    3: role.syllabus.filter(i => i.month === 3 && i.type !== 'deliverable').sort((a, b) => a.sortOrder - b.sortOrder),
    4: role.syllabus.filter(i => i.month === 4 && i.type !== 'deliverable').sort((a, b) => a.sortOrder - b.sortOrder),
  }

  // Add topic nodes
  Object.entries(monthGroups).forEach(([monthStr, items]) => {
    const month = parseInt(monthStr) as 1 | 2 | 3 | 4
    const x = (month - 1) * colWidth + 60
    items.forEach((item, idx) => {
      const y = idx * rowHeight + 80
      const isCompleted = completedItems.has(item.id)
      nodes.push({
        id: item.id,
        x,
        y,
        title: item.title,
        type: idx < 2 ? 'core' : 'specialization',
        completed: isCompleted,
        projectId: item.projectId,
      })
    })
  })

  // Add milestone nodes (projects)
  const milestones = role.syllabus.filter(i => i.type === 'deliverable').sort((a, b) => a.month - b.month || a.sortOrder - b.sortOrder)
  milestones.forEach((milestone, idx) => {
    const x = ((milestone.month - 1) * colWidth) + 60 + (idx % 2) * 120
    const y = (Math.floor(idx / 2) + 4) * rowHeight + 80
    const isCompleted = completedItems.has(milestone.id)
    nodes.push({
      id: milestone.id,
      x,
      y,
      title: milestone.title,
      type: 'milestone',
      completed: isCompleted,
      projectId: milestone.projectId,
    })
  })

  return nodes
}

/**
 * Draws SVG connectors between related nodes
 */
function SVGConnectors({ nodes }: { nodes: NodePosition[] }) {
  const paths: JSX.Element[] = []

  // Connect sequential nodes in the same month
  nodes.forEach((node, idx) => {
    if (node.type !== 'milestone') {
      const nextNode = nodes.find(n => n.y === node.y + 140 && n.x === node.x && n.type !== 'milestone')
      if (nextNode) {
        const completedBoth = node.completed && nextNode.completed
        const strokeColor = completedBoth ? '#4ade80' : 'rgba(255,255,255,0.1)'
        paths.push(
          <line
            key={`${node.id}-${nextNode.id}`}
            x1={node.x + 60}
            y1={node.y + 60}
            x2={nextNode.x + 60}
            y2={nextNode.y}
            stroke={strokeColor}
            strokeWidth={2}
            strokeDasharray={completedBoth ? '0' : '4'}
          />
        )
      }
    }
  })

  // Connect months
  for (let month = 1; month < 4; month++) {
    const currentMonth = nodes.filter(n => n.x === (month - 1) * 200 + 60 && n.type !== 'milestone')
    const nextMonth = nodes.filter(n => n.x === month * 200 + 60 && n.type !== 'milestone')

    if (currentMonth.length > 0 && nextMonth.length > 0) {
      const lastCurrent = currentMonth[currentMonth.length - 1]
      const firstNext = nextMonth[0]
      if (lastCurrent && firstNext) {
        const completedBoth = lastCurrent.completed && firstNext.completed
        paths.push(
          <path
            key={`month-${month}-bridge`}
            d={`M ${lastCurrent.x + 60} ${lastCurrent.y + 60} Q ${(lastCurrent.x + firstNext.x) / 2} ${(lastCurrent.y + firstNext.y) / 2} ${firstNext.x + 60} ${firstNext.y}`}
            stroke={completedBoth ? '#4ade80' : 'rgba(255,255,255,0.1)'}
            strokeWidth={2}
            fill="none"
            strokeDasharray={completedBoth ? '0' : '4'}
          />
        )
      }
    }
  }

  return <>{paths}</>
}

/**
 * Individual node card
 */
function NodeCard({
  node,
  isSelected,
  onClick,
}: {
  node: NodePosition
  isSelected: boolean
  onClick: () => void
}) {
  const colorScheme = node.completed ? COLORS.completed : COLORS[node.type]

  return (
    <g key={node.id}>
      {/* Glow effect */}
      {isSelected && (
        <rect
          x={node.x - 5}
          y={node.y - 5}
          width={120}
          height={120}
          fill={colorScheme.glow}
          rx={12}
        />
      )}

      {/* Main card */}
      <rect
        x={node.x}
        y={node.y}
        width={110}
        height={110}
        rx={10}
        fill={colorScheme.bg}
        stroke={colorScheme.border}
        strokeWidth={2}
        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={onClick}
      />

      {/* Checkmark if completed */}
      {node.completed && (
        <text
          x={node.x + 95}
          y={node.y + 20}
          fontSize={18}
          fontWeight="bold"
          fill={colorScheme.text}
        >
          ✓
        </text>
      )}

      {/* Title */}
      <text
        x={node.x + 55}
        y={node.y + 55}
        textAnchor="middle"
        fontSize={11}
        fontWeight="700"
        fill={colorScheme.text}
        style={{
          pointerEvents: 'none',
          overflow: 'hidden',
          maxWidth: 100,
          wordBreak: 'break-word',
        }}
      >
        {node.title.split(' ').slice(0, 2).join(' ')}
      </text>

      {/* Type badge */}
      <circle cx={node.x + 10} cy={node.y + 10} r={5} fill={colorScheme.border} />
    </g>
  )
}

/**
 * Main node graph component
 */
export function NodeGraph({
  role,
  completedItems,
  onNodeClick,
  selectedNodeId,
}: NodeGraphProps) {
  const nodes = useMemo(
    () => calculateNodePositions(role, completedItems),
    [role, completedItems]
  )

  const maxX = Math.max(...nodes.map(n => n.x)) + 140
  const maxY = Math.max(...nodes.map(n => n.y)) + 140

  const legendItems = [
    { color: COLORS.core.bg, label: 'Core Skills', border: COLORS.core.border },
    { color: COLORS.specialization.bg, label: 'Specializations', border: COLORS.specialization.border },
    { color: COLORS.completed.bg, label: 'Completed', border: COLORS.completed.border },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
        }}
      >
        {legendItems.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: item.color,
                border: `2px solid ${item.border}`,
              }}
            />
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* SVG Canvas */}
      <div style={{ overflowX: 'auto', borderRadius: 10, background: 'rgba(0,0,0,0.3)' }}>
        <svg
          width={Math.max(800, maxX)}
          height={Math.max(600, maxY)}
          style={{ minWidth: '100%', background: '#0a0a0a' }}
        >
          {/* Connectors */}
          <SVGConnectors nodes={nodes} />

          {/* Nodes */}
          {nodes.map(node => (
            <NodeCard
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onClick={() => onNodeClick(node.id)}
            />
          ))}

          {/* Month labels */}
          {[1, 2, 3, 4].map((month) => (
            <text
              key={`month-${month}`}
              x={(month - 1) * 200 + 60}
              y={30}
              fontSize={13}
              fontWeight="700"
              fill="rgba(255,255,255,0.5)"
              letterSpacing="0.1em"
            >
              M{month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}
