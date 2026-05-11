import { useEffect, useMemo, useRef, useState } from 'react'
import { Code2, User, Lock, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  API_BASE_URL,
  fetchAuthPublicConfig,
  type AuthPublicConfig,
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

type AuthMode = 'login' | 'signup' | 'forgotPassword'

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

  const bootstrapGoogleClientId = useMemo(
    () =>
      (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim() ||
      runtimeGoogleClientId,
    [runtimeGoogleClientId],
  )

  /** Loaded from GET /api/v1/auth/config (includes public google_client_id when backend is configured). */
  const [authPublic, setAuthPublic] = useState<AuthPublicConfig | null>(null)
  const [authPublicReady, setAuthPublicReady] = useState(false)
  const [authPublicFetchFailed, setAuthPublicFetchFailed] = useState(false)

  const googleClientId = useMemo(
    () =>
      bootstrapGoogleClientId ||
      (authPublic?.google_client_id ?? '').trim(),
    [bootstrapGoogleClientId, authPublic],
  )

  const googleBackendEnabled =
    !authPublicReady ? null : authPublicFetchFailed ? false : authPublic?.google_auth_enabled ?? false

  /** Show Google when the server enables it, or when the SPA has a Web client ID locally (backend must still set GOOGLE_OAUTH_CLIENT_ID or token exchange returns 503). */
  const googleButtonAllowed =
    authPublicReady &&
    !!googleClientId &&
    (googleBackendEnabled === true || !!bootstrapGoogleClientId)

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
      const msg = err instanceof Error ? err.message : ''
      if (msg.toLowerCase().includes('pending admin approval')) {
        setPendingApproval(true)
      } else {
        toast.error(msg || 'Login failed. Check credentials.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const [pendingApproval, setPendingApproval] = useState(false)

  useEffect(() => {
    let cancelled = false
    void fetchAuthPublicConfig().then((cfg) => {
      if (cancelled) return
      setAuthPublicReady(true)
      if (cfg === null) {
        setAuthPublicFetchFailed(true)
        setAuthPublic(null)
      } else {
        setAuthPublicFetchFailed(false)
        setAuthPublic(cfg)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

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
      const msg = err instanceof Error ? err.message : ''
      if (msg.toLowerCase().includes('pending admin approval') || msg.toLowerCase().includes('pending approval')) {
        setPendingApproval(true)
        toast.success('Registration submitted! Please wait for admin approval before logging in.')
      } else {
        toast.error(msg || 'Sign-up failed. Try a different email.')
      }
    } finally {
      setIsLoading(false)
    }
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
    if ((mode !== 'login' && mode !== 'signup') || !googleClientId || !googleButtonAllowed || !googleButtonRef.current) {
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
            const msg = err instanceof Error ? err.message : ''
            if (msg.toLowerCase().includes('pending admin approval') || msg.toLowerCase().includes('pending approval')) {
              setPendingApproval(true)
            } else {
              toast.error(msg || 'Google login failed.')
            }
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
  }, [mode, googleClientId, googleButtonAllowed, email, fullName])

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

  const inputClassName =
    'h-11 rounded-2xl bg-background border-border/60 text-[15px] text-foreground placeholder:text-muted-foreground shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'

  const primaryButtonClass =
    'w-full flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 font-semibold py-3 px-4 transition-all shadow-md shadow-primary/25 active:scale-[0.98]'

  const secondaryButtonClass =
    'w-full flex items-center justify-center gap-2 rounded-full border border-border bg-card text-foreground hover:bg-muted/50 disabled:opacity-60 font-semibold py-3 px-4 transition-all active:scale-[0.98]'

  const labelClass = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'

  return (
    <main
      className="relative min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 p-4 sm:p-8"
      aria-label="Sign in to CodeQuest"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.12),transparent)]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 shadow-[0_10px_50px_-12px_rgba(15,23,42,0.12)]">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground mx-auto shadow-md shadow-primary/30">
              <Code2 size={22} strokeWidth={2.5} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">System Access</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Authenticate</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">CodeQuest · learning platform</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Trouble signing in? Ensure the API is running, <span className="font-mono text-foreground/80">VITE_*</span> / proxy settings match{' '}
              <span className="font-mono text-foreground/80">docs/LAUNCH.md</span>, and for Google set{' '}
              <span className="font-mono text-foreground/80">GOOGLE_OAUTH_CLIENT_ID</span> in <span className="font-mono text-foreground/80">backend/.env</span>{' '}
              (same Web client ID as the frontend).
            </p>
          </div>

          {mode === 'forgotPassword' ? (
            <div className="space-y-6" onKeyDown={handleKeyDown}>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Credential recovery</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Two-phase flow: request a reset with email, then submit token and new password.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Phase 1 — Identity</p>
                  <div className="space-y-1.5">
                    <label className={labelClass}>
                      <User size={12} /> Email
                    </label>
                    <Input
                      className={inputClassName}
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="h-px bg-border/40" />

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Phase 2 — New secret</p>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        <Lock size={12} /> Reset Token
                      </label>
                      <Input
                        className={inputClassName}
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        <Lock size={12} /> New Password
                      </label>
                      <Input
                        className={inputClassName}
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" className={secondaryButtonClass} onClick={handleRequestPasswordReset} disabled={isLoading}>
                  Request Token
                </button>
                <button type="button" className={primaryButtonClass} onClick={handleResetPassword} disabled={isLoading}>
                  {isLoading ? 'Please wait…' : 'Reset Password'}
                  {!isLoading && <ArrowRight size={15} strokeWidth={2.5} />}
                </button>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Remembered your password?{' '}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                  onClick={() => setMode('login')}
                >
                  Go to login
                </button>
              </p>
            </div>
          ) : pendingApproval ? (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto ring-1 ring-emerald-500/30 shadow-[0_0_24px_rgba(52,211,153,0.15)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/></svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Registration Submitted</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your account has been created and is now{' '}
                <span className="font-semibold text-amber-600">pending admin approval</span>. You will be able to log in once an admin approves your registration.
              </p>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => { setPendingApproval(false); setMode('login') }}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <div className="space-y-6" onKeyDown={handleKeyDown}>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {mode === 'login' ? 'Session sign-in' : 'Provision account'}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mode === 'login'
                    ? 'Identify yourself, then confirm your secret — one submit completes authentication.'
                    : 'Create an account to unlock the full learning platform.'}
                </p>
                {mode === 'signup' && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All new registrations require admin approval. After signing up, please wait for an admin to approve your account before logging in.
                  </p>
                )}
              </div>

              <div className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Step 1 — Profile</p>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        <User size={12} /> Full Name
                      </label>
                      <Input className={inputClassName} value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {mode === 'signup' && <div className="h-px bg-border/40" />}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                    {mode === 'signup' ? 'Step 2 — Identity' : 'Step 1 — Identity'}
                  </p>
                  <div className="space-y-1.5">
                    <label className={labelClass}>
                      <User size={12} /> Email
                    </label>
                    <Input
                      className={inputClassName}
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="h-px bg-border/40" />

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                    {mode === 'signup' ? 'Step 3 — Secret' : 'Step 2 — Secret'}
                  </p>
                  <div className="space-y-1.5">
                    <label className={labelClass}>
                      <Lock size={12} /> Password
                    </label>
                    <Input
                      className={inputClassName}
                      type="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={primaryButtonClass}
                onClick={mode === 'login' ? handleLogin : handleSignup}
                disabled={isLoading}
              >
                {isLoading ? 'Please wait…' : mode === 'login' ? 'Authenticate' : 'Create Account'}
                {!isLoading && <ArrowRight size={15} strokeWidth={2.5} />}
              </button>

              {mode === 'login' && (
                <div className="text-right -mt-1">
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                    onClick={() => setMode('forgotPassword')}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {googleBackendEnabled === null ? (
                <p className="text-sm text-center text-muted-foreground">Checking sign-in options…</p>
              ) : authPublicFetchFailed && !googleClientId ? (
                <p className="text-sm text-center text-amber-400/90 leading-relaxed">
                  Could not load sign-in options (request to <span className="font-mono text-xs break-all">{API_BASE_URL}/auth/config</span> failed). Start the API on port <span className="font-mono text-xs">8000</span>, or remove/empty <span className="font-mono text-xs">VITE_API_URL</span> and <span className="font-mono text-xs">VITE_API_BASE_URL</span> in root <span className="font-mono text-xs">.env</span> so the app uses the Vite dev proxy. To show Google Sign-In even when this check fails, set <span className="font-mono text-xs">VITE_GOOGLE_CLIENT_ID</span> and restart Vite.
                </p>
              ) : googleButtonAllowed ? (
                <div className="space-y-3">
                  {authPublicFetchFailed && bootstrapGoogleClientId ? (
                    <p className="text-xs text-center text-amber-400/85 leading-snug">
                      Server config request failed — using your local Web client ID. Google sign-in still needs the API at{' '}
                      <span className="font-mono">{API_BASE_URL}</span>; start the backend or fix the URL.
                    </p>
                  ) : null}
                  {!authPublicFetchFailed && !googleBackendEnabled && bootstrapGoogleClientId ? (
                    <p className="text-xs text-center text-amber-400/85 leading-snug">
                      The API reports Google login disabled — add <span className="font-mono">GOOGLE_OAUTH_CLIENT_ID</span> to{' '}
                      <span className="font-mono">backend/.env</span> (same Web client ID as here) and restart the backend, or sign-in will fail.
                    </p>
                  ) : null}
                  <p className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-[0.2em]">Or federate</p>
                  <div className="w-full flex justify-center" ref={googleButtonHostRef}>
                    <div ref={googleButtonRef} />
                  </div>
                </div>
              ) : googleBackendEnabled && !googleClientId ? (
                <p className="text-sm text-center text-muted-foreground leading-relaxed">
                  Google login is enabled on the server, but the API did not return a client id. Check <span className="font-mono text-xs">GOOGLE_OAUTH_CLIENT_ID</span> in <span className="font-mono text-xs">backend/.env</span> and restart the backend, or set <span className="font-mono text-xs">VITE_GOOGLE_CLIENT_ID</span> and restart Vite.
                </p>
              ) : (
                <p className="text-sm text-center text-muted-foreground leading-relaxed">
                  Google login is disabled. Set <span className="font-mono text-xs">VITE_GOOGLE_CLIENT_ID</span> and <span className="font-mono text-xs">GOOGLE_OAUTH_CLIENT_ID</span> to enable it.
                </p>
              )}

              {mode === 'login' && (
                <div className="pt-0 text-sm text-center text-muted-foreground">
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                      onClick={() => setMode('signup')}
                    >
                      Register
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
