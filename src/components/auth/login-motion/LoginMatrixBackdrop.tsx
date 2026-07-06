/** ponytail: decorative login backdrop — subtle grid, not noisy. */
export function LoginMatrixBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_25%_20%,#0A1020_0%,#050807_50%,#030504_100%)]" />
      <svg className="login-backdrop-grid absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cq-login-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#22FF88" strokeWidth="0.5" opacity="0.45" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cq-login-grid)" />
      </svg>
      <div className="absolute inset-y-0 right-[45%] hidden w-px bg-gradient-to-b from-transparent via-[#22FF88]/12 to-transparent lg:block" />
    </div>
  )
}
