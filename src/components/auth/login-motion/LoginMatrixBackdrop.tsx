/** Dark hero backdrop — matches cinematic landing dark section. */
export function LoginMatrixBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0b1020]">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(220,229,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(220,229,255,0.05) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 42% 36%, rgba(25,68,241,0.34) 0%, rgba(25,68,241,0.1) 42%, transparent 68%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 88% 78%, rgba(25,68,241,0.08) 0%, transparent 54%)',
        }}
      />
    </div>
  )
}
