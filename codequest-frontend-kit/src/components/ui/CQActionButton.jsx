const variants = {
  primary: 'bg-cta text-cream hover:bg-cta-hover',
  navy: 'bg-navy text-cream hover:bg-navy-elevated',
  ghost: 'border border-slate/20 bg-cream text-slate hover:bg-cream-soft hover:text-charcoal',
};

export default function CQActionButton({ variant = 'primary', className = '', children, disabled, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
