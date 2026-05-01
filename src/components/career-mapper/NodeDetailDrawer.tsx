import { X, Rocket, Flashcard } from '@phosphor-icons/react'
import type { SyllabusItem, CareerRole } from '@/types/career'

interface NodeDetailDrawerProps {
  isOpen: boolean
  nodeItem: SyllabusItem | null
  role: CareerRole | null
  isCompleted: boolean
  onClose: () => void
  onLaunchProject?: (projectId: string) => void
  onOpenQuiz?: (quizId: string) => void
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
  if (!isOpen || !nodeItem || !role) return null

  const typeStyle = TYPE_STYLES[nodeItem.type] || TYPE_STYLES.topic
  const isProject = nodeItem.type === 'deliverable' && nodeItem.projectId

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 39,
          animation: 'fadeIn 0.2s',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: 400,
          maxWidth: '100%',
          background: '#111118',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span style={{ color: typeStyle.color }}>{typeStyle.icon}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: typeStyle.color,
                  textTransform: 'uppercase',
                }}
              >
                {typeStyle.label}
              </span>
              {isCompleted && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#4ade80',
                    background: 'rgba(74, 222, 128, 0.1)',
                    border: '1px solid #4ade80',
                    padding: '1px 6px',
                    borderRadius: 3,
                  }}
                >
                  ✓ COMPLETE
                </span>
              )}
            </div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#e2e8f0',
                margin: 0,
              }}
            >
              {nodeItem.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = '#e2e8f0')}
            onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = '#9ca3af')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Description */}
          <div>
            <h3
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: '#e2e8f0',
                marginBottom: 8,
                marginTop: 0,
              }}
            >
              Overview
            </h3>
            <p
              style={{
                fontSize: 12,
                color: '#9ca3af',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {nodeItem.description}
            </p>
          </div>

          {/* Meta information */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              padding: '12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 10,
                  color: '#6b7280',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Month
              </span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginTop: 4 }}>
                Month {nodeItem.month}
              </div>
            </div>
            <div>
              <span
                style={{
                  fontSize: 10,
                  color: '#6b7280',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Week
              </span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginTop: 4 }}>
                Week {nodeItem.week}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isProject && nodeItem.projectId && (
              <button
                type="button"
                onClick={() => {
                  onLaunchProject?.(nodeItem.projectId!)
                  onClose()
                }}
                style={{
                  padding: '10px 14px',
                  background: '#4ade80',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.background = '#22c55e'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.background = '#4ade80'
                }}
              >
                <Rocket size={14} />
                Launch Project
              </button>
            )}

            {nodeItem.quizId && (
              <button
                type="button"
                onClick={() => {
                  onOpenQuiz?.(nodeItem.quizId!)
                  onClose()
                }}
                style={{
                  padding: '10px 14px',
                  background: '#818cf8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.background = '#a78bfa'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.background = '#818cf8'
                }}
              >
                <Flashcard size={14} />
                Take Quiz
              </button>
            )}
          </div>

          {/* Related Resources */}
          <div>
            <h3
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: '#e2e8f0',
                marginBottom: 8,
                marginTop: 0,
              }}
            >
              Learning Path
            </h3>
            <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#818cf8' }}>Role:</span>
                <span>{role.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#818cf8' }}>Difficulty:</span>
                <span style={{ textTransform: 'capitalize', color: '#fbbf24' }}>{role.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '8px 14px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              color: '#9ca3af',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = 'rgba(255,255,255,0.2)'
              el.style.color = '#e2e8f0'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = 'rgba(255,255,255,0.08)'
              el.style.color = '#9ca3af'
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
