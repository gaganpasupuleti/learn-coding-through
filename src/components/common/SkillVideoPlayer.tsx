import YouTube from 'react-youtube'

const opts = {
  height: '315',
  width: '100%',
  playerVars: {
    autoplay: 0,
    modestbranding: 1,
    rel: 0,
  },
}

export function SkillVideoPlayer({ videoId }: { videoId: string }) {
  return (
    <div>
      <YouTube
        videoId={videoId}
        opts={opts}
        className="w-full rounded-lg overflow-hidden shadow-md"
      />
    </div>
  )
}
