import type { ReactNode } from 'react'
import { useId } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cn } from '@/lib/utils'

const countConfig = {
  count: { label: 'Events', color: 'hsl(221.2 83.2% 53.3%)' },
} satisfies ChartConfig

const volumeConfig = {
  count: { label: 'Jobs', color: 'hsl(217 91% 52%)' },
} satisfies ChartConfig

function ChartCard({
  title,
  subtitle,
  children,
  className,
  compact,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <Card
      className={cn(
        'flex flex-col border border-slate-200/80 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_-4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.03] dark:border-border dark:bg-card dark:ring-white/[0.04]',
        compact ? 'gap-1.5 rounded-lg p-2.5' : 'admin-bento-tile gap-2 rounded-2xl p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className={cn(
              'font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground',
              compact ? 'text-[10px] leading-none tracking-[0.12em]' : 'text-xs tracking-[0.08em]',
            )}
          >
            {title}
          </p>
          {subtitle ? (
            <p
              className={cn(
                'text-slate-500 dark:text-muted-foreground',
                compact ? 'mt-0.5 text-[10px] leading-snug' : 'mt-0.5 text-xs',
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </Card>
  )
}

export function AdminActivityLineChart({
  data,
  className,
  compact = false,
}: {
  data: { day: string; label: string; count: number }[]
  className?: string
  compact?: boolean
}) {
  return (
    <ChartCard title="Admin actions" subtitle={compact ? 'Last 30 days' : 'Last 30 days (activity log)'} className={className} compact={compact}>
      <ChartContainer config={countConfig} className={cn('aspect-auto w-full', compact ? 'h-[112px]' : 'h-[200px]')}>
        <LineChart data={data} margin={compact ? { left: -8, right: 4, top: 6, bottom: 0 } : { left: 4, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200/80 dark:stroke-border" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={{ fontSize: compact ? 9 : 11, fill: 'currentColor' }}
            className="text-slate-400 dark:text-muted-foreground"
            interval="preserveStartEnd"
          />
          <ChartTooltip content={<ChartTooltipContent hideIndicator className="border-slate-200 dark:border-border" />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            strokeWidth={compact ? 2 : 2}
            dot={false}
            strokeLinecap="round"
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  )
}

export function AdminUserActivityAreaChart({
  data,
  className,
  compact = false,
}: {
  data: { day: string; label: string; count: number }[]
  className?: string
  compact?: boolean
}) {
  const gid = useId().replace(/:/g, '')
  const gradId = `adminUserFill-${gid}`

  return (
    <ChartCard title="API traffic" subtitle={compact ? 'Requests / day' : 'User requests by day'} className={className} compact={compact}>
      <ChartContainer config={countConfig} className={cn('aspect-auto w-full', compact ? 'h-[112px]' : 'h-[200px]')}>
        <AreaChart data={data} margin={compact ? { left: -8, right: 4, top: 6, bottom: 0 } : { left: 4, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.32} />
              <stop offset="98%" stopColor="var(--color-count)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200/80 dark:stroke-border" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={{ fontSize: compact ? 9 : 11, fill: 'currentColor' }}
            className="text-slate-400 dark:text-muted-foreground"
            interval="preserveStartEnd"
          />
          <ChartTooltip content={<ChartTooltipContent hideIndicator className="border-slate-200 dark:border-border" />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            fill={`url(#${gradId})`}
            strokeWidth={compact ? 2 : 2}
            strokeLinecap="round"
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  )
}

export function AdminJobsVolumeBarChart({
  data,
  className,
  compact = false,
}: {
  data: { week: string; label: string; count: number }[]
  className?: string
  compact?: boolean
}) {
  const tickInterval = compact && data.length > 8 ? 1 : 0

  return (
    <ChartCard title="Job posts" subtitle={compact ? 'New posts by week' : 'By week (created date)'} className={className} compact={compact}>
      <ChartContainer config={volumeConfig} className={cn('aspect-auto w-full', compact ? 'h-[112px]' : 'h-[200px]')}>
        <BarChart data={data} margin={compact ? { left: -8, right: 4, top: 6, bottom: 2 } : { left: 4, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200/80 dark:stroke-border" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={{ fontSize: compact ? 9 : 11, fill: 'currentColor' }}
            className="text-slate-400 dark:text-muted-foreground"
            interval={tickInterval}
          />
          <ChartTooltip content={<ChartTooltipContent hideIndicator className="border-slate-200 dark:border-border" />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={compact ? 28 : 48} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
