import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Code2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

import { AuthPromoPanel } from '@/components/auth/AuthPromoPanel'
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
import { cn } from '@/lib/utils'

interface LoginPageProps {
  onAuthenticated: (user: AuthUser) => void
}

type AuthMode = 'login' | 'signup' | 'forgotPassword'

type GoogleCredentialResponse = {
  credential?: string
}

const REMEMBER_ME_KEY = 'codequest-remember-me'
const REMEMBER_EMAIL_KEY = 'codequest-remember-email'

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

function readRememberedEmail(): { email: string; remember: boolean } {
  try {
    const remember = localStorage.getItem(REMEMBER_ME_KEY) === 'true'
    const email = localStorage.getItem(REMEMBER_EMAIL_KEY) ?? ''
    return { email: remember ? email : '', remember }
  } catch {
    return { email: '', remember: false }
  }
}

function persistRememberMe(remember: boolean, email: string) {
  try {
    if (remember && email.trim()) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true')
      localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim())
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY)
      localStorage.removeItem(REMEMBER_EMAIL_KEY)
    }
  } catch {
    /* ignore */
  }
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const remembered = useMemo(() => readRememberedEmail(), [])
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState(remembered.email)
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(remembered.remember)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const googleButtonHostRef = useRef<HTMLDivElement | null>(null)
  const [googleButtonMount, setGoogleButtonMount] = useState<HTMLDivElement | null>(null)

  const attachGoogleButtonRef = useCallback((node: HTMLDivElement | null) => {
    googleButtonRef.current = node
    setGoogleButtonMount(node)
  }, [])

  const runtimeGoogleClientId =
    typeof window !== 'undefined'
      ? (window.__RUNTIME_CONFIG__?.VITE_GOOGLE_CLIENT_ID ?? '').trim()
      : ''

  const bootstrapGoogleClientId = useMemo(
    () => (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim() || runtimeGoogleClientId,
    [runtimeGoogleClientId],
  )

  const [authPublic, setAuthPublic] = useState<AuthPublicConfig | null>(null)
  const [authPublicReady, setAuthPublicReady] = useState(false)
  const [authPublicFetchFailed, setAuthPublicFetchFailed] = useState(false)

  const googleClientId = useMemo(
    () => bootstrapGoogleClientId || (authPublic?.google_client_id ?? '').trim(),
    [bootstrapGoogleClientId, authPublic],
  )

  const googleBackendEnabled =
    !authPublicReady ? null : authPublicFetchFailed ? false : (authPublic?.google_auth_enabled ?? false)

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
      persistRememberMe(rememberMe, email)
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
      if (
        msg.toLowerCase().includes('pending admin approval') ||
        msg.toLowerCase().includes('pending approval')
      ) {
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
    if ((mode !== 'login' && mode !== 'signup') || !googleClientId || !googleButtonAllowed || !googleButtonMount) {
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
            if (
              msg.toLowerCase().includes('pending admin approval') ||
              msg.toLowerCase().includes('pending approval')
            ) {
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
        text: mode === 'signup' ? 'signup_with' : 'continue_with',
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
  }, [mode, googleClientId, googleButtonAllowed, googleButtonMount, email, fullName])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return
    if (mode === 'login') handleLogin()
    else if (mode === 'signup') handleSignup()
    else if (mode === 'forgotPassword') {
      if (resetToken.trim() && newPassword.trim()) handleResetPassword()
      else handleRequestPasswordReset()
    }
  }

  const handleRememberChange = (checked: boolean) => {
    setRememberMe(checked)
    persistRememberMe(checked, email)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (rememberMe) persistRememberMe(true, value)
  }

  const inputClassName =
    'h-11 rounded-md border-slate-200 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20'

  const primaryButtonClass =
    'w-full rounded-md bg-[#4A69E2] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3d58c4] disabled:opacity-60'

  const secondaryButtonClass =
    'w-full rounded-md border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60'

  const labelClass = 'text-sm font-medium text-slate-700'

  const linkClass = 'font-semibold text-[#4A69E2] hover:text-[#3d58c4] hover:underline'

  const renderGoogleSection = () => {
    if (mode !== 'login' && mode !== 'signup') return null

    if (googleBackendEnabled === null) {
      return <p className="text-center text-sm text-slate-500">Checking sign-in options…</p>
    }

    if (authPublicFetchFailed && !googleClientId) {
      return (
        <p className="text-center text-sm leading-relaxed text-amber-700">
          Could not load sign-in options (request to{' '}
          <span className="font-mono text-xs break-all">{API_BASE_URL}/auth/config</span> failed). Start the API on
          port <span className="font-mono text-xs">8000</span>, or leave{' '}
          <span className="font-mono text-xs">VITE_API_URL</span> empty so the app uses the Vite dev proxy. To show
          Google Sign-In when this check fails, set <span className="font-mono text-xs">VITE_GOOGLE_CLIENT_ID</span>{' '}
          and restart Vite.
        </p>
      )
    }

    if (googleButtonAllowed) {
      return (
        <div className="space-y-3">
          {authPublicFetchFailed && bootstrapGoogleClientId ? (
            <p className="text-center text-xs leading-snug text-amber-700">
              Server config request failed — using your local Web client ID. Google sign-in still needs the API at{' '}
              <span className="font-mono">{API_BASE_URL}</span>; start the backend or fix the URL.
            </p>
          ) : null}
          {!authPublicFetchFailed && !googleBackendEnabled && bootstrapGoogleClientId ? (
            <p className="text-center text-xs leading-snug text-amber-700">
              The API reports Google login disabled — add{' '}
              <span className="font-mono">GOOGLE_OAUTH_CLIENT_ID</span> to{' '}
              <span className="font-mono">backend/.env</span> (same Web client ID as the frontend) and restart the
              backend, or sign-in will fail.
            </p>
          ) : null}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-white px-2 text-slate-400">or continue with</span>
            </div>
          </div>
          <div className="flex w-full justify-center" ref={googleButtonHostRef}>
            <div ref={attachGoogleButtonRef} />
          </div>
        </div>
      )
    }

    if (googleBackendEnabled && !googleClientId) {
      return (
        <p className="text-center text-sm leading-relaxed text-slate-500">
          Google login is enabled on the server, but no client id was returned. Check{' '}
          <span className="font-mono text-xs">GOOGLE_OAUTH_CLIENT_ID</span> in{' '}
          <span className="font-mono text-xs">backend/.env</span> and restart the backend, or set{' '}
          <span className="font-mono text-xs">VITE_GOOGLE_CLIENT_ID</span> and restart Vite.
        </p>
      )
    }

    return (
      <p className="text-center text-sm leading-relaxed text-slate-500">
        Google login is disabled. Set <span className="font-mono text-xs">VITE_GOOGLE_CLIENT_ID</span> and{' '}
        <span className="font-mono text-xs">GOOGLE_OAUTH_CLIENT_ID</span> to enable it.
      </p>
    )
  }

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2" aria-label="Sign in to CodeQuest">
      {/* Left: form panel */}
      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-12 lg:px-16">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Code2 size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CodeQuest</span>
          </div>

          {mode === 'forgotPassword' ? (
            <div className="space-y-6" onKeyDown={handleKeyDown}>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your email to request a reset, then set a new password with your token.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="reset-email" className={labelClass}>
                    Email
                  </label>
                  <Input
                    id="reset-email"
                    className={inputClassName}
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="reset-token" className={labelClass}>
                    Reset token
                  </label>
                  <Input
                    id="reset-token"
                    className={inputClassName}
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    disabled={isLoading}
                    placeholder="Paste token from email"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className={labelClass}>
                    New password
                  </label>
                  <Input
                    id="new-password"
                    className={inputClassName}
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button type="button" className={secondaryButtonClass} onClick={handleRequestPasswordReset} disabled={isLoading}>
                  {isLoading ? 'Please wait…' : 'Send reset link'}
                </button>
                <button type="button" className={primaryButtonClass} onClick={handleResetPassword} disabled={isLoading}>
                  {isLoading ? 'Please wait…' : 'Reset password'}
                </button>
              </div>

              <p className="text-center text-sm text-slate-500">
                Remembered your password?{' '}
                <button type="button" className={linkClass} onClick={() => setMode('login')}>
                  Sign in
                </button>
              </p>
            </div>
          ) : pendingApproval ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Registration submitted</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Your account is{' '}
                  <span className="font-semibold text-amber-600">pending admin approval</span>. You
                  can sign in once an admin approves your registration.
                </p>
              </div>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => {
                  setPendingApproval(false)
                  setMode('login')
                }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <div className="space-y-6" onKeyDown={handleKeyDown}>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                </h1>
                {mode === 'signup' && (
                  <p className="mt-1 text-sm text-slate-500">
                    New accounts require admin approval before you can sign in.
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label htmlFor="full-name" className={labelClass}>
                      Full name
                    </label>
                    <Input
                      id="full-name"
                      className={inputClassName}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <Input
                    id="email"
                    className={inputClassName}
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  <Input
                    id="password"
                    className={inputClassName}
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="button"
                className={primaryButtonClass}
                onClick={mode === 'login' ? handleLogin : handleSignup}
                disabled={isLoading}
              >
                {isLoading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              {mode === 'login' && (
                <div className="flex items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={(v) => handleRememberChange(v === true)}
                      disabled={isLoading}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className={cn('text-sm', linkClass)}
                    onClick={() => setMode('forgotPassword')}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {renderGoogleSection()}

              {mode === 'login' ? (
                <p className="text-center text-sm text-slate-500">
                  Don&apos;t have an account yet?{' '}
                  <button type="button" className={linkClass} onClick={() => setMode('signup')}>
                    Register
                  </button>
                </p>
              ) : (
                <p className="text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <button type="button" className={linkClass} onClick={() => setMode('login')}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
          )}

          <p className="text-center text-xs text-slate-400">
            <a
              href="https://github.com/gaganpasupuleti/learn-coding-through/blob/main/docs/LAUNCH.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 hover:underline"
            >
              Need help signing in?
            </a>
            {authPublicFetchFailed && !googleClientId && (
              <span className="mt-1 block text-amber-600">
                API unavailable at {API_BASE_URL}
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Right: promo carousel (desktop) */}
      <AuthPromoPanel />
    </main>
  )
}
