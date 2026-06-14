import {
  BarChart3,
  BookOpenCheck,
  Boxes,
  ClipboardList,
  FileSearch,
  FunctionSquare,
  Layers,
  LayoutDashboard,
  Plug,
  Workflow,
} from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'
import type { PowerBiModuleDefinition } from '../types/powerbiPractice.types'
import { DAX_PRACTICE_ROUTE } from '../types/powerbiPractice.types'
import { PowerBiModuleCard } from './PowerBiModuleCard'

const ACTIVE_MODULES: PowerBiModuleDefinition[] = [
  {
    id: 'dax-practice',
    title: 'DAX Practice',
    description:
      'Write measure and calculated-column formulas against sample datasets. Rule-based checking — no real DAX engine required.',
    status: 'active',
    href: DAX_PRACTICE_ROUTE,
  },
]

const AVAILABLE_SOON_MODULES: PowerBiModuleDefinition[] = [
  {
    id: 'powerbi-quiz',
    title: 'Power BI Quiz',
    description:
      'Test your knowledge of DAX, data modeling, and visualization concepts with multiple-choice and scenario questions.',
    status: 'available-soon',
  },
]

const COMING_SOON_MODULES: PowerBiModuleDefinition[] = [
  {
    id: 'power-query',
    title: 'Power Query Practice',
    description: 'Practice M language transformations on fictional sample tables.',
    status: 'coming-soon',
  },
  {
    id: 'data-modeling',
    title: 'Data Modeling Practice',
    description: 'Star schema, relationships, and cardinality exercises with sample models.',
    status: 'coming-soon',
  },
  {
    id: 'dashboard-builder',
    title: 'Dashboard Builder Practice',
    description: 'Layout and KPI design exercises — not a Power BI Desktop clone.',
    status: 'coming-soon',
  },
  {
    id: 'case-studies',
    title: 'Case Studies',
    description: 'End-to-end BI scenarios from question to insight using sample data.',
    status: 'coming-soon',
  },
  {
    id: 'report-analysis',
    title: 'Report Analysis Lab',
    description: 'Review sample reports and identify improvements in visuals and storytelling.',
    status: 'coming-soon',
  },
  {
    id: 'report-lab',
    title: 'Power BI Embedded Report Lab',
    description: 'Interactive embedded reports — requires licensing and cost approval before launch.',
    status: 'coming-soon',
  },
]

const MODULE_ICONS: Record<PowerBiModuleDefinition['id'], React.ReactNode> = {
  'dax-practice': <FunctionSquare size={20} aria-hidden />,
  'powerbi-quiz': <ClipboardList size={20} aria-hidden />,
  'power-query': <Workflow size={20} aria-hidden />,
  'data-modeling': <Layers size={20} aria-hidden />,
  'dashboard-builder': <LayoutDashboard size={20} aria-hidden />,
  'case-studies': <BookOpenCheck size={20} aria-hidden />,
  'report-analysis': <FileSearch size={20} aria-hidden />,
  'report-lab': <Plug size={20} aria-hidden />,
}

export function PowerBiLandingPage({ onOpenDaxPractice }: { onOpenDaxPractice: () => void }) {
  return (
    <div className={cn('min-h-full', wb.root)}>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <header className="mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/30 px-3 py-1 text-xs font-semibold text-amber-200">
            <BarChart3 size={14} aria-hidden />
            Phase 24 — Frontend MVP
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F8FAFC] md:text-4xl">
            Power BI Practice Ground
          </h1>
          <p className={cn('max-w-3xl text-base leading-relaxed md:text-lg', wb.textSecondary)}>
            Practice Power BI concepts inside CodeQuest — DAX formulas, quizzes, and sample datasets — without
            Microsoft Power BI Embedded, paid APIs, or a Microsoft account.
          </p>
        </header>

        <section
          className={cn('mb-8 rounded-xl border p-5 md:p-6', wb.border, wb.card)}
          aria-label="MVP scope and safety notes"
        >
          <h2 className={cn(wb.sectionLabel)}>How this MVP works</h2>
          <ul className={cn('space-y-2 text-sm leading-relaxed', wb.textSecondary)}>
            <li className="flex gap-2">
              <Boxes size={16} className="mt-0.5 shrink-0 text-sky-400" aria-hidden />
              <span>
                <strong className="text-[#E5E7EB]">Not a Power BI Desktop clone.</strong> This is a lightweight
                practice space with frontend tasks and fictional sample datasets.
              </span>
            </li>
            <li className="flex gap-2">
              <FunctionSquare size={16} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden />
              <span>
                DAX answers are checked with <strong className="text-[#E5E7EB]">rules, not a real DAX engine</strong>{' '}
                — no Tabular model execution in the browser.
              </span>
            </li>
            <li className="flex gap-2">
              <Plug size={16} className="mt-0.5 shrink-0 text-violet-400" aria-hidden />
              <span>
                <strong className="text-[#E5E7EB]">Real Power BI Embedded</strong> (Report Lab) will come later only
                after licensing and cost approval. No embed tokens, REST API, or Microsoft login in this phase.
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-10" aria-labelledby="available-now-heading">
          <h2 id="available-now-heading" className={cn('mb-4', wb.sectionLabel)}>
            Available Now
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ACTIVE_MODULES.map((module) => (
              <PowerBiModuleCard
                key={module.id}
                module={module}
                icon={MODULE_ICONS[module.id]}
                onOpen={module.id === 'dax-practice' ? onOpenDaxPractice : undefined}
              />
            ))}
          </div>
        </section>

        <section className="mb-10" aria-labelledby="available-soon-heading">
          <h2 id="available-soon-heading" className={cn('mb-4', wb.sectionLabel)}>
            Available Soon
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {AVAILABLE_SOON_MODULES.map((module) => (
              <PowerBiModuleCard key={module.id} module={module} icon={MODULE_ICONS[module.id]} />
            ))}
          </div>
        </section>

        <section aria-labelledby="coming-soon-heading">
          <h2 id="coming-soon-heading" className={cn('mb-4', wb.sectionLabel)}>
            Coming Soon
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMING_SOON_MODULES.map((module) => (
              <PowerBiModuleCard key={module.id} module={module} icon={MODULE_ICONS[module.id]} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
