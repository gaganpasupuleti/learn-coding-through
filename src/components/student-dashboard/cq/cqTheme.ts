/**
 * Code Quest dashboard design tokens.
 *
 * Adapted (not imported) from the `codequest-frontend-kit` sample
 * (branch: codequest-dashboard-sample). The kit defines these as Tailwind
 * theme colors; here they are expressed as scoped arbitrary-value classes so
 * the dashboard gets the sample look WITHOUT changing the global Tailwind
 * config or the shared `dashboard-styles.ts` tokens used by frozen pages
 * (Progress, Calendar, Resume).
 *
 * Palette contract (matches kit tailwind.config.js):
 *   cream #FAF3E0 / cream-soft #FFF9EA · navy #0A1020 / navy-elevated #121A2E
 *   charcoal #111827 · slate #708090 · cta #2563EB / hover #1D4ED8
 *   progress(teal) #14B8A6 · gold #FBBF24
 *   card: yellow #F3DFA0 · pink #F5D0DE · sage #C2CDB0 · blue #B8C9E8 · lavender #DDD0F5
 */

export type CQTone = 'yellow' | 'pink' | 'sage' | 'blue' | 'lavender' | 'cream'

export const CQ_TONE_BG: Record<CQTone, string> = {
  yellow: 'bg-[#F3DFA0]',
  pink: 'bg-[#F5D0DE]',
  sage: 'bg-[#C2CDB0]',
  blue: 'bg-[#B8C9E8]',
  lavender: 'bg-[#DDD0F5]',
  cream: 'bg-[#FFF9EA]',
}

/** Soft tints used for inset chips / timeline pills inside cards. */
export const CQ_TONE_SOFT: Record<CQTone, string> = {
  yellow: 'bg-[#F3DFA0]/45',
  pink: 'bg-[#F5D0DE]/50',
  sage: 'bg-[#C2CDB0]/50',
  blue: 'bg-[#B8C9E8]/45',
  lavender: 'bg-[#DDD0F5]/50',
  cream: 'bg-[#FFF9EA]',
}

/** Page background — cream canvas. Scoped to the dashboard page wrapper only. */
export const CQ_PAGE_BG = 'min-h-full bg-[#FAF3E0] text-[#111827]'

/** Base card surface (content cards) — cream-soft on slate hairline border. */
export const CQ_CARD =
  'rounded-[18px] border border-[#708090]/20 bg-[#FFF9EA] shadow-[0_12px_32px_-22px_rgba(10,16,32,0.55)] transition-shadow'

export const CQ_CARD_HOVER =
  'hover:shadow-[0_18px_44px_-22px_rgba(10,16,32,0.6)]'

export const CQ_CARD_BODY = 'p-4 md:p-[18px]'

/** Section heading — editorial serif, charcoal. */
export const CQ_SECTION_TITLE =
  'font-serif text-[17px] font-semibold tracking-tight text-[#111827]'

export const CQ_SECTION_SUB = 'mt-0.5 text-[13px] text-[#708090]'

/** Inline link styling (cta blue). */
export const CQ_LINK =
  'text-[13px] font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]'

/** Border + muted helpers. */
export const CQ_HAIRLINE = 'border-[#708090]/20'
export const CQ_MUTED = 'text-[#708090]'
export const CQ_INK = 'text-[#111827]'

/** Focus ring consistent with cta accent. */
export const CQ_FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/45 focus-visible:ring-offset-1 focus-visible:ring-offset-[#FFF9EA]'
