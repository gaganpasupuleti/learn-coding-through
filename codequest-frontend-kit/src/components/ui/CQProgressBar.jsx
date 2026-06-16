export default function CQProgressBar({ label, value, className = '' }) {
  return (
    <div className={`flex items-center gap-2 text-[13px] font-medium ${className}`}>
      {label && <span className="w-12 shrink-0">{label}</span>}
      <div className="cq-mini-bar flex-1">
        <div className="cq-mini-bar-fill" style={{ width: `${value}%` }} />
      </div>
      {!label && <span className="shrink-0">{value}%</span>}
    </div>
  );
}
