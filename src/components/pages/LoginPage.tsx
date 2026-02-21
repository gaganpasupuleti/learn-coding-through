import { useState } from 'react'
import { Cube, User, Lock, ArrowRight, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  fetchCurrentUser,
  storeAuthToken,
  storeUser,
  setDemoFlag,
  type AuthUser,
} from '@/lib/auth'
import {
  loginUser,
  registerUser,
} from '@/lib/roadmapper-api'

interface LoginPageProps {
  onAuthenticated: (user: AuthUser) => void
  /** Allow browsing without login (for Career Mapper public access) */
  onBrowsePublicly?: () => void
}

type AuthMode = 'login' | 'signup' | 'demo'

export function LoginPage({ onAuthenticated, onBrowsePublicly }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required.')
      return
    }
    try {
      setIsLoading(true)
      const token = await loginUser({ email: email.trim(), password })
      storeAuthToken(token)

      // Try to fetch user profile; default to 'student' if endpoint unavailable
      const user = await fetchCurrentUser(token) ?? {
        id: 0,
        email: email.trim(),
        full_name: email.split('@')[0],
        role: 'student' as const,
      }
      storeUser(user)
      toast.success(`Welcome back, ${user.full_name}!`)
      onAuthenticated(user)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Check credentials.'
      toast.error(message)
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
      await registerUser({ email: email.trim(), full_name: fullName.trim(), password })
      const token = await loginUser({ email: email.trim(), password })
      storeAuthToken(token)

      const user = await fetchCurrentUser(token) ?? {
        id: 0,
        email: email.trim(),
        full_name: fullName.trim(),
        role: 'student' as const,
      }
      storeUser(user)
      setDemoFlag(true)
      toast.success(`Account created! Welcome, ${user.full_name}.`)
      onAuthenticated(user)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-up failed. Try a different email.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoAccess = () => {
    const demoUser: AuthUser = {
      id: -1,
      email: 'demo@codequest.dev',
      full_name: 'Demo User',
      role: 'demo',
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mx-auto">
            <Cube size={28} weight="bold" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CodeQuest</h1>
          <p className="text-muted-foreground text-sm">Career Acceleration Platform</p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
          {(['login', 'signup', 'demo'] as AuthMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors capitalize ${
                mode === m ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setMode(m)}
            >
              {m === 'demo' ? 'Try Demo' : m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Card content */}
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            {mode === 'login' && (
              <>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Sign in to continue your learning journey.</CardDescription>
              </>
            )}
            {mode === 'signup' && (
              <>
                <CardTitle>Create account</CardTitle>
                <CardDescription>
                  Free demo access: try any 2 projects + 2 quizzes.{' '}
                  <Badge variant="secondary" className="rounded-full text-xs">Demo</Badge>
                </CardDescription>
              </>
            )}
            {mode === 'demo' && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <Sparkle size={18} className="text-primary" weight="fill" />
                  Demo Access
                </CardTitle>
                <CardDescription>
                  No account needed. Explore the platform with limited access: 2 projects + 2 quizzes.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4" onKeyDown={handleKeyDown}>
            {mode === 'demo' ? (
              <div className="space-y-4">
                <div className="rounded-lg border bg-primary/5 p-4 space-y-2">
                  <p className="text-sm font-medium">What you get with Demo access:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      Browse all career paths & 4-month syllabus
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      Start any 2 projects of your choice
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      Attempt any 2 quizzes of your choice
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      Full practice module access
                    </li>
                  </ul>
                </div>
                <Button className="w-full" size="lg" onClick={handleDemoAccess}>
                  Start Demo Access
                  <ArrowRight size={18} weight="bold" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Want full access?{' '}
                  <button
                    type="button"
                    className="underline text-foreground hover:text-primary"
                    onClick={() => setMode('signup')}
                  >
                    Create a free account
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User size={14} /> Full Name
                    </label>
                    <Input
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User size={14} /> Email
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
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock size={14} /> Password
                  </label>
                  <Input
                    type="password"
                    placeholder={mode === 'signup' ? 'Choose a strong password' : 'Your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={mode === 'login' ? handleLogin : handleSignup}
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
                  {!isLoading && <ArrowRight size={18} weight="bold" />}
                </Button>
                {mode === 'login' && (
                  <p className="text-xs text-center text-muted-foreground">
                    No account?{' '}
                    <button
                      type="button"
                      className="underline text-foreground hover:text-primary"
                      onClick={() => setMode('signup')}
                    >
                      Sign up free
                    </button>
                    {' '}or{' '}
                    <button
                      type="button"
                      className="underline text-foreground hover:text-primary"
                      onClick={() => setMode('demo')}
                    >
                      try demo
                    </button>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Public browse link */}
        {onBrowsePublicly && (
          <p className="text-xs text-center text-muted-foreground">
            Just exploring?{' '}
            <button
              type="button"
              className="underline text-foreground hover:text-primary"
              onClick={onBrowsePublicly}
            >
              Browse Career Mapper publicly
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
