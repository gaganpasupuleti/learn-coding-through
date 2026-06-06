import type { Edge, Node } from '@xyflow/react'

export interface RoadmapGraph {
  nodes: Node[]
  edges: Edge[]
}

const graphCache = new Map<string, RoadmapGraph>()
const inflight = new Map<string, Promise<RoadmapGraph>>()

function normalizeNodes(rawNodes: Record<string, unknown>[]): Node[] {
  return rawNodes.map((node) => ({
    ...node,
    data: {
      ...(node.data as object),
      label: (node.data as { label?: string })?.label || String(node.id ?? ''),
    },
    draggable: true,
  })) as Node[]
}

function normalizeEdges(rawEdges: Record<string, unknown>[], animateEdges: boolean): Edge[] {
  return rawEdges.map((edge) => ({
    ...edge,
    sourceHandle: undefined,
    targetHandle: undefined,
    type: 'smoothstep',
    animated: animateEdges,
  })) as Edge[]
}

const EDGE_ANIMATION_MAX = 48

export function shouldAnimateRoadmapEdges(edgeCount: number): boolean {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false
  }
  return edgeCount <= EDGE_ANIMATION_MAX
}

export async function loadRoadmapGraph(roadmapPath: string, signal?: AbortSignal): Promise<RoadmapGraph> {
  const cached = graphCache.get(roadmapPath)
  if (cached) return cached

  const pending = inflight.get(roadmapPath)
  if (pending) return pending

  const request = (async () => {
    const response = await fetch(`/roadmaps/${roadmapPath}`, { signal })

    if (!response.ok) {
      throw new Error(`Roadmap file not found (${response.status})`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Received non-JSON response from server. The roadmap file might be missing or invalid.')
    }

    const data = (await response.json()) as { nodes?: Record<string, unknown>[]; edges?: Record<string, unknown>[] }
    const rawEdges = data.edges || []
    const graph: RoadmapGraph = {
      nodes: normalizeNodes(data.nodes || []),
      edges: normalizeEdges(rawEdges, shouldAnimateRoadmapEdges(rawEdges.length)),
    }

    graphCache.set(roadmapPath, graph)
    inflight.delete(roadmapPath)
    return graph
  })()

  inflight.set(roadmapPath, request)

  try {
    return await request
  } catch (error) {
    inflight.delete(roadmapPath)
    throw error
  }
}

export function clearRoadmapGraphCache(): void {
  graphCache.clear()
  inflight.clear()
}
