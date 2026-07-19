/** Cinematic login tokens — dark hero palette (do not use .landing-cinematic page bg). */

export const LOGIN_PAGE_BG =
  'login-cinematic relative isolate min-h-dvh w-full overflow-x-clip overflow-y-auto lg:h-dvh lg:max-h-dvh lg:overflow-hidden'

export const LOGIN_GLASS_CARD =
  'w-full rounded-[1.4rem] border border-white/[0.1] bg-[#111936]/90 p-6 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-7'

export const LOGIN_INPUT =
  'w-full rounded-xl border border-white/12 bg-[#0b1020]/75 px-4 py-2.5 text-base text-[#f7f8f4] placeholder:text-[#b8c0d4]/55 transition-colors focus-visible:border-[#1944f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1944f1]/40 focus-visible:ring-offset-0'

export const LOGIN_INPUT_SECONDARY = ''

export const LOGIN_PRIMARY_BTN =
  'w-full rounded-full bg-[#1944f1] py-3 text-base font-semibold text-white shadow-[0_12px_32px_rgba(25,68,241,0.28)] transition-colors hover:bg-[#1438c9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1944f1]/50 disabled:cursor-not-allowed disabled:opacity-60'

export const LOGIN_SECONDARY_BTN =
  'w-full rounded-full border border-white/25 bg-white/[0.04] py-3 text-base font-semibold text-[#f7f8f4] transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-60'

export const LOGIN_LABEL_SECONDARY = 'text-xs font-semibold uppercase tracking-[0.08em] text-[#b8c0d4]'

export const LOGIN_MUTED =
  'text-sm text-[#b8c0d4] underline-offset-2 hover:text-[#f7f8f4] hover:underline'

export const LOGIN_FORGOT =
  'text-xs font-medium text-[#b8c0d4] underline-offset-2 transition-colors hover:text-[#f7f8f4] hover:underline'

export const LOGIN_GOOGLE_FRAME = 'rounded-2xl border border-white/10 bg-[#0b1020]/50 p-3'

export const LOGIN_GOOGLE_BUTTON_WELL =
  'flex w-full justify-center rounded-xl border border-white/10 bg-[#f7f8f4] px-3 py-2.5 shadow-sm'

export const LOGIN_HEADLINE_LINES = ['Build Skills.', 'Prove Progress.', 'Get Hired.'] as const

export const LOGIN_FEATURE_CHIPS = [
  { id: 'sql', label: 'SQL Arena', icon: 'database' },
  { id: 'python', label: 'Python Lab', icon: 'code' },
  { id: 'resume', label: 'Resume Quest', icon: 'file-text' },
  { id: 'jobs', label: 'Jobs Radar', icon: 'radar' },
] as const
