export function StatusBadge({
  text,
  variant = 'default',
}: {
  text: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const cls: Record<string, string> = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return <span className={`text-xs font-semibold rounded-md px-2 py-0.5 ${cls[variant]}`}>{text}</span>
}
