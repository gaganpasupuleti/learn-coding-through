import { memo } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface FlowNodeDetailPanelProps {
  label: string
  nodeType: string | undefined
  onClose: () => void
}

export const FlowNodeDetailPanel = memo(function FlowNodeDetailPanel({
  label,
  nodeType,
  onClose,
}: FlowNodeDetailPanelProps) {
  return (
    <aside
      className="absolute bottom-4 right-4 z-20 w-[min(100%,280px)] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm"
      aria-label="Selected node details"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {nodeType ?? 'node'}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 break-words">{label || 'Untitled node'}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose} aria-label="Close node details">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
})
