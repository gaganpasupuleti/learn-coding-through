import { useState } from 'react'
import { RoadmapCanvas } from '@/components/roadmap/RoadmapCanvas'
import { careerSeedData } from '@/lib/career-seed-data'

export function FlowRoadmapPage() {
  const [selectedRole, setSelectedRole] = useState(careerSeedData[0])

  return (
    <div className="min-h-screen pt-8 pb-20" style={{ backgroundColor: '#0f172a' }}>
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Learning Path</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Follow the winding path to master the skills you need. Complete each node to unlock the next segment of your journey.
          </p>
          
          <div className="mt-8 flex items-center justify-center gap-4">
            {careerSeedData.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  selectedRole.id === role.id 
                    ? 'bg-[#22c55e] text-white' 
                    : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700'
                }`}
              >
                {role.title}
              </button>
            ))}
          </div>
        </header>

        {/* Roadmap Canvas */}
        <RoadmapCanvas roleId={selectedRole.sortOrder} />
        
      </div>
    </div>
  )
}
