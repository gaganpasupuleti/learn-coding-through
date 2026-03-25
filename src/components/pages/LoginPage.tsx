import { useState } from 'react'
import { Code2, User, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  fetchCurrentUser,
  loginWithBackend,
  registerWithBackend,
  storeAuthToken,
  storeUser,
  setDemoFlag,
  type AuthUser,
} from '@/lib/auth'

interface LoginPageProps {
  onAuthenticated: (user: AuthUser) => void
  onBrowsePublicly?: () => void
}

type AuthMode = 'login' | 'signup' | 'demo'

export function LoginPage({ onAuthenticated, onBrowsePublicly }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
    const demoUser: AuthUser = { id: -1, email: 'demo@codequest.dev', full_name: 'Demo User', role: 'demo' }
    storeUser(demoUser)
    setDemoFlag(true)
    toast.success('Demo access granted! You can start 2 projects and 2 quizzes.')
    onAuthenticated(demoUser)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'login') handleLogin()
      else if (mode === 'signup') handleSignup()
    }
  }

  const modeLabels: Record<AuthMode, string> = { login: 'Log In', signup: 'Sign Up', demo: 'Try Demo' }

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
          {(['login', 'signup', 'demo'] as AuthMode[]).map((m) => (
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
          {mode === 'demo' ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" />
                  Demo Access
                </h2>
                <p className="text-sm text-slate-500">No account needed — explore with limited access.</p>
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
                Start Demo Access
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
              <p className="text-xs text-center text-slate-400">
                Want full access?{' '}
                <button type="button" className="underline text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setMode('signup')}>
                  Create a free account
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

              {mode === 'login' && (
                <p className="text-xs text-center text-slate-400">
                  No account?{' '}
                  <button type="button" className="underline text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setMode('signup')}>Sign up free</button>
                  {' '}or{' '}
                  <button type="button" className="underline text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setMode('demo')}>try demo</button>
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
