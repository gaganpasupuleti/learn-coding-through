const DEFAULT_HEIGHTS = [35, 50, 42, 58, 68, 55, 72];

export default function CQWeeklyChart({ heights = DEFAULT_HEIGHTS }) {
  return (
    <div className="my-2 flex h-8 items-end gap-0.5">
      {heights.map((height, index) => (
        <div key={index} className="cq-chart-bar" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}
