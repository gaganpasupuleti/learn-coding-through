const toneMap = {
  yellow: 'bg-card-yellow',
  pink: 'bg-card-pink',
  sage: 'bg-card-sage',
  blue: 'bg-card-blue',
  lavender: 'bg-card-lavender',
  cream: 'bg-cream-soft',
};

export default function CQCard({ tone = 'cream', className = '', children }) {
  return (
    <article
      className={`rounded-card border border-slate/15 p-4 transition-shadow hover:shadow-md md:p-[18px] ${toneMap[tone] || toneMap.cream} ${className}`}
    >
      {children}
    </article>
  );
}
