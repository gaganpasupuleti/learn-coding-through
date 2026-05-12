/** Shared tokens for the executive dashboard “report page” look. */
export const reportCanvasClass =
  'rounded-md border border-slate-300/50 bg-gradient-to-b from-[#eef1f5] to-[#e4e8ee] p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] dark:border-border dark:from-muted/40 dark:to-muted/20 dark:shadow-none'

export const vizTileClass =
  'rounded-lg border border-slate-200/80 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.03] transition-shadow duration-200 dark:border-border dark:bg-card dark:ring-white/[0.04]'

export const vizTileInteractiveClass =
  `${vizTileClass} hover:border-slate-300 hover:shadow-[0_2px_8px_-2px_rgba(15,23,42,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-1 dark:hover:border-border`

/** Root wrapper for non-dashboard admin sections (Power View canvas). */
export const adminSectionRootClass = `${reportCanvasClass} flex min-h-0 flex-1 flex-col gap-2 overflow-hidden`

/** Slim header strip above panes (title, counts, actions). */
export const adminToolbarClass = `${vizTileClass} flex shrink-0 flex-wrap items-center justify-between gap-2 px-2.5 py-2`

/** Card pane: column with optional header + scroll body. */
export const adminPaneCardClass = `${vizTileClass} flex min-h-0 min-w-0 flex-col overflow-hidden`

export const adminPaneHeaderClass =
  'shrink-0 border-b border-slate-200/80 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:border-border dark:text-muted-foreground'

/** Scrollable body inside a pane (flex child). */
export const adminPaneScrollBodyClass = 'min-h-0 flex-1 overflow-auto p-2'
