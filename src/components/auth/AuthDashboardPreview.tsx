import type { AuthPreviewVariant } from './auth-promo-slides'
import { cn } from '@/lib/utils'

interface AuthDashboardPreviewProps {
  variant: AuthPreviewVariant
  className?: string
}

function PlannerMock() {
  return (
    <div className="flex h-full flex-col gap-1 p-1.5">
      <div className="h-3 rounded bg-blue-600/90" />
      <div className="grid flex-1 grid-cols-5 gap-1">
        <div className="col-span-2 rounded bg-slate-100 p-1">
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className={cn('aspect-square rounded-[1px]', i === 8 ? 'bg-blue-500' : 'bg-slate-200')} />
            ))}
          </div>
        </div>
        <div className="col-span-3 space-y-1 rounded bg-slate-50 p-1">
          <div className="h-1.5 w-2/3 rounded bg-slate-300" />
          <div className="h-1 w-full rounded bg-slate-200" />
          <div className="mt-1 flex gap-0.5">
            <div className="h-1 w-4 rounded bg-indigo-300" />
            <div className="h-1 w-4 rounded bg-amber-300" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="h-4 rounded bg-slate-100" />
        <div className="h-4 rounded bg-slate-100" />
      </div>
    </div>
  )
}

function JourneyMock() {
  return (
    <div className="flex h-full flex-col gap-1.5 p-1.5">
      <div className="h-3 rounded bg-gradient-to-r from-blue-600 to-indigo-600" />
      <div className="rounded bg-white p-1.5 shadow-sm">
        <div className="mb-1 flex justify-between">
          <div className="h-1.5 w-12 rounded bg-slate-300" />
          <div className="h-1.5 w-4 rounded bg-blue-200" />
        </div>
        <div className="h-1 w-full rounded-full bg-slate-100">
          <div className="h-full w-3/5 rounded-full bg-blue-500" />
        </div>
        <div className="mt-1.5 flex flex-wrap gap-0.5">
          {['SQL', 'Python', 'APIs', 'Git'].map((t) => (
            <span key={t} className="rounded-full bg-emerald-100 px-1 py-px text-[4px] text-emerald-700">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1 rounded bg-slate-50 p-1">
        <div className="space-y-0.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-1.5 rounded bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  )
}

function JobsMock() {
  return (
    <div className="flex h-full flex-col gap-1.5 p-1.5">
      <div className="h-3 rounded bg-slate-800" />
      <div className="flex justify-center py-1">
        <div className="relative h-10 w-10">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="55 100"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[5px] font-bold text-slate-700">
            72%
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between rounded bg-slate-50 px-1 py-0.5">
            <div className="space-y-px">
              <div className="h-1 w-10 rounded bg-slate-300" />
              <div className="h-0.5 w-6 rounded bg-slate-200" />
            </div>
            <div className="h-1.5 w-4 rounded bg-blue-500" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AuthDashboardPreview({ variant, className }: AuthDashboardPreviewProps) {
  return (
    <div className={cn('h-full w-full overflow-hidden bg-white', className)}>
      {variant === 'planner' && <PlannerMock />}
      {variant === 'journey' && <JourneyMock />}
      {variant === 'jobs' && <JobsMock />}
    </div>
  )
}

export function AuthLaptopFrame({ variant }: { variant: AuthPreviewVariant }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="rounded-t-xl bg-gradient-to-b from-slate-300 to-slate-400 p-2 pb-0 shadow-2xl">
        <div className="aspect-[16/10] overflow-hidden rounded-t-lg border-2 border-slate-500/30 bg-slate-900">
          <AuthDashboardPreview variant={variant} />
        </div>
      </div>
      <div className="mx-auto h-2 w-[85%] rounded-b-lg bg-gradient-to-b from-slate-400 to-slate-500" />
      <div className="mx-auto h-1 w-[60%] rounded-b-md bg-slate-600/80" />
    </div>
  )
}
