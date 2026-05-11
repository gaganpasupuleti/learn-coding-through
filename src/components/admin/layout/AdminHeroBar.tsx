import { CalendarBlank, DownloadSimple, Headset, Lightning, MagnifyingGlass, Sliders } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AuthUser } from '@/lib/auth'

import { sectionMeta } from '../sectionMeta'
import type { AdminSection } from '../types'
import { getAdminGreeting } from '../utils/getAdminGreeting'

export interface AdminHeroBarProps {
  user: AuthUser
  section: AdminSection
  /** Dense “report toolbar” layout (Power BI–style single screen). */
  compact?: boolean
  isLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  onRefresh: () => void | Promise<void>
  onOpenCommand: () => void
}

export function AdminHeroBar({
  user,
  section,
  compact = false,
  isLoading,
  search,
  onSearchChange,
  onRefresh,
  onOpenCommand,
}: AdminHeroBarProps) {
  const meta = sectionMeta[section]

  if (compact) {
    return (
      <header className="sticky top-0 z-40 shrink-0 border-b border-slate-200/90 bg-white/90 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-md dark:border-border dark:bg-background/95 dark:shadow-none">
        <div className="mx-auto flex w-full max-w-[1680px] flex-wrap items-center gap-2.5 px-3 py-2.5 md:px-4">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="whitespace-nowrap text-muted-foreground">{getAdminGreeting()},</span>
            <span className="truncate font-semibold text-slate-900 dark:text-foreground">{user.full_name}</span>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <span className="hidden items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 sm:inline-flex dark:border-border dark:bg-muted/40 dark:text-foreground">
              <span className="text-primary [&_svg]:size-3.5">{meta.icon}</span>
              <span className="max-w-[10rem] truncate">{meta.title}</span>
            </span>
          </div>

          <div className="relative min-w-[10rem] flex-1 basis-[12rem] max-w-md">
            <MagnifyingGlass
              size={16}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void onRefresh()
              }}
              placeholder="Search students…"
              className="h-8 rounded-lg border-slate-200/90 bg-slate-50/90 pl-8 text-xs shadow-inner transition-colors placeholder:text-slate-400 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-border dark:bg-muted/30 dark:placeholder:text-muted-foreground"
              aria-label="Search students"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-lg px-3 text-xs font-semibold shadow-sm shadow-primary/15 transition-opacity disabled:opacity-60"
              onClick={() => void onRefresh()}
              disabled={isLoading}
            >
              <Lightning size={14} className="mr-1" weight="bold" />
              {isLoading ? '…' : 'Refresh'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-slate-200/90 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-border dark:text-foreground dark:hover:bg-muted/40"
              onClick={onOpenCommand}
            >
              ⌘K
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-transparent pt-4 pb-2 md:pt-5 md:pb-3 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-6">
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.02] md:p-8 dark:ring-white/[0.03]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{getAdminGreeting()},</p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {user.full_name}
                <span className="text-primary">!</span>
              </h1>
              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{meta.title}</span>
                <span className="text-border hidden sm:inline">·</span>
                <span className="inline-flex items-center gap-1.5 align-middle text-foreground">{meta.icon}</span>
              </p>
            </div>
            <Button
              type="button"
              className="h-11 shrink-0 rounded-full px-6 font-semibold shadow-md shadow-primary/25"
              onClick={() => void onRefresh()}
              disabled={isLoading}
            >
              <Lightning size={18} className="mr-1.5" weight="bold" />
              {isLoading ? 'Refreshing…' : '+ Refresh data'}
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-dashed border-border/80 bg-background/80"
              disabled
              title="Coming soon"
            >
              <Sliders size={16} className="mr-1.5" />
              Filter
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-border/80 bg-background/80"
              disabled
              title="Coming soon"
            >
              <CalendarBlank size={16} className="mr-1.5" />
              This month
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-border/80 bg-background/80"
              disabled
              title="Coming soon"
            >
              <DownloadSimple size={16} className="mr-1.5" />
              Download data
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-border/80 bg-background/80"
              disabled
              title="Coming soon"
            >
              <Headset size={16} className="mr-1.5" />
              Support
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto rounded-full border-border/80 bg-background/80"
              onClick={onOpenCommand}
            >
              ⌘K Commands
            </Button>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 min-w-0">
              <MagnifyingGlass
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void onRefresh()
                }}
                placeholder="Search students…"
                className="h-11 rounded-2xl border-border/60 bg-muted/30 pl-10 focus-visible:border-primary focus-visible:ring-primary/20"
                aria-label="Search students"
              />
            </div>
            <p className="text-xs text-muted-foreground sm:max-w-[11rem] sm:text-right">
              Press Enter to search. Use ⌘K for quick navigation.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
