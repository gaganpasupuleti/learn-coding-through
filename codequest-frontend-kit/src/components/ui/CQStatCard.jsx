import CQCard from './CQCard';

export default function CQStatCard({
  label,
  value,
  detail,
  detailHighlight = false,
  tone = 'yellow',
  footer,
}) {
  return (
    <CQCard tone={tone} className="flex h-full min-h-[145px] flex-col">
      <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-charcoal/75">{label}</h3>
      {value != null && value !== '' && (
        <p className="text-xl font-bold tracking-tight">{value}</p>
      )}
      {detail && (
        <p className={`mt-0.5 text-[13px] ${detailHighlight ? 'font-semibold text-progress' : 'text-slate'}`}>
          {detail}
        </p>
      )}
      {footer && <div className="mt-auto pt-3">{footer}</div>}
    </CQCard>
  );
}
