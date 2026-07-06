/** CodeQuest login auth-portal tokens — mission-control theme (phase 28a). */

export const LOGIN_PAGE_BG = 'relative min-h-screen overflow-x-hidden bg-[#050807] text-[#FAF3E0]'

export const LOGIN_GLASS_CARD =
  'w-full rounded-2xl border border-[#22FF88]/18 bg-[#0A1020]/82 p-7 shadow-[0_0_50px_-28px_rgba(34,255,136,0.35)] backdrop-blur-xl sm:p-8'

export const LOGIN_INPUT =
  'w-full rounded-lg border border-[#22FF88]/14 bg-[#050807]/55 px-4 py-2.5 text-sm text-[#FAF3E0] placeholder:text-[#FAF3E0]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors focus-visible:border-[#3B82F6]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/25 focus-visible:ring-offset-0'

export const LOGIN_INPUT_SECONDARY =
  'border-[#22FF88]/10 bg-[#050807]/40 text-[#FAF3E0]/90'

export const LOGIN_PRIMARY_BTN =
  'w-full rounded-lg bg-[#3B82F6] py-3 text-sm font-semibold text-white shadow-[0_0_24px_-10px_rgba(59,130,246,0.85)] transition-colors hover:bg-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807] disabled:cursor-not-allowed disabled:opacity-60'

export const LOGIN_SECONDARY_BTN =
  'w-full rounded-lg border border-[#22FF88]/25 bg-[#22FF88]/8 py-3 text-sm font-semibold text-[#22FF88] transition-colors hover:border-[#22FF88]/40 hover:bg-[#22FF88]/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22FF88]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807] disabled:cursor-not-allowed disabled:opacity-60'

export const LOGIN_LABEL_SECONDARY = 'text-xs font-medium text-[#FAF3E0]/50'

export const LOGIN_MUTED = 'text-sm text-[#FAF3E0]/55 underline-offset-2 hover:text-[#FAF3E0]/80 hover:underline'

export const LOGIN_FORGOT = 'text-xs font-normal text-[#FAF3E0]/40 underline-offset-2 transition-colors hover:text-[#FAF3E0]/65 hover:underline'

export const LOGIN_GOOGLE_FRAME =
  'rounded-xl border border-[#22FF88]/18 bg-[#0A1020]/70 p-3 shadow-[inset_0_0_28px_-14px_rgba(34,255,136,0.25)]'

export const LOGIN_GOOGLE_BUTTON_WELL =
  'flex w-full justify-center rounded-lg border border-[#22FF88]/10 bg-[#FAF3E0]/95 px-3 py-2.5 shadow-sm'

export const LOGIN_TAGLINE_WORDS = ['Learn.', 'Build.', 'Quest.'] as const

export const LOGIN_BOOT_LINES = [
  '> Initializing CodeQuest…',
  '> Loading student workspace…',
  '> Auth portal ready.',
] as const

export const LOGIN_FEATURE_CHIPS = [
  { id: 'sql', label: 'SQL Arena', icon: 'database' },
  { id: 'python', label: 'Python Lab', icon: 'code' },
  { id: 'resume', label: 'Resume Quest', icon: 'file-text' },
  { id: 'jobs', label: 'Jobs Radar', icon: 'radar' },
] as const

/** ponytail: static marketing highlights — not live API metrics. */
export const LOGIN_PLATFORM_STATS = [
  { id: 'jobs', label: 'Live Jobs', value: 1248, suffix: '+' },
  { id: 'modules', label: 'Learning Modules', value: 320, suffix: '+' },
  { id: 'questions', label: 'Practice Questions', value: 5000, suffix: '+' },
  { id: 'projects', label: 'Student Projects', value: 180, suffix: '+' },
] as const

export function formatLoginStat(value: number, suffix: string) {
  return `${value.toLocaleString()}${suffix}`
}
