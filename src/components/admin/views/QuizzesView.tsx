import { useRef, useState } from 'react'
import { UploadSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { importAdminQuizBank } from '@/lib/api'
import { getAuthToken } from '@/lib/auth'
import { cn } from '@/lib/utils'

import {
  adminPaneCardClass,
  adminPaneHeaderClass,
  adminPaneScrollBodyClass,
  adminSectionRootClass,
} from './dashboardPolish'

export function QuizzesView() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const token = getAuthToken()
    if (!token) {
      toast.error('Sign in as admin before uploading a quiz bank.')
      return
    }

    setIsUploading(true)
    try {
      const result = await importAdminQuizBank(token, file)
      const summary = `Inserted ${result.inserted} question(s). Rejected ${result.rejected}.`
      setLastResult(summary)
      if (result.rejected > 0) {
        toast.warning(summary)
      } else {
        toast.success(summary)
      }
      if (result.errors.length > 0) {
        console.warn('Quiz bank rejected rows', result.errors)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Quiz bank import failed'
      setLastResult(message)
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={adminSectionRootClass}>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden lg:grid-cols-12">
        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0 lg:col-span-5')}>
          <div className={adminPaneHeaderClass}>Quiz bank import</div>
          <div className={adminPaneScrollBodyClass}>
            <p className="text-sm text-muted-foreground">
              Upload an Excel or CSV quiz bank. Valid rows are inserted into the catalog database. Rejected
              rows return row-level validation errors.
            </p>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p>
                <strong>Required columns:</strong> quiz_slug, order, question_type, title, prompt, explanation
              </p>
              <p>
                <strong>Supported types:</strong> mcq, true_false, fill_blank, code_output, sql_query,
                python_debug, scenario
              </p>
              <p>
                <strong>Choice fields:</strong> options (pipe-separated), correct_index
              </p>
              <p>
                <strong>Text fields:</strong> answer, acceptable_answers, expected_output, code_snippet, language
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
              >
                <UploadSimple size={16} className="mr-1.5" />
                Upload .csv / .xlsx
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(event) => void handleUpload(event)}
              />
            </div>
            {lastResult ? (
              <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                {lastResult}
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
