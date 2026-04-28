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

// Converts any YouTube video ID to the embeddable URL format.
// watch?v= links are rejected by iframe; only youtube.com/embed/{id} works.
function embedUrl(id: string) {
  return `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0`
}

export function SkillVideoPlayer({ videoId, title, desc, level, channel, accentColor }: Props) {
  const [playing, setPlaying] = useState(false)
  const [imgError, setImgError] = useState(false)

  const thumbnailUrl = imgError
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Video area */}
      <div
        className="relative w-full aspect-video bg-slate-900 cursor-pointer group"
        onClick={() => !playing && setPlaying(true)}
      >
        {playing ? (
          // Uses youtube.com/embed/ — the only format that works in iframes.
          // watch?v= links return "refused to connect" inside an iframe.
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl(videoId)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
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

