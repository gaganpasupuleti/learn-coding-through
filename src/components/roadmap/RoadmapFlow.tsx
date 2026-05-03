import React, { useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ── Custom Node Components ──────────────────────────────────────────────────

const RoadmapNode = ({ data, selected, type }: NodeProps) => {
  const isTopic = type === 'topic';
  const isSubtopic = type === 'subtopic';
  const isTitle = type === 'title';

  return (
    <div className={`px-4 py-2 rounded-xl border transition-all duration-300 shadow-sm
      ${selected ? 'ring-2 ring-blue-500/50 border-blue-500' : 'border-slate-800'}
      ${isTopic ? 'bg-blue-600/10 border-blue-500/30 text-blue-100 min-w-[150px]' : 
        isSubtopic ? 'bg-slate-800/40 border-slate-700 text-slate-300 min-w-[120px]' : 
        isTitle ? 'bg-transparent border-none text-white text-xl font-bold uppercase tracking-wider' :
        'bg-slate-900/60 border-slate-800 text-slate-400'}
    `}
    style={{
      backdropFilter: 'blur(8px)',
      fontFamily: 'var(--font-space)',
    }}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="text-center">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

// ── Custom Edge Component with Flowing Animation ─────────────────────────────

const FlowingEdge = (props: EdgeProps) => {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd } = props;
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          strokeWidth: 2.5, 
          stroke: '#3b82f6',
          opacity: 0.3
        }} 
      />
      <path
        d={edgePath}
        fill="none"
        stroke="#60a5fa"
        strokeWidth={2.5}
        strokeDasharray="10, 10"
        className="animate-flowing-line"
        style={{
          filter: 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.5))'
        }}
      />
    </>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

interface RoadmapFlowProps {
  roadmapPath: string;
}

export function RoadmapFlow({ roadmapPath }: RoadmapFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({
    topic: RoadmapNode,
    subtopic: RoadmapNode,
    title: RoadmapNode,
    paragraph: RoadmapNode,
    vertical: (props: any) => <div className="w-1 h-full bg-slate-800/50 rounded-full" />,
  }), []);

  const edgeTypes = useMemo(() => ({
    smoothstep: FlowingEdge,
    default: FlowingEdge,
  }), []);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        setLoading(true);
        const response = await fetch(`/roadmaps/${roadmapPath}`);
        if (!response.ok) throw new Error('Failed to load roadmap data');
        const data = await response.json();
        
        const rfNodes = (data.nodes || []).map((node: any) => ({
          ...node,
          data: { 
            ...node.data, 
            label: node.data?.label || node.id 
          },
          draggable: true,
        }));

        const rfEdges = (data.edges || []).map((edge: any) => ({
          ...edge,
          sourceHandle: undefined,
          targetHandle: undefined,
          type: 'smoothstep',
          animated: true,
        }));

        setNodes(rfNodes);
        setEdges(rfEdges);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (roadmapPath) {
      loadRoadmap();
    }
  }, [roadmapPath, setNodes, setEdges]);

  if (loading) return <div className="flex items-center justify-center h-[600px] text-slate-400">Loading learning path...</div>;
  if (error) return <div className="flex items-center justify-center h-[600px] text-red-400">Error: {error}</div>;

  return (
    <div className="w-full h-[85vh] bg-[#020617] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flowingLine {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .animate-flowing-line {
          animation: flowingLine 0.5s linear infinite;
        }
      `}} />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.05}
        maxZoom={2}
        colorMode="dark"
      >
        <Background color="#1e293b" gap={25} size={1} variant="dots" />
        <Controls className="bg-slate-900 border-slate-800 fill-white" />
        <MiniMap 
          nodeColor={(n) => {
            if (n.type === 'topic') return '#3b82f6';
            if (n.type === 'subtopic') return '#64748b';
            return '#1e293b';
          }}
          maskColor="rgba(2, 6, 23, 0.8)"
          style={{ backgroundColor: '#0f172a', borderRadius: '12px' }}
        />
      </ReactFlow>
    </div>
  );
}
