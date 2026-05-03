import { useState } from 'react'
import { RoadmapFlow } from '@/components/roadmap/RoadmapFlow'
import { ROADMAP_OPTIONS } from '@/lib/roadmap-options'

const FEATURED = ['frontend', 'backend', 'devops', 'python', 'ai-engineer']

export function FlowRoadmapPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState(
    ROADMAP_OPTIONS.find(r => r.id === 'frontend') || ROADMAP_OPTIONS[0]
  )

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 max-w-full">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Interactive Learning Paths</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore {ROADMAP_OPTIONS.length} industry-standard roadmaps merged from the Developer Roadmap project.
          </p>
          
          <div className="mt-8 flex flex-col items-center justify-center gap-6">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {ROADMAP_OPTIONS.filter(opt => FEATURED.includes(opt.id)).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedRoadmap(opt)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border-2 ${
                    selectedRoadmap.id === opt.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 shadow-sm'
                  }`}
                >
                  {opt.title}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
              <label htmlFor="roadmap-select" className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Full Roadmap Catalog:
              </label>
              <select
                id="roadmap-select"
                value={selectedRoadmap.id}
                onChange={(e) => {
                  const found = ROADMAP_OPTIONS.find(opt => opt.id === e.target.value)
                  if (found) setSelectedRoadmap(found)
                }}
                className="bg-white border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-2.5 min-w-[280px] shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
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
        <div className="px-2">
          <RoadmapFlow roadmapPath={selectedRoadmap.path} />
        </div>
        
      </div>
    </div>
  )
}
