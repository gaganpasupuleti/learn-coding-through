import { useState } from 'react'
import YouTube from 'react-youtube'

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
}

type Props = {
  videoId: string
  title: string
  desc: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  channel: string
  accentColor: string
}

export function SkillVideoPlayer({ videoId, title, desc, level, channel, accentColor }: Props) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Video area */}
      <div className="relative w-full aspect-video bg-slate-900 cursor-pointer group" onClick={() => setPlaying(true)}>
        {playing ? (
          <YouTube
            videoId={videoId}
            opts={{
              height: '100%',
              width: '100%',
              playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
            }}
            className="absolute inset-0 w-full h-full"
            iframeClassName="w-full h-full"
          />
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay + play button */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className={`w-14 h-14 rounded-full ${accentColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-150`}>
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Meta */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">{title}</h3>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[level]}`}>
            {level}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed flex-1">{desc}</p>
        <p className="text-[11px] text-slate-400 font-medium">{channel}</p>
      </div>
    </div>
  )
}
