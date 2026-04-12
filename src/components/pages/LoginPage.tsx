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
  onBrowsePublicly?: () => void
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

export function LoginPage({ onAuthenticated, onBrowsePublicly }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
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
    if (!email.trim() || !fullName.trim()) {
      toast.error('Name and email are required for demo registration.')
      return
    }

    const demoUser: AuthUser = {
      id: -1,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role: 'demo',
    }
    storeUser(demoUser)
    setDemoFlag(true)
    toast.success('Demo registration complete. You can start 2 projects and 2 quizzes.')
    onAuthenticated(demoUser)
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
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 320,
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

  const modeLabels: Record<AuthMode, string> = {
    login: 'Log In',
    signup: 'Sign Up',
    demoRegister: 'Demo Register',
    forgotPassword: 'Forgot Password',
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">

        {/* Brand mark */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white mx-auto shadow-sm">
            <Code2 size={22} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">CodeQuest</h1>
          <p className="text-sm text-slate-500">Career Acceleration Platform</p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {(['login', 'signup', 'demoRegister', 'forgotPassword'] as AuthMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all duration-150 ${
                mode === m
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setMode(m)}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          {mode === 'demoRegister' ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" />
                  Demo Registration
                </h2>
                <p className="text-sm text-slate-500">Register for a limited demo account with guided access.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <User size={12} /> Full Name
                  </label>
                  <Input
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <User size={12} /> Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">What's included</p>
                <ul className="space-y-1.5 text-sm text-slate-600">
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
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-150"
              >
                Register Demo Access
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
              <p className="text-xs text-center text-slate-400">
                Want full access?{' '}
                <button type="button" className="underline text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setMode('signup')}>
                  Create a free account
                </button>
              </p>
            </div>
          ) : mode === 'forgotPassword' ? (
            <div className="space-y-5" onKeyDown={handleKeyDown}>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900">Reset your password</h2>
                <p className="text-sm text-slate-500">
                  Step 1: request reset with email. Step 2: submit reset token and new password.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <User size={12} /> Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Lock size={12} /> Reset Token
                  </label>
                  <Input
                    placeholder="Paste reset token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Lock size={12} /> New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Choose a new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-900 font-semibold py-2.5 px-4 rounded-lg transition-all duration-150"
                  onClick={handleRequestPasswordReset}
                  disabled={isLoading}
                >
                  Request Token
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-150"
                  onClick={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait…' : 'Reset Password'}
                  {!isLoading && <ArrowRight size={15} strokeWidth={2.5} />}
                </button>
              </div>

              <p className="text-xs text-center text-slate-400">
                Remembered your password?{' '}
                <button type="button" className="underline text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setMode('login')}>
                  Go to login
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-5" onKeyDown={handleKeyDown}>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-sm text-slate-500">
                  {mode === 'login'
                    ? 'Sign in to continue your learning journey.'
                    : 'Free demo access: try any 2 projects + 2 quizzes.'}
                </p>
              </div>

              <div className="space-y-3">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                      <User size={12} /> Full Name
                    </label>
                    <Input placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <User size={12} /> Email
                  </label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Lock size={12} /> Password
                  </label>
                  <Input
                    type="password"
                    placeholder={mode === 'signup' ? 'Choose a strong password' : 'Your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-150"
                onClick={mode === 'login' ? handleLogin : handleSignup}
                disabled={isLoading}
              >
                {isLoading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
                {!isLoading && <ArrowRight size={15} strokeWidth={2.5} />}
              </button>

              {googleClientId ? (
                <div className="space-y-2">
                  <p className="text-xs text-center text-slate-400 uppercase tracking-wide">or continue with</p>
                  <div className="flex justify-center" ref={googleButtonRef} />
                </div>
              ) : (
                <p className="text-xs text-center text-slate-400">
                  Google login is disabled. Set VITE_GOOGLE_CLIENT_ID to enable it.
                </p>
              )}

              {mode === 'login' && (
                <p className="text-xs text-center text-slate-400">
                  No account?{' '}
                  <button type="button" className="underline text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setMode('signup')}>Sign up free</button>
                  {' '}or{' '}
                  <button type="button" className="underline text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setMode('demoRegister')}>register for demo</button>
                  {' '}or{' '}
                  <button type="button" className="underline text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setMode('forgotPassword')}>reset password</button>
                </p>
              )}
            </div>
          )}
        </div>

        {onBrowsePublicly && (
          <p className="text-xs text-center text-slate-400">
            Just exploring?{' '}
            <button type="button" className="underline text-slate-600 hover:text-blue-600 transition-colors" onClick={onBrowsePublicly}>
              Browse Career Mapper publicly
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
