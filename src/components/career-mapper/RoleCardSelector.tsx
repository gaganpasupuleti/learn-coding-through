import { Briefcase, ChartLine } from '@phosphor-icons/react'
import type { CareerRole } from '@/types/career'

interface RoleCardSelectorProps {
  roles: CareerRole[]
  selectedRoleId: string
  onSelectRole: (role: CareerRole) => void
  completedItems: Set<string>
}

const DOMAIN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Web: { bg: 'rgba(99, 102, 241, 0.1)', text: '#818cf8', border: '#4f46e5' },
  Data: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '#1d4ed8' },
  Cloud: { bg: 'rgba(59, 188, 226, 0.1)', text: '#0891b2', border: '#0369a1' },
  DevOps: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: '#7c3aed' },
  AI: { bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899', border: '#be185d' },
  Security: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: '#991b1b' },
  Mobile: { bg: 'rgba(14, 165, 233, 0.1)', text: '#0ea5e9', border: '#0369a1' },
}

const DIFF_COLORS: Record<string, string> = {
  Beginner: '#4ade80',
  Intermediate: '#fbbf24',
  Advanced: '#f87171',
}

export function RoleCardSelector({
  roles,
  selectedRoleId,
  onSelectRole,
  completedItems,
}: RoleCardSelectorProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: '#e2e8f0',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <ChartLine size={14} style={{ color: '#818cf8' }} />
        Available Career Paths
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollBehavior: 'smooth',
        }}
      >
        {roles.map(role => {
          const isSelected = role.id === selectedRoleId
          const colorScheme = DOMAIN_COLORS[role.domain] || DOMAIN_COLORS.Web
          const roleItems = role.syllabus.filter(i => i.type === 'deliverable')
          const completedProjects = roleItems.filter(p => completedItems.has(p.id)).length
          const completionPct =
            roleItems.length > 0 ? Math.round((completedProjects / roleItems.length) * 100) : 0

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role)}
              style={{
                flex: '0 0 260px',
                padding: '14px 16px',
                background: isSelected ? colorScheme.bg : 'rgba(255,255,255,0.03)',
                border: `2px solid ${isSelected ? colorScheme.border : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = colorScheme.border
                el.style.background = colorScheme.bg
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                if (!isSelected) {
                  el.style.borderColor = 'rgba(255,255,255,0.08)'
                  el.style.background = 'rgba(255,255,255,0.03)'
                }
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{role.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0 ' }}>
                    {role.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: DIFF_COLORS[role.difficulty],
                    border: `1px solid ${DIFF_COLORS[role.difficulty]}`,
                    padding: '1px 5px',
                    borderRadius: 3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {role.difficulty.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: 10,
                  color: '#9ca3af',
                  margin: 0,
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {role.description}
              </p>

              {/* Progress bar */}
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: completionPct > 0 ? '#4ade80' : colorScheme.text,
                    width: `${completionPct}%`,
                    transition: 'width 0.3s',
                  }}
                />
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#9ca3af' }}>
                <span>{completedProjects} projects</span>
                <span>{completionPct}%</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
