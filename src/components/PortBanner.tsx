import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export function PortBanner() {
  const shouldShowBanner = import.meta.env.DEV || import.meta.env.VITE_SHOW_PORT_BANNER === 'true'
  const [visible, setVisible] = useState(true)

  if (!shouldShowBanner) return null
  
  if (!visible) return null

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-sm border-b border-blue-400/50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white text-sm">
          <span className="font-semibold">Dev Server:</span>
          <code className="bg-black/20 px-2 py-1 rounded text-xs font-mono">{currentUrl}</code>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setVisible(false)}
          className="text-white hover:bg-white/20 h-6 w-6 p-0"
        >
          <X size={16} weight="bold" />
        </Button>
      </div>
    </div>
  )
}
