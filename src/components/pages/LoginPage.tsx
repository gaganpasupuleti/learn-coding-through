import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

import { LoginBootPortal } from '@/components/auth/login-motion/LoginBootPortal'
import {
  LOGIN_FORGOT,
  LOGIN_GLASS_CARD,
  LOGIN_GOOGLE_BUTTON_WELL,
  LOGIN_GOOGLE_FRAME,
  LOGIN_INPUT,
  LOGIN_INPUT_SECONDARY,
  LOGIN_LABEL_SECONDARY,
  LOGIN_MUTED,
  LOGIN_PRIMARY_BTN,
  LOGIN_SECONDARY_BTN,
} from '@/components/auth/login-motion/loginTheme'
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
  const [helpOpen, setHelpOpen] = useState(false)
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

  const serverGoogleClientId = useMemo(
    () => (authPublic?.google_client_id ?? '').trim(),
    [authPublic],
  )

  // Always prefer the backend client id when available — that is what token verification uses.
  const googleClientId = useMemo(
    () => serverGoogleClientId || bootstrapGoogleClientId,
    [serverGoogleClientId, bootstrapGoogleClientId],
  )

  const googleClientIdMismatch =
    !!serverGoogleClientId &&
    !!bootstrapGoogleClientId &&
    serverGoogleClientId !== bootstrapGoogleClientId

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
        theme: 'outline',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'continue_with',
        shape: 'rectangular',
        width: Math.max(220, (googleButtonHostRef.current?.clientWidth ?? 320) - 32),
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

  const inputClassName = `${LOGIN_INPUT} ${LOGIN_INPUT_SECONDARY}`
  const primaryButtonClass = LOGIN_PRIMARY_BTN
  const secondaryButtonClass = LOGIN_SECONDARY_BTN
  const labelClass = LOGIN_LABEL_SECONDARY
  const mutedLinkClass = LOGIN_MUTED
  const forgotLinkClass = LOGIN_FORGOT
  const authCardClass = LOGIN_GLASS_CARD

  const renderGoogleSection = () => {
    if (mode !== 'login' && mode !== 'signup') return null

    if (googleBackendEnabled === null) {
      return <p className="text-center text-sm text-[#FAF3E0]/55">Checking sign-in options…</p>
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
        <div className={`${LOGIN_GOOGLE_FRAME} space-y-3`}>
          {authPublicFetchFailed && bootstrapGoogleClientId ? (
            <p className="text-center text-xs leading-snug text-amber-400/90">
              Server config request failed — using your local Web client ID. Google sign-in still needs the API at{' '}
              <span className="font-mono">{API_BASE_URL}</span>; start the backend or fix the URL.
            </p>
          ) : null}
          {!authPublicFetchFailed && !googleBackendEnabled && bootstrapGoogleClientId ? (
            <p className="text-center text-xs leading-snug text-amber-400/90">
              The API reports Google login disabled — add{' '}
              <span className="font-mono">GOOGLE_OAUTH_CLIENT_ID</span> to{' '}
              <span className="font-mono">backend/.env</span> (same Web client ID as the frontend) and restart the
              backend, or sign-in will fail.
            </p>
          ) : null}
          {googleClientIdMismatch ? (
            <p className="text-center text-xs leading-snug text-amber-400/90">
              Frontend and backend Google client IDs differ. Restart Vite after updating{' '}
              <span className="font-mono">VITE_GOOGLE_CLIENT_ID</span>, or set it to match{' '}
              <span className="font-mono">GOOGLE_OAUTH_CLIENT_ID</span> in{' '}
              <span className="font-mono">backend/.env</span> — mismatched IDs cause &quot;Invalid Google token&quot;.
            </p>
          ) : null}
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#22FF88]/70">
            Continue with Google
          </p>
          <div className={LOGIN_GOOGLE_BUTTON_WELL} ref={googleButtonHostRef}>
            <div ref={attachGoogleButtonRef} className="w-full [&>div]:!w-full" />
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
    <>
      <LoginBootPortal>
        <div className={authCardClass}>
            {mode === 'forgotPassword' ? (
              <div className="space-y-6" onKeyDown={handleKeyDown}>
                <div className="login-card-stagger">
                  <h2 className="text-2xl font-bold text-[#FAF3E0]">Reset password</h2>
                  <p className="mt-2 text-sm text-[#FAF3E0]/60">
                    Enter your email to request a reset, then set a new password with your token.
                  </p>
                </div>

                <div className="login-card-stagger space-y-5">
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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

                <div className="login-card-stagger grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button type="button" className={secondaryButtonClass} onClick={handleRequestPasswordReset} disabled={isLoading}>
                    {isLoading ? 'Please wait…' : 'Send reset link'}
                  </button>
                  <button type="button" className={primaryButtonClass} onClick={handleResetPassword} disabled={isLoading}>
                    {isLoading ? 'Please wait…' : 'Reset password'}
                  </button>
                </div>

                <p className="login-card-stagger text-center text-sm text-[#FAF3E0]/55">
                  Remembered your password?{' '}
                  <button type="button" className={mutedLinkClass} onClick={() => setMode('login')}>
                    Sign in
                  </button>
                </p>
              </div>
            ) : pendingApproval ? (
              <div className="space-y-6 text-center">
                <div className="login-card-stagger mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22FF88]/15 text-[#22FF88]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z" />
                  </svg>
                </div>
                <div className="login-card-stagger">
                  <h2 className="text-2xl font-bold text-[#FAF3E0]">Registration submitted</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#FAF3E0]/60">
                    Your account is{' '}
                    <span className="font-semibold text-amber-400">pending admin approval</span>. You
                    can sign in once an admin approves your registration.
                  </p>
                </div>
                <button
                  type="button"
                  className={`login-card-stagger ${secondaryButtonClass}`}
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
                <div className="login-card-stagger">
                  <h2 className="text-2xl font-bold text-[#FAF3E0]">
                    {mode === 'login' ? 'Sign in' : 'Create account'}
                  </h2>
                  <p className="mt-2 text-sm text-[#FAF3E0]/60">
                    {mode === 'login'
                      ? 'Welcome back. Continue with Google or use your email credentials.'
                      : 'New accounts require admin approval before you can sign in.'}
                  </p>
                </div>

                <div className="login-card-stagger">{renderGoogleSection()}</div>

                {(mode === 'login' || mode === 'signup') && googleButtonAllowed ? (
                  <div className="login-card-stagger flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-[#FAF3E0]/35 before:h-px before:flex-1 before:bg-[#22FF88]/12 before:content-[''] after:h-px after:flex-1 after:bg-[#22FF88]/12 after:content-['']">
                    Or use email
                  </div>
                ) : null}

                <div className="login-card-stagger space-y-4 rounded-xl border border-[#22FF88]/8 bg-[#050807]/35 p-4">
                  {mode === 'signup' && (
                    <div className="space-y-2">
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

                  <div className="space-y-2">
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor="password" className={labelClass}>
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          className={forgotLinkClass}
                          onClick={() => setMode('forgotPassword')}
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
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

                {mode === 'login' && (
                  <label className="login-card-stagger flex cursor-pointer items-center gap-2.5 text-sm text-[#FAF3E0]/65">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={(v) => handleRememberChange(v === true)}
                      disabled={isLoading}
                    />
                    Remember me
                  </label>
                )}

                <button
                  type="button"
                  className={`login-card-stagger ${primaryButtonClass}`}
                  onClick={mode === 'login' ? handleLogin : handleSignup}
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait…' : mode === 'login' ? 'Sign In with Email' : 'Create Account'}
                </button>

                {mode === 'login' ? (
                  <p className="login-card-stagger text-center text-sm text-[#FAF3E0]/55">
                    Don&apos;t have an account yet?{' '}
                    <button type="button" className={mutedLinkClass} onClick={() => setMode('signup')}>
                      Register
                    </button>
                  </p>
                ) : (
                  <p className="login-card-stagger text-center text-sm text-[#FAF3E0]/55">
                    Already have an account?{' '}
                    <button type="button" className={mutedLinkClass} onClick={() => setMode('login')}>
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            )}
        </div>

        <p className="login-card-stagger w-full text-center text-sm text-[#FAF3E0]/55">
            <button
              type="button"
              className="text-[#FAF3E0]/55 underline-offset-2 hover:text-[#FAF3E0]/80 hover:underline"
              onClick={() => setHelpOpen(true)}
            >
              Need help signing in?
            </button>
            {authPublicFetchFailed && !googleClientId && (
              <span className="mt-1 block text-amber-400">
                Sign-in service unavailable. Please try again in a moment.
              </span>
            )}
          </p>
      </LoginBootPortal>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
            <DialogContent className="max-w-md rounded-2xl border-slate-100 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900">Sign-in help</DialogTitle>
                <DialogDescription>
                  Quick answers for common login issues. Everything stays on this page — no external links.
                </DialogDescription>
              </DialogHeader>
              <ul className="space-y-4 text-sm text-slate-600">
                <li>
                  <p className="font-medium text-slate-900">Forgot your password?</p>
                  <p className="mt-1">
                    Use <span className="font-medium">Forgot Password?</span> above the password field to request a
                    reset link, then set a new password with the token you receive.
                  </p>
                </li>
                <li>
                  <p className="font-medium text-slate-900">Just registered?</p>
                  <p className="mt-1">
                    New student accounts may need admin approval before the first sign-in. If you see a pending
                    approval message, wait for your program admin to approve your registration.
                  </p>
                </li>
                <li>
                  <p className="font-medium text-slate-900">Google sign-in not working?</p>
                  <p className="mt-1">
                    Use the same Google account email you registered with. If the button does not appear or sign-in
                    fails, try email and password instead, or contact your instructor or program admin.
                  </p>
                </li>
                <li>
                  <p className="font-medium text-slate-900">Still stuck?</p>
                  <p className="mt-1">
                    Contact your course administrator or instructor with the email address you used to register.
                  </p>
                </li>
              </ul>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => {
                    setHelpOpen(false)
                    setMode('forgotPassword')
                  }}
                >
                  Reset password
                </button>
                <button type="button" className={primaryButtonClass} onClick={() => setHelpOpen(false)}>
                  Got it
                </button>
              </div>
            </DialogContent>
          </Dialog>
    </>
  )
}
