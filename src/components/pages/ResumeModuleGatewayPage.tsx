import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildResumeHandoffUrl } from '@/lib/resume-handoff'
import type { AuthUser } from '@/lib/auth'

interface ResumeModuleGatewayPageProps {
  user: AuthUser
}

export function ResumeModuleGatewayPage({ user }: ResumeModuleGatewayPageProps) {
  const [error, setError] = useState<string | null>(null)

  const handoffUrl = useMemo(() => {
    try {
      return buildResumeHandoffUrl(user)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start resume module handoff.'
      setError(message)
      return ''
    }
  }, [user])

  useEffect(() => {
    if (!handoffUrl) return
    const timer = window.setTimeout(() => {
      window.location.assign(handoffUrl)
    }, 150)
    return () => window.clearTimeout(timer)
  }, [handoffUrl])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full rounded-xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
          <FileText className="text-blue-600" size={24} />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Opening Resume Builder</h1>
        <p className="text-sm text-slate-600">
          We are securely transferring your current CodeQuest session to the Resume module.
        </p>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <Button
            type="button"
            onClick={() => window.location.assign(handoffUrl)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Continue to Resume Builder
            <ArrowRight className="ml-2" size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}
