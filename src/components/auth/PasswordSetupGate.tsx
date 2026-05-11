import { useMemo, useState } from 'react'
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import {
  completePasswordSetup,
  getAuthToken,
  storeUser,
  type AuthUser,
} from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface PasswordSetupGateProps {
  user: AuthUser
  onSuccess: (user: AuthUser) => void
}

function passwordStrengthLabel(pw: string): { label: string; score: number; hint: string } {
  if (pw.length === 0) {
    return { label: '', score: 0, hint: 'Use at least 8 characters.' }
  }
  if (pw.length < 8) {
    return { label: 'Too short', score: 1, hint: `${8 - pw.length} more character${8 - pw.length === 1 ? '' : 's'} needed.` }
  }
  const hasLetter = /[A-Za-z]/.test(pw)
  const hasDigit = /\d/.test(pw)
  const hasExtra = /[^A-Za-z0-9]/.test(pw)
  if (hasLetter && hasDigit && hasExtra) {
    return { label: 'Strong', score: 3, hint: 'Good mix of letters, numbers, and symbols.' }
  }
  if (hasLetter && hasDigit) {
    return { label: 'Good', score: 2, hint: 'Consider adding a symbol for extra security.' }
  }
  return { label: 'Fair', score: 2, hint: 'Add letters and numbers for a stronger password.' }
}

export function PasswordSetupGate({ user, onSuccess }: PasswordSetupGateProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  const strength = useMemo(() => passwordStrengthLabel(password), [password])
  const confirmTouched = confirm.length > 0
  const confirmMismatch = confirmTouched && password !== confirm
  const confirmMatch = confirmTouched && password.length >= 8 && password === confirm

  const handleSubmit = async () => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    const token = getAuthToken()
    if (!token) {
      toast.error('Session expired. Please sign in again.')
      return
    }
    try {
      setBusy(true)
      const updated = await completePasswordSetup(token, password)
      if (!updated) {
        toast.error('Could not save password.')
        return
      }
      storeUser(updated)
      toast.success('Password saved. You can sign in with email and password or Google next time.')
      onSuccess(updated)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to set password.')
    } finally {
      setBusy(false)
    }
  }

  const fieldClass = cn(
    'h-11 rounded-xl border-slate-200 bg-white pr-10 text-[15px] shadow-sm',
    'placeholder:text-slate-400',
    'focus-visible:border-blue-400 focus-visible:ring-blue-500/25',
  )

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className={cn(
          'gap-0 overflow-hidden p-0 sm:max-w-[440px]',
          'border-slate-200/90 shadow-[0_24px_64px_rgba(15,23,42,0.18)]',
          '[&>button]:hidden',
        )}
        onPointerDownOutside={(ev) => ev.preventDefault()}
        onEscapeKeyDown={(ev) => ev.preventDefault()}
      >
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 px-6 pb-5 pt-6">
          <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
            <ShieldCheck size={22} strokeWidth={2.25} aria-hidden />
          </div>
          <DialogHeader className="gap-3 space-y-0 text-left">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
              Create your account password
            </DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed text-slate-600">
              You signed in with Google. Add a password so you can also sign in with{' '}
              <span className="font-medium text-slate-800">email and password</span>, or keep using Google anytime.
            </DialogDescription>
          </DialogHeader>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">Google account</p>
          <p className="mt-1 break-all rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2.5 font-mono text-sm text-slate-800 shadow-sm">
            {user.email}
          </p>
        </div>

        <div
          className="space-y-5 px-6 py-6"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !busy) {
              e.preventDefault()
              void handleSubmit()
            }
          }}
        >
          <div className="space-y-2">
            <label htmlFor="pw-new" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Lock size={15} className="text-slate-500" aria-hidden />
              New password
            </label>
            <div className="relative">
              <Input
                id="pw-new"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className={fieldClass}
                aria-invalid={password.length > 0 && password.length < 8}
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex h-1.5 gap-1" role="presentation">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-full flex-1 rounded-full transition-colors duration-200',
                        strength.score >= i
                          ? strength.score >= 3
                            ? 'bg-emerald-500'
                            : strength.score === 2
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          : 'bg-slate-200',
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  <span className="font-medium text-slate-700">{strength.label}</span>
                  {strength.label ? ' · ' : ''}
                  {strength.hint}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="pw-confirm" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Lock size={15} className="text-slate-500" aria-hidden />
              Confirm password
            </label>
            <div className="relative">
              <Input
                id="pw-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={busy}
                className={cn(fieldClass, confirmMismatch && 'border-red-300 focus-visible:ring-red-500/20')}
                aria-invalid={confirmMismatch}
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmMismatch && (
              <p className="text-xs font-medium text-red-600">Passwords do not match.</p>
            )}
            {confirmMatch && (
              <p className="text-xs font-medium text-emerald-600">Passwords match.</p>
            )}
          </div>

          <Button
            type="button"
            className="h-11 w-full rounded-full bg-blue-600 text-[15px] font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700"
            disabled={busy || password.length < 8 || password !== confirm}
            onClick={() => void handleSubmit()}
          >
            {busy ? 'Saving…' : 'Save password and continue'}
          </Button>
          <p className="text-center text-xs text-slate-500">
            After saving, you&apos;ll continue into the app. Use <span className="font-medium text-slate-600">Forgot password</span> on the login page if you need a reset later.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
