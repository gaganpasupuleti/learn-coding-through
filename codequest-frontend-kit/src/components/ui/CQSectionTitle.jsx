export default function CQSectionTitle({ children, className = '' }) {
  return <h2 className={`text-sm font-semibold mb-3 ${className}`}>{children}</h2>;
}
