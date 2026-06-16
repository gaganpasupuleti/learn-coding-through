export default function CQCalendarMini({ monthLabel = 'May 2024', highlightDay = 14, hideHeader = false }) {
  const days = [
    '', '', '',
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];

  return (
    <>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Study Calendar</h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-card-pink/50 border border-slate/15 text-slate">
            {monthLabel}
          </span>
        </div>
      )}
      <div className="grid grid-cols-7 gap-px text-center text-[11px] mb-3">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="font-semibold text-slate py-0.5">
            {d}
          </span>
        ))}
        {days.map((day, i) =>
          day === '' ? (
            <span key={`empty-${i}`} />
          ) : (
            <span
              key={day}
              className={`py-1 ${day === highlightDay ? 'font-semibold bg-navy text-cream rounded-full' : 'text-slate'}`}
            >
              {day}
            </span>
          ),
        )}
      </div>
    </>
  );
}
