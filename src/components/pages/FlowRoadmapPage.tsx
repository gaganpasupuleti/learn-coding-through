import { memo, useCallback, useState } from 'react'
import { RoadmapFlow } from '@/components/roadmap/RoadmapFlow'
import { ROADMAP_OPTIONS } from '@/lib/roadmap-options'

const MemoRoadmapFlow = memo(RoadmapFlow)

const FEATURED = ['frontend', 'backend', 'devops', 'python', 'ai-engineer']

export function FlowRoadmapPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState(
    ROADMAP_OPTIONS.find((r) => r.id === 'frontend') || ROADMAP_OPTIONS[0],
  )

  const handleSelectRoadmap = useCallback((id: string) => {
    const found = ROADMAP_OPTIONS.find((opt) => opt.id === id)
    if (found) setSelectedRoadmap(found)
  }, [])

  return (
    <div className="min-h-screen py-8 bg-background relative">
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-full relative z-10">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Flow Path</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Interactive skill graphs—explore {ROADMAP_OPTIONS.length} industry roadmaps (Developer Roadmap–style topics). For role-first timelines and your 4-month syllabus, use <strong className="text-foreground font-semibold">Career Map</strong> in the nav.
          </p>
          
          <div className="mt-8 flex flex-col items-center justify-center gap-6">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {ROADMAP_OPTIONS.filter(opt => FEATURED.includes(opt.id)).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectRoadmap(opt.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border-2 ${
                    selectedRoadmap.id === opt.id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105' 
                      : 'bg-card border-border/50 text-muted-foreground hover:border-indigo-400 hover:text-indigo-400 shadow-sm'
                  }`}
                >
                  {opt.title}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
              <label htmlFor="roadmap-select" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Full Roadmap Catalog:
              </label>
              <select
                id="roadmap-select"
                value={selectedRoadmap.id}
                onChange={(e) => handleSelectRoadmap(e.target.value)}
                className="bg-card border-2 border-border/50 text-card-foreground text-sm font-bold rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block px-4 py-2.5 min-w-[280px] shadow-sm cursor-pointer hover:border-indigo-500/50 transition-colors"
              >
                {ROADMAP_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="mx-auto mb-4 max-w-4xl rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-left text-sm text-slate-600 shadow-sm md:text-center">
          <span className="font-semibold text-slate-800">How to use:</span>{' '}
          <span className="text-slate-600">
            Drag the canvas to pan. Use the <strong className="text-slate-800">+ / −</strong> controls (bottom-left) to zoom.
            On desktop, the <strong className="text-slate-800">minimap</strong> helps you jump around large graphs. Drag nodes to
            rearrange if needed.
          </span>
        </div>

        <div className="mx-auto mb-6 max-w-4xl rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Map legend</h2>
          <ul className="grid sm:grid-cols-3 gap-3 text-left">
            <li className="flex gap-2 items-start">
              <span className="mt-0.5 h-6 w-6 shrink-0 rounded bg-[#ffcc00] border-2 border-black" aria-hidden />
              <span>
                <strong className="text-slate-800">Topic</strong> — main skill area (yellow). Start here when you are new to a track.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-[#9b51e0] border-2 border-black" aria-hidden />
              <span>
                <strong className="text-slate-800">Subtopic</strong> — deeper focus (purple). Follow edges top-to-bottom like a syllabus.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="mt-0.5 text-xs font-black text-slate-900 uppercase tracking-widest leading-tight" aria-hidden>
                T
              </span>
              <span>
                <strong className="text-slate-800">Title</strong> — roadmap header. Use the catalog above to switch tracks; graphs are read-only guides (progress lives in Career Map, Projects, and Quiz).
              </span>
            </li>
          </ul>
        </div>

        {/* Roadmap Flow Renderer */}
        <div className="px-0 sm:px-2">
          <MemoRoadmapFlow roadmapPath={selectedRoadmap.path} />
        </div>
        
      </div>
    </div>
  )
}

