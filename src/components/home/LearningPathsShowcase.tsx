import { useState } from 'react'
import { LEARNING_PATHS } from '@/lib/video-paths'
import { SkillVideoPlayer } from '@/components/common/SkillVideoPlayer'

const TAB_LABELS: Record<string, string> = {
  python: 'Python',
  web: 'Web Dev',
}

export function LearningPathsShowcase() {
  const [activeTab, setActiveTab] = useState<string>('python')
  const tabs = Object.keys(LEARNING_PATHS)
  const videos = LEARNING_PATHS[activeTab] ?? []

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Curated Learning Paths
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Pick a track and start watching — curated beginner-to-job-ready tutorials.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-150 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {TAB_LABELS[tab] ?? tab}
            </button>
          ))}
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <SkillVideoPlayer videoId={video.id} />
              <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-900">{video.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{video.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
