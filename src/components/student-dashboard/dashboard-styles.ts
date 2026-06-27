// Code Quest student dashboard visual system.
// Palette: deep navy command surfaces, cream/slate canvas, blue primary,
// with teal / amber / violet / emerald accents for stat groups.

export const STUDENT_PAGE_BG =
  'min-h-full bg-slate-50 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(37,99,235,0.06),transparent_45%),radial-gradient(120%_120%_at_100%_0%,rgba(13,148,136,0.05),transparent_40%)]'

export const DASHBOARD_CARD =
  'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-18px_rgba(15,23,42,0.25)]'

export const DASHBOARD_CARD_PRIMARY =
  'rounded-2xl border border-blue-200 bg-white shadow-[0_1px_2px_rgba(37,99,235,0.10),0_12px_32px_-16px_rgba(37,99,235,0.35)] ring-1 ring-blue-100/80'

export const DASHBOARD_CARD_BODY = 'p-6'

export const DASHBOARD_CARD_BODY_COMPACT = 'p-4'

export const DASHBOARD_SECTION_LABEL =
  'text-xs font-semibold uppercase tracking-wider text-slate-500'

// Hero command surface: deep navy with a subtle blue/teal wash.
export const DASHBOARD_HERO =
  'relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.6)]'

// Accent tokens for stat tiles and chips.
export const STAT_ACCENTS = {
  blue: { chip: 'bg-blue-100 text-blue-700', ring: 'ring-blue-100' },
  amber: { chip: 'bg-amber-100 text-amber-700', ring: 'ring-amber-100' },
  teal: { chip: 'bg-teal-100 text-teal-700', ring: 'ring-teal-100' },
  violet: { chip: 'bg-violet-100 text-violet-700', ring: 'ring-violet-100' },
  emerald: { chip: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-100' },
} as const

export type StatAccent = keyof typeof STAT_ACCENTS
