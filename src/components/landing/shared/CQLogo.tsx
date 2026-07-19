import { cn } from '@/lib/utils'

type CQLogoProps = {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  animated?: boolean
}

const sizeMap = {
  xs: 'h-8 w-8 text-sm rounded-lg',
  sm: 'h-10 w-10 text-lg rounded-2xl',
  md: 'h-14 w-14 text-xl rounded-2xl',
  lg: 'h-20 w-20 text-3xl rounded-2xl',
}

export function CQLogo({ className, size = 'md', animated = false }: CQLogoProps) {
  return (
    <div
      className={cn(
        'cq-logo relative inline-flex items-center justify-center font-black tracking-tighter',
        'bg-[#1944F1] text-[#FFEF4D] shadow-[0_0_40px_rgba(25,68,241,0.35)]',
        sizeMap[size],
        animated && 'cq-logo--animated',
        className,
      )}
      aria-hidden
    >
      <span className="relative z-10 whitespace-nowrap">CQ</span>
      <span className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/20 to-transparent" />
    </div>
  )
}
