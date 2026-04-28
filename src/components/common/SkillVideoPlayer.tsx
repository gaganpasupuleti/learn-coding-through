import { useState } from 'react'

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
  const [imgError, setImgError] = useState(false)

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
  const thumbnailUrl = imgError
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Thumbnail — click opens YouTube in new tab */}
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-full aspect-video bg-slate-900 block group cursor-pointer"
        aria-label={`Watch ${title} on YouTube`}
      >
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        {/* Overlay + play button */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className={`w-14 h-14 rounded-full ${accentColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-150`}>
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* "Watch on YouTube" badge on hover */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.6 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.3.6 9.3.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
          </svg>
          Watch on YouTube
        </div>
      </a>

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

