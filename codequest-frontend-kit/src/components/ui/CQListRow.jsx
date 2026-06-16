const badgeStyles = {
  default: 'cq-badge-pending',
  pending: 'cq-badge-pending',
  soon: 'cq-badge-soon',
};

export default function CQListRow({
  dotColor = 'bg-gold',
  title,
  meta,
  badge,
  badgeVariant = 'default',
  action,
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-full border border-slate/20 bg-cream px-3 py-2.5 text-sm">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        {meta && <p className="truncate text-[13px] text-slate">{meta}</p>}
      </div>
      {badge && (
        <span className={`shrink-0 ${badgeStyles[badgeVariant] || badgeStyles.default}`}>{badge}</span>
      )}
      {action}
    </div>
  );
}
