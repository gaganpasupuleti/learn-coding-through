/**
 * Shared dark workbench palette — readability/contrast polish (Issue #29).
 * Used by Code Workbench and SQL Practice Ground only.
 */

export const wb = {
  root: 'practice-workbench bg-[#0B1020] text-[#E5E7EB]',
  panel: 'bg-[#0F172A]',
  panelHeader: 'border-[#26324A] bg-[#0F172A]',
  editor: 'bg-[#1E1E1E]',
  border: 'border-[#26324A]',
  textPrimary: 'text-[#E5E7EB]',
  textSecondary: 'text-[#CBD5E1]',
  textMuted: 'text-[#94A3B8]',
  sectionLabel:
    'mb-2.5 text-xs font-bold uppercase tracking-widest text-[#94A3B8]',
  card: 'rounded-lg border border-[#26324A] bg-[#111827] p-4',
  cardMono: 'rounded-lg border border-[#26324A] bg-[#111827] p-4 font-mono text-sm leading-relaxed text-[#CBD5E1]',
  tabActive:
    'border-b-2 border-sky-400 bg-sky-950/25 text-sky-100',
  tabInactive:
    'text-[#94A3B8] hover:bg-[#0F172A] hover:text-[#CBD5E1]',
  langActive:
    'bg-sky-500 text-white shadow-md ring-1 ring-sky-400/60',
  langInactive:
    'border border-[#26324A] bg-[#111827] text-[#CBD5E1] hover:border-sky-500/50 hover:bg-[#1a2332] hover:text-[#E5E7EB]',
  langSoon:
    'border border-dashed border-[#26324A] text-[#94A3B8] opacity-75 cursor-not-allowed hover:bg-transparent',
  toolbarBtn:
    'inline-flex items-center gap-2 rounded-md border border-[#26324A] bg-[#111827] px-3.5 py-2.5 text-sm text-[#CBD5E1] transition-colors hover:border-[#3d4f6f] hover:bg-[#1a2332] hover:text-[#E5E7EB]',
  questionActive:
    'bg-violet-600 text-white shadow ring-1 ring-violet-400/50',
  questionInactive:
    'border border-[#26324A] bg-[#111827] text-[#CBD5E1] hover:border-violet-500/50 hover:bg-[#1a2332] hover:text-[#E5E7EB]',
} as const
