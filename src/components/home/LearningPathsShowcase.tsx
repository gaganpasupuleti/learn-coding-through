import { useState } from 'react'
import { LEARNING_PATHS } from '@/lib/video-paths'
import { SkillVideoPlayer } from '@/components/common/SkillVideoPlayer'

export function LearningPathsShowcase() {
  const keys = Object.keys(LEARNING_PATHS)
  const [activeTab, setActiveTab] = useState<string>(keys[0])
  const path = LEARNING_PATHS[activeTab]

  return (
    <section className="py-20 md:py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12 md:mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
            Curated Learning Paths
          </h2>
          <p className="text-slate-600 text-base max-w-2xl leading-relaxed">
            Hand-picked tutorials for every career track on the platform — beginner to job-ready.
          </p>
        </div>

        {/* Tab strip */}
        <div className="flex flex-wrap gap-2 mb-8">
          {keys.map((key) => {
            const p = LEARNING_PATHS[key]
            const isActive = key === activeTab
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? `${p.color} text-white shadow-sm`
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{p.emoji}</span>
                {p.label}
              </button>
            )
          })}
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {path.videos.map((video) => (
            <SkillVideoPlayer
              key={video.id}
              videoId={video.id}
              title={video.title}
              desc={video.desc}
              level={video.level}
              channel={video.channel}
              accentColor={path.color}
            />
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-slate-400 text-center">
          Videos sourced from YouTube · Click any thumbnail to start watching
        </p>
      </div>
    </section>
  )
}
