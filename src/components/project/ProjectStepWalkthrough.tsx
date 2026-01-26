import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'

interface ProjectStepWalkthroughProps {
  gifUrl?: string
  caption?: string
}

export function ProjectStepWalkthrough({ gifUrl, caption }: ProjectStepWalkthroughProps) {
  const [loadError, setLoadError] = useState(false)

  const safeGifUrl = useMemo(() => {
    if (!gifUrl) return null
    try {
      const parsed = new URL(gifUrl)
      const allowedHosts = new Set(['media.giphy.com', 'i.giphy.com', 'giphy.com'])
      return allowedHosts.has(parsed.hostname) ? gifUrl : null
    } catch {
      return null
    }
  }, [gifUrl])

  if (!safeGifUrl || loadError) return null

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
            👀
          </span>
          <span>Walkthrough</span>
        </div>
        <div className="rounded-lg overflow-hidden border border-primary/20 bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={safeGifUrl}
            alt={caption || 'Step walkthrough'}
            className="w-full h-auto object-cover"
            loading="lazy"
            onError={() => setLoadError(true)}
          />
        </div>
        {caption && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {caption}
          </p>
        )}
      </div>
    </Card>
  )
}
