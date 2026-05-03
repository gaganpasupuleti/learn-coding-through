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
    <div className={`transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)]
      ${selected ? 'ring-4 ring-blue-500/50' : ''}
      ${isTopic ? 'bg-[#ffcc00] text-black border-2 border-black font-black uppercase tracking-wider px-6 py-3 shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-lg' : 
        isSubtopic ? 'bg-[#9b51e0] text-white border-2 border-black font-semibold px-4 py-2 shadow-[3px_3px_0_rgba(0,0,0,1)] rounded-full' : 
        isTitle ? 'bg-transparent text-white text-2xl font-black uppercase tracking-widest' :
        'bg-slate-100 text-black border-2 border-black font-bold px-4 py-2 shadow-[3px_3px_0_rgba(0,0,0,1)] rounded-lg'}
    `}
    style={{
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
          strokeWidth: 4, 
          stroke: '#6366f1', // indigo-500
          opacity: 0.2
        }} 
      />
      <path
        d={edgePath}
        fill="none"
        stroke="#8b5cf6" // purple-500
        strokeWidth={4}
        strokeDasharray="10, 10"
        className="animate-flowing-line"
        style={{
          filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.5))'
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
    vertical: (props: any) => <div className="w-1 h-full bg-border/30 rounded-full" />,
  }), []);

  const edgeTypes = useMemo(() => ({
    smoothstep: FlowingEdge,
    default: FlowingEdge,
  }), []);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/roadmaps/${roadmapPath}`);
        
        if (!response.ok) {
          throw new Error(`Roadmap file not found (${response.status})`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response from server. The roadmap file might be missing or invalid.");
        }

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
        console.error('Roadmap Load Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (roadmapPath) {
      loadRoadmap();
    }
  }, [roadmapPath, setNodes, setEdges]);

  if (loading) return <div className="flex items-center justify-center h-[600px] text-muted-foreground">Loading learning path...</div>;
  if (error) return <div className="flex items-center justify-center h-[600px] text-destructive">Error: {error}</div>;

  return (
    <div className="w-full h-[70vh] md:h-[calc(100vh-100px)] min-h-[500px] md:min-h-[600px] bg-transparent border-none overflow-hidden relative">
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
        preventScrolling={false}
        paneMoveable={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        elementsSelectable={true}
        nodesConnectable={false}
        nodesDraggable={true}
      >
        <Background color="currentColor" className="opacity-10" gap={25} size={1} variant="dots" />
        <Controls className="bg-card border-border fill-foreground" showInteractive={false} />
        <MiniMap 
          nodeColor={(n) => {
            if (n.type === 'topic') return '#ffcc00';
            if (n.type === 'subtopic') return '#9b51e0';
            return '#f1f5f9';
          }}
          maskColor="rgba(0, 0, 0, 0.3)"
          style={{ 
            backgroundColor: 'hsl(var(--card))', 
            borderRadius: '12px', 
            border: '1px solid hsl(var(--border))',
            display: window.innerWidth < 768 ? 'none' : 'block' 
          }}
        />
      </ReactFlow>
    </div>
  );
}

