import { X, Rocket, Flashcard, Note } from '@phosphor-icons/react'
import type { SyllabusItem, CareerRole } from '@/types/career'
import { useMilestoneNotes } from '@/hooks/use-milestone-notes'

interface NodeDetailDrawerProps {
  isOpen: boolean
  nodeItem: SyllabusItem | null
  role: CareerRole | null
  isCompleted: boolean
  onClose: () => void
  onLaunchProject?: (projectId: string, itemId: string) => void
  onOpenQuiz?: (quizId: string, itemId: string) => void
}

const TYPE_STYLES: Record<string, { icon: JSX.Element; label: string; color: string }> = {
  topic: {
    icon: <Flashcard size={16} />,
    label: 'Learning Topic',
    color: '#818cf8',
  },
  milestone: {
    icon: <Flashcard size={16} />,
    label: 'Milestone',
    color: '#f59e0b',
  },
  deliverable: {
    icon: <Rocket size={16} />,
    label: 'Project Deliverable',
    color: '#4ade80',
  },
}

export function NodeDetailDrawer({
  isOpen,
  nodeItem,
  role,
  isCompleted,
  onClose,
  onLaunchProject,
  onOpenQuiz,
}: NodeDetailDrawerProps) {
  const { getNote } = useMilestoneNotes()

  if (!isOpen || !nodeItem || !role) return null

  const typeStyle = TYPE_STYLES[nodeItem.type] || TYPE_STYLES.topic
  const isProject = nodeItem.type === 'deliverable' && nodeItem.projectId
  const note = getNote(role.id, nodeItem.id)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[39] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-[400px] max-w-full bg-[#111118] border-l border-white/10 z-[40] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: typeStyle.color }}>{typeStyle.icon}</span>
              <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: typeStyle.color }}>
                {typeStyle.label}
              </span>
              {isCompleted && (
                <span className="text-[10px] font-bold text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80] px-1.5 py-0.5 rounded">
                  ✓ COMPLETE
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#e2e8f0]">
              {nodeItem.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-[#e2e8f0] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Description */}
          <div>
            <h3 className="text-[12px] font-bold tracking-tight text-[#e2e8f0] mb-2 uppercase">
              Overview
            </h3>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              {nodeItem.description}
            </p>
          </div>

          {/* Meta information */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <div>
              <span className="text-[10px] text-gray-500 tracking-wider uppercase">
                Month
              </span>
              <div className="text-[14px] font-bold text-[#e2e8f0] mt-1">
                Month {nodeItem.month}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 tracking-wider uppercase">
                Week
              </span>
              <div className="text-[14px] font-bold text-[#e2e8f0] mt-1">
                Week {nodeItem.week}
              </div>
            </div>
          </div>

          {/* Personal Note */}
          {note && (
            <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
              <div className="flex items-center gap-1.5 mb-2">
                <Note size={14} className="text-[#818cf8]" weight="fill" />
                <span className="text-[11px] font-bold text-[#818cf8] uppercase tracking-wider">
                  Your Note
                </span>
              </div>
              <p className="text-[12px] text-gray-300 leading-relaxed italic">
                "{note.content}"
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {isProject && nodeItem.projectId && (
              <button
                type="button"
                onClick={() => {
                  onLaunchProject?.(nodeItem.projectId!, nodeItem.id)
                  onClose()
                }}
                className="px-4 py-2.5 bg-[#4ade80] hover:bg-[#22c55e] text-[#0a0a0a] rounded-md text-[12px] font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <Rocket size={14} />
                Launch Project
              </button>
            )}

            {nodeItem.quizId && (
              <button
                type="button"
                onClick={() => {
                  onOpenQuiz?.(nodeItem.quizId!, nodeItem.id)
                  onClose()
                }}
                className="px-4 py-2.5 bg-[#818cf8] hover:bg-[#a78bfa] text-white rounded-md text-[12px] font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <Flashcard size={14} />
                Take Quiz
              </button>
            )}
          </div>

          {/* Related Resources */}
          <div>
            <h3 className="text-[12px] font-bold tracking-tight text-[#e2e8f0] mb-2 uppercase">
              Learning Path
            </h3>
            <div className="text-[11px] text-gray-400 leading-relaxed">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-[#818cf8]">Role:</span>
                <span>{role.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#818cf8]">Difficulty:</span>
                <span className="capitalize text-[#fbbf24]">{role.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-black/20">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 bg-transparent border border-white/10 rounded-md text-gray-400 hover:text-[#e2e8f0] hover:border-white/20 text-[12px] font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
