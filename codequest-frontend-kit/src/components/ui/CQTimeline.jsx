const toneMap = {
  yellow: 'bg-card-yellow/50',
  pink: 'bg-card-pink/50',
  sage: 'bg-card-sage/50',
  blue: 'bg-card-blue/50',
  lavender: 'bg-card-lavender/50',
};

export default function CQTimeline({ items }) {
  return (
    <div className="cq-timeline relative pl-12 space-y-2">
      {items.map((item) => (
        <div key={item.time} className="relative">
          <span
            className={`absolute -left-[51px] w-[35px] text-[10px] font-semibold text-slate text-right ${item.timeClass || 'top-1.5'}`}
          >
            {item.time}
          </span>
          <div
            className={`ml-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate/15 ${toneMap[item.tone] || toneMap.yellow}`}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
