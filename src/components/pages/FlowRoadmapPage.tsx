import { useState } from 'react'
import { RoadmapFlow } from '@/components/roadmap/RoadmapFlow'
import { ROADMAP_OPTIONS } from '@/lib/roadmap-options'

const FEATURED = ['frontend', 'backend', 'devops', 'python', 'ai-engineer']

export function FlowRoadmapPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState(
    ROADMAP_OPTIONS.find(r => r.id === 'frontend') || ROADMAP_OPTIONS[0]
  )

  return (
    <div className="min-h-screen pt-8 pb-20" style={{ backgroundColor: '#0f172a' }}>
      <div className="container mx-auto px-4 max-w-full">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Interactive Learning Paths</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Explore {ROADMAP_OPTIONS.length} industry-standard roadmaps merged from the Developer Roadmap project.
          </p>
          
          <div className="mt-8 flex flex-col items-center justify-center gap-5">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {ROADMAP_OPTIONS.filter(opt => FEATURED.includes(opt.id)).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedRoadmap(opt)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    selectedRoadmap.id === opt.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {opt.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="roadmap-select" className="text-sm font-medium text-slate-400">
                Or browse all paths:
              </label>
              <select
                id="roadmap-select"
                value={selectedRoadmap.id}
                onChange={(e) => {
                  const found = ROADMAP_OPTIONS.find(opt => opt.id === e.target.value)
                  if (found) setSelectedRoadmap(found)
                }}
                className="bg-slate-800 border border-slate-700 text-white text-sm font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 min-w-[200px]"
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

        {/* Roadmap Flow Renderer */}
        <div className="px-4">
          <RoadmapFlow roadmapPath={selectedRoadmap.path} />
        </div>
        
      </div>
    </div>
  )
}
