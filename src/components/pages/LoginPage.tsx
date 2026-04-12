import { useEffect, useRef, useState } from 'react'
import { Code2, User, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  fetchCurrentUser,
  loginWithBackend,
  loginWithGoogleIdToken,
  registerWithBackend,
  requestPasswordReset,
  resetPasswordWithToken,
  storeAuthToken,
  storeUser,
  setDemoFlag,
  type AuthUser,
} from '@/lib/auth'

interface LoginPageProps {
  onAuthenticated: (user: AuthUser) => void
}

type AuthMode = 'login' | 'signup' | 'demoRegister' | 'forgotPassword'

type GoogleCredentialResponse = {
  credential?: string
}

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      VITE_GOOGLE_CLIENT_ID?: string
    }
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              width?: number
            }
          ) => void
        }
      }
    }
  }
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const googleButtonHostRef = useRef<HTMLDivElement | null>(null)
  const runtimeGoogleClientId =
    typeof window !== 'undefined'
      ? (window.__RUNTIME_CONFIG__?.VITE_GOOGLE_CLIENT_ID ?? '').trim()
      : ''
  const googleClientId = ((import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim() || runtimeGoogleClientId)

  const finalizeLogin = async (accessToken: string, fallbackUser: AuthUser) => {
    storeAuthToken(accessToken)
    const user = await fetchCurrentUser(accessToken) ?? fallbackUser
    setDemoFlag(false)
    storeUser(user)
    toast.success(`Welcome back, ${user.full_name}!`)
    onAuthenticated(user)
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required.')
      return
    }
    try {
      setIsLoading(true)
      const token = await loginWithBackend(email.trim(), password)
      await finalizeLogin(token, {
        id: 0,
        email: email.trim(),
        full_name: email.split('@')[0],
        role: 'student',
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed. Check credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      toast.error('Name, email and password are required.')
      return
    }
    try {
      setIsLoading(true)
      await registerWithBackend(fullName.trim(), email.trim(), password)
      const token = await loginWithBackend(email.trim(), password)
      await finalizeLogin(token, {
        id: 0,
        email: email.trim(),
        full_name: fullName.trim(),
        role: 'student',
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-up failed. Try a different email.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoAccess = () => {
    toast.error('Demo access is disabled. Please register to continue.')
  }

  const handleRequestPasswordReset = async () => {
    if (!email.trim()) {
      toast.error('Email is required.')
      return
    }

    try {
      setIsLoading(true)
      const result = await requestPasswordReset(email.trim())
      if (result.reset_token) {
        setResetToken(result.reset_token)
        toast.success('Reset token generated (dev mode). It is pre-filled below.')
      } else {
        toast.success('If your email exists, a reset link has been sent.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to request password reset.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetToken.trim() || !newPassword.trim()) {
      toast.error('Reset token and new password are required.')
      return
    }

    try {
      setIsLoading(true)
      await resetPasswordWithToken(resetToken.trim(), newPassword)
      toast.success('Password reset successful. Please log in with your new password.')
      setPassword('')
      setNewPassword('')
      setMode('login')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Password reset failed.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (mode === 'demoRegister' || !googleClientId || !googleButtonRef.current) {
      return
    }

    const initializeGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) {
        return
      }

      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }: GoogleCredentialResponse) => {
          if (!credential) {
            toast.error('Google login failed. No credential returned.')
            return
          }

          try {
            setIsLoading(true)
            const token = await loginWithGoogleIdToken(credential)
            await finalizeLogin(token, {
              id: 0,
              email: email.trim() || 'google-user@local',
              full_name: fullName.trim() || 'Google User',
              role: 'student',
            })
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Google login failed.')
          } finally {
            setIsLoading(false)
          }
        },
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_blue',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: Math.max(220, (googleButtonHostRef.current?.clientWidth ?? 320) - 24),
      })
    }

    if (window.google) {
      initializeGoogleButton()
      return
    }

    const existing = document.getElementById('google-identity-services') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', initializeGoogleButton)
      return () => existing.removeEventListener('load', initializeGoogleButton)
    }

    const script = document.createElement('script')
    script.id = 'google-identity-services'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.addEventListener('load', initializeGoogleButton)
    document.head.appendChild(script)

    return () => script.removeEventListener('load', initializeGoogleButton)
  }, [mode, googleClientId, email, fullName])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'login') handleLogin()
      else if (mode === 'signup') handleSignup()
      else if (mode === 'forgotPassword') {
        if (resetToken.trim() && newPassword.trim()) {
          handleResetPassword()
        } else {
          handleRequestPasswordReset()
        }
      }
    }
  }

  const fieldClass = 'h-10 rounded-xl bg-white/12 border-white/25 text-[15px] placeholder-transparent focus-visible:border-blue-300/80 focus-visible:ring-2 focus-visible:ring-blue-400/20'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(59,130,246,0.28),transparent_42%),radial-gradient(circle_at_85%_100%,rgba(14,165,233,0.20),transparent_38%),linear-gradient(160deg,#020617_0%,#0b132b_52%,#020617_100%)] flex items-center justify-center p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-45" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.65) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="relative w-full max-w-md space-y-5">

        {/* Brand mark */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto shadow-lg border border-blue-500/40">
            <Code2 size={22} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">CodeQuest</h1>
          <p className="text-sm text-blue-100/90">Career Acceleration Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_24px_55px_rgba(2,6,23,0.6)] p-5 sm:p-6">
          {mode === 'demoRegister' ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" />
                  Student Demo Access
                </h2>
                <p className="text-base text-blue-100/85 leading-relaxed">Use a student demo profile to explore before full registration.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-blue-100 flex items-center gap-1.5">
                    <User size={12} /> Full Name
                  </label>
                  <Input
                    className={fieldClass}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-blue-100 flex items-center gap-1.5">
                    <User size={12} /> Email
                  </label>
                  <Input
                    className={fieldClass}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 space-y-2">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wide">What's included</p>
                <ul className="space-y-1.5 text-[0.95rem] text-blue-50/95">
                  {[
                    'Browse all career paths & 4-month syllabus',
                    'Start any 2 projects of your choice',
                    'Attempt any 2 quizzes of your choice',
                    'Full practice module access',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5 font-bold text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={handleDemoAccess}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2.5 px-4 rounded-full transition-all duration-150"
              >
                Start Student Demo
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
              <p className="text-sm text-center text-blue-100/80">
                Want full access?{' '}
                <button type="button" className="underline text-white hover:text-blue-200 transition-colors" onClick={() => setMode('signup')}>
                  Create a free account
                </button>
              </p>
            </div>
          ) : mode === 'forgotPassword' ? (
            <div className="space-y-5" onKeyDown={handleKeyDown}>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white">Reset your password</h2>
                <p className="text-base text-blue-100/85 leading-relaxed">
                  Step 1: request reset with email. Step 2: submit reset token and new password.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-blue-100 flex items-center gap-1.5">
                    <User size={12} /> Email
                  </label>
                  <Input
                    className={fieldClass}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-blue-100 flex items-center gap-1.5">
                    <Lock size={12} /> Reset Token
                  </label>
                  <Input
                    className={fieldClass}
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-blue-100 flex items-center gap-1.5">
                    <Lock size={12} /> New Password
                  </label>
                  <Input
                    className={fieldClass}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-white/15 hover:bg-white/20 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-full transition-all duration-150 border border-white/30"
                  onClick={handleRequestPasswordReset}
                  disabled={isLoading}
                >
                  Request Token
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 font-semibold py-2.5 px-4 rounded-full transition-all duration-150"
                  onClick={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait…' : 'Reset Password'}
                  {!isLoading && <ArrowRight size={15} strokeWidth={2.5} />}
                </button>
              </div>

              <p className="text-sm text-center text-blue-100/80">
                Remembered your password?{' '}
                <button type="button" className="underline text-white hover:text-blue-200 transition-colors" onClick={() => setMode('login')}>
                  Go to login
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-5" onKeyDown={handleKeyDown}>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-base text-blue-100/85 leading-relaxed">
                  {mode === 'login'
                    ? 'Sign in to continue your learning journey.'
                    : 'Create an account to unlock the full learning platform.'}
                </p>
                {mode === 'signup' && (
                  <p className="text-sm text-amber-200/95">
                    Registrations are temporarily capped at 1500 active users. If the limit is reached, your email will be waitlisted and approved one by one.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-blue-100 flex items-center gap-1.5">
                      <User size={12} /> Full Name
                    </label>
                    <Input className={fieldClass} value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-blue-100 flex items-center gap-1.5">
                    <User size={12} /> Email
                  </label>
                  <Input className={fieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-blue-100 flex items-center gap-1.5">
                    <Lock size={12} /> Password
                  </label>
                  <Input
                    className={fieldClass}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 font-semibold py-2.5 px-4 rounded-full transition-all duration-150"
                onClick={mode === 'login' ? handleLogin : handleSignup}
                disabled={isLoading}
              >
                {isLoading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
                {!isLoading && <ArrowRight size={15} strokeWidth={2.5} />}
              </button>

              {mode === 'login' && (
                <div className="text-right -mt-2">
                  <button
                    type="button"
                    className="text-sm underline text-blue-100 hover:text-blue-200"
                    onClick={() => setMode('forgotPassword')}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {googleClientId ? (
                <div className="space-y-2">
                  <p className="text-sm text-center text-blue-100/80 uppercase tracking-wide">or continue with</p>
                  <div className="w-full flex justify-center" ref={googleButtonHostRef}>
                    <div ref={googleButtonRef} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-center text-blue-100/80">
                  Google login is disabled. Set VITE_GOOGLE_CLIENT_ID to enable it.
                </p>
              )}

              {mode === 'login' && (
                <div className="pt-1 text-sm text-center text-blue-100/80 space-y-1">
                  <p>
                    Don't have an account?{' '}
                    <button type="button" className="underline text-white hover:text-blue-200 transition-colors" onClick={() => setMode('signup')}>Register</button>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
