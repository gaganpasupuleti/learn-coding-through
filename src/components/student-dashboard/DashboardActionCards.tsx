import { ArrowRight, Code2, Database, FileText, Keyboard } from 'lucide-react'

import { cn } from '@/lib/utils'

import { CQ_FOCUS, CQ_TONE_BG, type CQTone } from './cq/cqTheme'

interface ActionCard {
  key: string
  title: string
  hint: string
  tone: CQTone
  icon: React.ReactNode
  onClick: () => void
}

interface DashboardActionCardsProps {
  onPracticeCode: () => void
  onPracticeSql: () => void
  onPracticeTyping: () => void
  onOpenResume: () => void
}

export function DashboardActionCards({
  onPracticeCode,
  onPracticeSql,
  onPracticeTyping,
  onOpenResume,
}: DashboardActionCardsProps) {
  const cards: ActionCard[] = [
    {
      key: 'code',
      title: 'Continue Code',
      hint: 'Code Workbench',
      tone: 'yellow',
      icon: <Code2 className="h-5 w-5" strokeWidth={1.75} />,
      onClick: onPracticeCode,
    },
    {
      key: 'sql',
      title: 'Open SQL Studio',
      hint: 'SQL Practice',
      tone: 'blue',
      icon: <Database className="h-5 w-5" strokeWidth={1.75} />,
      onClick: onPracticeSql,
    },
    {
      key: 'typing',
      title: 'Typing Practice',
      hint: 'Build speed',
      tone: 'sage',
      icon: <Keyboard className="h-5 w-5" strokeWidth={1.75} />,
      onClick: onPracticeTyping,
    },
    {
      key: 'resume',
      title: 'Improve Resume',
      hint: 'Resume Lab',
      tone: 'lavender',
      icon: <FileText className="h-5 w-5" strokeWidth={1.75} />,
      onClick: onOpenResume,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={card.onClick}
          className={cn(
            'group flex flex-col gap-3 rounded-[18px] border border-[#708090]/20 p-4 text-left transition-shadow hover:shadow-[0_18px_44px_-22px_rgba(10,16,32,0.6)]',
            CQ_TONE_BG[card.tone],
            CQ_FOCUS,
          )}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0A1020]/8 text-[#0A1020]">
            {card.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#111827]">{card.title}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB]">
              {card.hint}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
