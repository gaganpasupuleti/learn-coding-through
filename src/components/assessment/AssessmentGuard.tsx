import { useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '@/lib/auth'

interface AssessmentGuardProps {
  enabled: boolean
  user: AuthUser
  page: string
}

interface GuardEvent {
  id: number
  message: string
  at: string
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tag = target.tagName.toUpperCase()
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function AssessmentGuard({ enabled, user, page }: AssessmentGuardProps) {
  const [events, setEvents] = useState<GuardEvent[]>([])

  const watermarkText = useMemo(() => {
    const safeEmail = user.email || 'unknown-user'
    return `${safeEmail} • ${page.toUpperCase()} • assessment mode`
  }, [user.email, page])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let eventId = 0
    const pushEvent = (message: string) => {
      eventId += 1
      const nextEvent: GuardEvent = {
        id: eventId,
        message,
        at: new Date().toLocaleTimeString(),
      }
      setEvents((current) => [nextEvent, ...current].slice(0, 5))
    }

    const preventContext = (event: Event) => {
      event.preventDefault()
      pushEvent('Right-click is disabled during assessment.')
    }

    const preventSelect = (event: Event) => {
      if (isEditableTarget(event.target)) {
        return
      }
      event.preventDefault()
    }

    const preventClipboard = (event: ClipboardEvent) => {
      event.preventDefault()
      pushEvent('Copy/paste is disabled during assessment.')
    }

    const handleBlur = () => {
      pushEvent('Window focus lost. This attempt has been flagged.')
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        pushEvent('Tab/app switched. This attempt has been flagged.')
      }
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const ctrlOrMeta = event.ctrlKey || event.metaKey
      const blockedCombo = ctrlOrMeta && ['c', 'x', 'v', 's', 'p', 'u'].includes(key)
      const blockedKeys = key === 'f12' || key === 'printscreen'

      if (!blockedCombo && !blockedKeys) {
        return
      }

      event.preventDefault()
      pushEvent('Restricted key action blocked during assessment.')

      if (key === 'printscreen') {
        try {
          await navigator.clipboard.writeText('Screenshot capture is discouraged during assessment mode.')
        } catch {
          // Best effort only.
        }
      }
    }

    const handleFullscreenExit = () => {
      if (!document.fullscreenElement) {
        pushEvent('Fullscreen exited. This attempt has been flagged.')
      }
    }

    document.addEventListener('contextmenu', preventContext)
    document.addEventListener('copy', preventClipboard)
    document.addEventListener('cut', preventClipboard)
    document.addEventListener('paste', preventClipboard)
    document.addEventListener('dragstart', preventSelect)
    document.addEventListener('selectstart', preventSelect)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibility)
    document.addEventListener('fullscreenchange', handleFullscreenExit)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('contextmenu', preventContext)
      document.removeEventListener('copy', preventClipboard)
      document.removeEventListener('cut', preventClipboard)
      document.removeEventListener('paste', preventClipboard)
      document.removeEventListener('dragstart', preventSelect)
      document.removeEventListener('selectstart', preventSelect)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibility)
      document.removeEventListener('fullscreenchange', handleFullscreenExit)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])

  if (!enabled) {
    return null
  }

  const latest = events[0]

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
        style={{
          backgroundImage: `repeating-linear-gradient(-24deg, transparent 0px, transparent 130px, rgba(15,23,42,0.06) 130px, rgba(15,23,42,0.06) 132px)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-slate-600/20 text-2xl md:text-4xl font-semibold tracking-wide rotate-[-18deg] select-none">
            {watermarkText}
          </p>
        </div>
      </div>

      <div className="fixed top-3 right-3 z-[70] max-w-sm rounded-md border border-amber-400 bg-amber-50 px-3 py-2 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Assessment Guard Active</p>
        <p className="text-xs text-amber-800">Screenshots/recordings cannot be fully blocked by web browsers. Activity is monitored.</p>
        {latest && (
          <p className="mt-1 text-xs text-amber-900">
            Last event ({latest.at}): {latest.message}
          </p>
        )}
      </div>
    </>
  )
}
