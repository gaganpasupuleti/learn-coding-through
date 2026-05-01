import React, { useEffect, useState, useMemo } from 'react'
import { CheckCircle, Lock, CaretDown, CaretUp } from '@phosphor-icons/react'
import { StageResponse } from '@/types/roadmap' // Wait, I should define this in the file or look it up

export interface Stage {
  id: number
  order_number: number
  title: string
  description: string
  unlock_quiz_score: number
  unlock_exercise_completion: number
  unlocked: boolean
  completed: boolean
}

interface RoadmapCanvasProps {
  roleId: number
}

const ROW_HEIGHT = 180
const CANVAS_WIDTH = 800
const NODE_WIDTH = 300
const NODE_HEIGHT = 100

export function RoadmapCanvas({ roleId }: RoadmapCanvasProps) {
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedNode, setExpandedNode] = useState<number | null>(null)

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        const res = await fetch(`/api/v1/roadmap/${roleId}`)
        if (res.ok) {
          const data = await res.json()
          setStages(data.stages)
        }
      } catch (err) {
        console.error('Failed to fetch roadmap', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRoadmap()
  }, [roleId])

  // Calculate positions
  const nodes = useMemo(() => {
    return stages.map((stage, index) => {
      const row = index
      // Alternating zig-zag
      const isEven = row % 2 === 0
      const x = isEven ? 100 : CANVAS_WIDTH - 100 - NODE_WIDTH
      const y = 80 + row * ROW_HEIGHT
      return { ...stage, x, y }
    })
  }, [stages])

  // Calculate SVG Paths
  const paths = useMemo(() => {
    const p = []
    for (let i = 0; i < nodes.length - 1; i++) {
      const current = nodes[i]
      const next = nodes[i + 1]
      
      const startX = current.x + NODE_WIDTH / 2
      const startY = current.y + NODE_HEIGHT
      const endX = next.x + NODE_WIDTH / 2
      const endY = next.y
      
      // Bezier curve
      const controlY1 = startY + 80
      const controlY2 = endY - 80
      
      const isMastered = current.completed
      p.push({
        d: `M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`,
        isMastered,
        id: `path-${current.id}-${next.id}`
      })
    }
    return p
  }, [nodes])

  if (loading) {
    return <div className="flex items-center justify-center h-full text-slate-400">Loading roadmap...</div>
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#0f172a', minHeight: '800px' }}>
      
      <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 0 }}>
        {paths.map(path => (
          <path
            key={path.id}
            d={path.d}
            fill="none"
            stroke={path.isMastered ? '#22c55e' : '#334155'}
            strokeWidth="4"
            strokeDasharray={path.isMastered ? 'none' : '8 8'}
            className="transition-colors duration-1000"
          />
        ))}
      </svg>

      <div className="relative z-10 w-full h-full" style={{ height: Math.max(800, nodes.length * ROW_HEIGHT + 200) }}>
        {nodes.map((node) => {
          const isCompleted = node.completed
          const isUnlocked = node.unlocked && !isCompleted
          const isLocked = !node.unlocked
          const isExpanded = expandedNode === node.id

          let bg = '#1e293b'
          let border = '1px solid #334155'
          let opacity = 1
          let pulseClass = ''

          if (isCompleted) {
            bg = '#22c55e'
            border = '1px solid #16a34a'
          } else if (isUnlocked) {
            border = '2px solid #22c55e'
            pulseClass = 'animate-pulse-border'
          } else if (isLocked) {
            opacity = 0.5
            bg = '#0f172a'
          }

          return (
            <div
              key={node.id}
              className={`absolute flex flex-col transition-all duration-300 ${!isLocked && !isCompleted ? 'hover:scale-[1.02] cursor-pointer' : ''}`}
              style={{
                left: node.x,
                top: node.y,
                width: NODE_WIDTH,
                backgroundColor: bg,
                border: border,
                borderRadius: '12px',
                opacity: opacity,
                boxShadow: isUnlocked ? '0 0 15px rgba(34, 197, 94, 0.2)' : '0 4px 6px rgba(0,0,0,0.3)',
                color: isCompleted ? '#ffffff' : '#f8fafc',
              }}
              onClick={() => {
                if (!isLocked) {
                  setExpandedNode(isExpanded ? null : node.id)
                }
              }}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle size={24} weight="bold" color="#ffffff" />
                    ) : isLocked ? (
                      <Lock size={24} color="#64748b" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-[#22c55e] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isCompleted ? 'text-white' : 'text-slate-200'}`}>
                      {node.title}
                    </h3>
                    <div className={`text-xs ${isCompleted ? 'text-green-100' : 'text-slate-400'}`}>
                      Stage {node.order_number}
                    </div>
                  </div>
                </div>
                {!isLocked && (
                  <div className="flex-shrink-0">
                    {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                  </div>
                )}
              </div>

              {isExpanded && !isLocked && (
                <div className="px-4 pb-4 border-t border-slate-700/50 mt-2 pt-3">
                  <p className={`text-xs leading-relaxed ${isCompleted ? 'text-green-50' : 'text-slate-300'}`}>
                    {node.description}
                  </p>
                  {!isCompleted && (
                    <button className="mt-4 w-full py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded text-xs font-bold transition-colors">
                      Start Stage
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}} />
    </div>
  )
}
