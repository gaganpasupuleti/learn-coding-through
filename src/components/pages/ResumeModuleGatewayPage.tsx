import { useMemo, useState } from 'react'
import { ArrowRight, Bot, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildResumeHandoffUrl } from '@/lib/resume-handoff'
import { ResumeBuilderPage } from '@/components/pages/ResumeBuilderPage'
import type { AuthUser } from '@/lib/auth'

interface ResumeModuleGatewayPageProps {
  user: AuthUser
}

export function ResumeModuleGatewayPage({ user }: ResumeModuleGatewayPageProps) {
  const [view, setView] = useState<'chooser' | 'builder'>('chooser')
  const [error, setError] = useState<string | null>(null)

  const aiHandoffUrl = useMemo(() => {
    try {
      return buildResumeHandoffUrl(user, 'tailor', 'ai')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start resume module handoff.'
      setError(message)
      return ''
    }
  }, [user])

  if (view === 'builder') {
    return <ResumeBuilderPage onBack={() => setView('chooser')} />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
        <div className="mx-auto w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
          <FileText className="text-blue-600" size={22} />
        </div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 text-center">Choose Resume Flow</h1>
        <p className="text-sm text-slate-600 text-center">
          Continue with your CodeQuest session in Resume Builder. Pick a no-AI editing flow or an AI-assisted tailoring flow.
        </p>

        {error ? (
          <p className="text-sm text-red-600 text-center">{error}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                No AI required
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Resume Builder</h2>
              <p className="text-sm text-slate-600 min-h-[48px]">
                Build, edit, and export your resume with templates and manual controls.
              </p>
              <Button
                type="button"
                onClick={() => setView('builder')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue Without AI
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                <Bot size={12} />
                AI required
              </div>
              <h2 className="text-lg font-semibold text-slate-900">AI Resume Assistant</h2>
              <p className="text-sm text-slate-600 min-h-[48px]">
                Tailor resumes to job descriptions and run AI enrichment workflows.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.assign(aiHandoffUrl)}
                className="w-full"
              >
                Continue With AI
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
