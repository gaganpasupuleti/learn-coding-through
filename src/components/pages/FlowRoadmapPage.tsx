import { useState } from 'react'
import { RoadmapFlow } from '@/components/roadmap/RoadmapFlow'
import { ROADMAP_OPTIONS } from '@/lib/roadmap-options'

const FEATURED = ['frontend', 'backend', 'devops', 'python', 'ai-engineer']

export function FlowRoadmapPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState(
    ROADMAP_OPTIONS.find(r => r.id === 'frontend') || ROADMAP_OPTIONS[0]
  )

  return (
    <div className="min-h-screen py-8 bg-background relative">
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-full relative z-10">
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
                onChange={(e) => {
                  const found = ROADMAP_OPTIONS.find(opt => opt.id === e.target.value)
                  if (found) setSelectedRoadmap(found)
                }}
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

        {/* Roadmap Flow Renderer */}
        <div className="px-2">
          <RoadmapFlow roadmapPath={selectedRoadmap.path} />
        </div>
        
      </div>
    </div>
  )
}

