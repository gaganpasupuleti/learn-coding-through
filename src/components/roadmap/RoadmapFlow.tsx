import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import type { Edge, Node, EdgeTypes, NodeTypes, NodeProps, EdgeProps } from '@xyflow/react'
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
  BaseEdge,
  getSmoothStepPath,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { loadRoadmapGraph } from '@/lib/roadmap-flow-data'
import { FlowNodeDetailPanel } from '@/components/roadmap/FlowNodeDetailPanel'

const INITIAL_FIT_OPTIONS = {
  padding: 0.1,
  minZoom: 0.52,
  maxZoom: 1.45,
  duration: 220,
} as const

const MINIMAP_NODE_THRESHOLD = 180

const flowStyles = `
@keyframes flowingLine {
  from { stroke-dashoffset: 20; }
  to { stroke-dashoffset: 0; }
}
.animate-flowing-line {
  animation: flowingLine 0.5s linear infinite;
}
`

const VerticalSpacerNode = memo(function VerticalSpacerNode() {
  return <div className="w-1 h-full bg-slate-200 rounded-full" />
})

const RoadmapNode = memo(function RoadmapNode({ data, selected, type }: NodeProps) {
  const isTopic = type === 'topic'
  const isSubtopic = type === 'subtopic'
  const isTitle = type === 'title'
  const label = String((data as { label?: unknown }).label ?? '')

  return (
    <div
      className={`transition-transform duration-200 hover:-translate-y-0.5
      ${selected ? 'ring-4 ring-blue-500/50' : ''}
      ${isTopic ? 'bg-[#ffcc00] text-black border-2 border-black font-black uppercase tracking-wider px-6 py-3 shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-lg' :
        isSubtopic ? 'bg-[#9b51e0] text-white border-2 border-black font-semibold px-4 py-2 shadow-[3px_3px_0_rgba(0,0,0,1)] rounded-full' :
        isTitle ? 'bg-transparent text-slate-900 text-xl md:text-2xl font-black uppercase tracking-widest drop-shadow-sm' :
        'bg-slate-100 text-black border-2 border-black font-bold px-4 py-2 shadow-[3px_3px_0_rgba(0,0,0,1)] rounded-lg'}
    `}
      style={{ fontFamily: 'var(--font-space)' }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="text-center">{label}</div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
})

const StaticEdge = memo(function StaticEdge(props: EdgeProps) {
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
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: 2.5,
        stroke: '#94a3b8',
      }}
    />
  )
})

const FlowingEdge = memo(function FlowingEdge(props: EdgeProps) {
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
        style={{ filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.35))' }}
      />
    </>
  )
})

const nodeTypes: NodeTypes = {
  topic: RoadmapNode,
  subtopic: RoadmapNode,
  title: RoadmapNode,
  paragraph: RoadmapNode,
  vertical: VerticalSpacerNode,
}

const staticEdgeTypes: EdgeTypes = {
  smoothstep: StaticEdge,
  default: StaticEdge,
}

const flowingEdgeTypes: EdgeTypes = {
  smoothstep: FlowingEdge,
  default: FlowingEdge,
}

function AutoFitReadableZoom({ roadmapPath, nodeCount }: { roadmapPath: string; nodeCount: number }) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    if (nodeCount === 0) return
    const id = window.setTimeout(() => {
      void fitView({ ...INITIAL_FIT_OPTIONS })
    }, 80)
    return () => clearTimeout(id)
  }, [roadmapPath, nodeCount, fitView])

  return null
}

interface RoadmapFlowCanvasProps {
  roadmapPath: string
  initialNodes: Node[]
  initialEdges: Edge[]
  useFlowingEdges: boolean
  showMiniMap: boolean
  onNodeOpen: (node: Node) => void
  onPaneClick: () => void
}

const RoadmapFlowCanvas = memo(function RoadmapFlowCanvas({
  roadmapPath,
  initialNodes,
  initialEdges,
  useFlowingEdges,
  showMiniMap,
  onNodeOpen,
  onPaneClick,
}: RoadmapFlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const edgeTypes = useFlowingEdges ? flowingEdgeTypes : staticEdgeTypes

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, roadmapPath, setNodes, setEdges])

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeOpen(node)
    },
    [onNodeOpen],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onPaneClick={onPaneClick}
      fitView={false}
      minZoom={0.08}
      maxZoom={2}
      colorMode="light"
      preventScrolling={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      elementsSelectable
      nodesConnectable={false}
      nodesDraggable
      onlyRenderVisibleElements
      elevateNodesOnSelect={false}
      selectNodesOnDrag={false}
      proOptions={{ hideAttribution: true }}
    >
      <AutoFitReadableZoom roadmapPath={roadmapPath} nodeCount={nodes.length} />
      <Background color="#64748b" className="opacity-[0.12]" gap={25} size={1} variant={BackgroundVariant.Dots} />
      <Controls className="border border-slate-200 bg-white shadow-md [&_button]:fill-slate-700" showInteractive={false} />
      {showMiniMap ? (
        <MiniMap
          pannable
          zoomable
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            if (node.type === 'topic') return '#ffcc00'
            if (node.type === 'subtopic') return '#9b51e0'
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
})

interface RoadmapFlowProps {
  roadmapPath: string
}

export function RoadmapFlow({ roadmapPath }: RoadmapFlowProps) {
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMiniMap, setShowMiniMap] = useState(false)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => setShowMiniMap(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadRoadmap() {
      setLoading(true)
      setError(null)
      setSelectedNode(null)

      try {
        const loaded = await loadRoadmapGraph(roadmapPath, controller.signal)
        if (!active) return
        setGraph(loaded)
      } catch (err: unknown) {
        if (!active || controller.signal.aborted) return
        console.error('Roadmap Load Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load roadmap')
        setGraph(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    if (roadmapPath) {
      void loadRoadmap()
    }

    return () => {
      active = false
      controller.abort()
    }
  }, [roadmapPath])

  const useFlowingEdges = useMemo(
    () => (graph ? graph.edges.some((edge) => edge.animated) : false),
    [graph],
  )

  const enableMiniMap = showMiniMap && (graph?.nodes.length ?? 0) <= MINIMAP_NODE_THRESHOLD

  const handleNodeOpen = useCallback((node: Node) => {
    setSelectedNode(node)
  }, [])

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-6 py-16 text-slate-600 shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" aria-hidden />
        <p className="text-sm font-medium">Loading learning path…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50/90 px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-800">Could not load this roadmap</p>
        <p className="max-w-md text-xs text-red-700/90">{error}</p>
        <button
          type="button"
          className="mt-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-50"
          onClick={() => {
            setLoading(true)
            setError(null)
            void loadRoadmapGraph(roadmapPath).then(setGraph).catch((err: unknown) => {
              setError(err instanceof Error ? err.message : 'Failed to load roadmap')
            }).finally(() => setLoading(false))
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!graph) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 px-6 py-12 text-sm text-slate-600">
        No roadmap data available.
      </div>
    )
  }

  const selectedLabel = String((selectedNode?.data as { label?: unknown })?.label ?? '')

  return (
    <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 md:h-[calc(100vh-100px)] md:min-h-[600px]">
      <style dangerouslySetInnerHTML={{ __html: useFlowingEdges ? flowStyles : '' }} />

      <ReactFlowProvider>
        <RoadmapFlowCanvas
          key={roadmapPath}
          roadmapPath={roadmapPath}
          initialNodes={graph.nodes}
          initialEdges={graph.edges}
          useFlowingEdges={useFlowingEdges}
          showMiniMap={enableMiniMap}
          onNodeOpen={handleNodeOpen}
          onPaneClick={handlePaneClick}
        />
      </ReactFlowProvider>

      {selectedNode ? (
        <FlowNodeDetailPanel
          label={selectedLabel}
          nodeType={selectedNode.type}
          onClose={() => setSelectedNode(null)}
        />
      ) : null}
    </div>
  )
}
