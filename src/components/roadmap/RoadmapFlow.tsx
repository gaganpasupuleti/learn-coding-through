import React, { useEffect, useState, useMemo } from 'react'
import type { Edge, Node, EdgeTypes, NodeTypes } from '@xyflow/react'
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

/** Keeps the first paint readable: avoid zooming out to a postage-stamp graph. */
const INITIAL_FIT_OPTIONS = {
  padding: 0.1,
  minZoom: 0.52,
  maxZoom: 1.45,
  duration: 220,
} as const

function AutoFitReadableZoom({ roadmapPath, nodeCount }: { roadmapPath: string; nodeCount: number }) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    if (nodeCount === 0) return
    const id = window.setTimeout(() => {
      void fitView({ ...INITIAL_FIT_OPTIONS })
    }, 100)
    return () => clearTimeout(id)
  }, [roadmapPath, nodeCount, fitView])

  return null
}

// ── Custom Node Components ──────────────────────────────────────────────────

const RoadmapNode = ({ data, selected, type }: NodeProps) => {
  const isTopic = type === 'topic'
  const isSubtopic = type === 'subtopic'
  const isTitle = type === 'title'

  return (
    <div
      className={`transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)]
      ${selected ? 'ring-4 ring-blue-500/50' : ''}
      ${isTopic ? 'bg-[#ffcc00] text-black border-2 border-black font-black uppercase tracking-wider px-6 py-3 shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-lg' : 
        isSubtopic ? 'bg-[#9b51e0] text-white border-2 border-black font-semibold px-4 py-2 shadow-[3px_3px_0_rgba(0,0,0,1)] rounded-full' : 
        isTitle ? 'bg-transparent text-slate-900 text-xl md:text-2xl font-black uppercase tracking-widest drop-shadow-sm' :
        'bg-slate-100 text-black border-2 border-black font-bold px-4 py-2 shadow-[3px_3px_0_rgba(0,0,0,1)] rounded-lg'}
    `}
      style={{
        fontFamily: 'var(--font-space)',
      }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="text-center">
        {String((data as { label?: unknown }).label ?? '')}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}

// ── Custom Edge Component with Flowing Animation ─────────────────────────────

const FlowingEdge = (props: EdgeProps) => {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd } = props
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 3,
          stroke: '#94a3b8',
          opacity: 0.35,
        }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="#6366f1"
        strokeWidth={3}
        strokeDasharray="10, 10"
        className="animate-flowing-line"
        style={{
          filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.35))',
        }}
      />
    </>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

interface RoadmapFlowProps {
  roadmapPath: string
}

function RoadmapFlowCanvas({
  roadmapPath,
  initialNodes,
  initialEdges,
  nodeTypes,
  edgeTypes,
  showMiniMap,
}: {
  roadmapPath: string
  initialNodes: Node[]
  initialEdges: Edge[]
  nodeTypes: NodeTypes
  edgeTypes: EdgeTypes
  showMiniMap: boolean
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, roadmapPath, setNodes, setEdges])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView={false}
      minZoom={0.08}
      maxZoom={2}
      colorMode="light"
      preventScrolling={false}
      zoomOnPinch={true}
      zoomOnDoubleClick={false}
      elementsSelectable={true}
      nodesConnectable={false}
      nodesDraggable={true}
    >
      <AutoFitReadableZoom roadmapPath={roadmapPath} nodeCount={nodes.length} />
      <Background color="#64748b" className="opacity-[0.12]" gap={25} size={1} variant={BackgroundVariant.Dots} />
      <Controls className="border border-slate-200 bg-white shadow-md [&_button]:fill-slate-700" showInteractive={false} />
      {showMiniMap ? (
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'topic') return '#ffcc00'
            if (n.type === 'subtopic') return '#9b51e0'
            return '#e2e8f0'
          }}
          maskColor="rgba(148, 163, 184, 0.2)"
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        />
      ) : null}
    </ReactFlow>
  )
}

export function RoadmapFlow({ roadmapPath }: RoadmapFlowProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMiniMap, setShowMiniMap] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => setShowMiniMap(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const nodeTypes = useMemo(
    () => ({
      topic: RoadmapNode,
      subtopic: RoadmapNode,
      title: RoadmapNode,
      paragraph: RoadmapNode,
      vertical: () => <div className="w-1 h-full bg-slate-200 rounded-full" />,
    }),
    [],
  )

  const edgeTypes = useMemo(
    () => ({
      smoothstep: FlowingEdge,
      default: FlowingEdge,
    }),
    [],
  )

  useEffect(() => {
    async function loadRoadmap() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/roadmaps/${roadmapPath}`)

        if (!response.ok) {
          throw new Error(`Roadmap file not found (${response.status})`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server. The roadmap file might be missing or invalid.')
        }

        const data = await response.json()

        const rfNodes = (data.nodes || []).map((node: Record<string, unknown>) => ({
          ...node,
          data: {
            ...(node.data as object),
            label: (node.data as { label?: string })?.label || node.id,
          },
          draggable: true,
        })) as Node[]

        const rfEdges = (data.edges || []).map((edge: Record<string, unknown>) => ({
          ...edge,
          sourceHandle: undefined,
          targetHandle: undefined,
          type: 'smoothstep',
          animated: true,
        })) as Edge[]

        setNodes(rfNodes)
        setEdges(rfEdges)
      } catch (err: unknown) {
        console.error('Roadmap Load Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load roadmap')
      } finally {
        setLoading(false)
      }
    }

    if (roadmapPath) {
      void loadRoadmap()
    }
  }, [roadmapPath])

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 px-6 py-16 text-slate-600 shadow-sm">
        <p className="text-sm font-medium">Loading learning path…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50/90 px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-800">Could not load this roadmap</p>
        <p className="max-w-md text-xs text-red-700/90">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 md:h-[calc(100vh-100px)] md:min-h-[600px]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes flowingLine {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .animate-flowing-line {
          animation: flowingLine 0.5s linear infinite;
        }
      `,
        }}
      />

      <ReactFlowProvider>
        <RoadmapFlowCanvas
          key={roadmapPath}
          roadmapPath={roadmapPath}
          initialNodes={nodes}
          initialEdges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          showMiniMap={showMiniMap}
        />
      </ReactFlowProvider>
    </div>
  )
}
