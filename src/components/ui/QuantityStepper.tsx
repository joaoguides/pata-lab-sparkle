export default function QuantityStepper({
  value, 
  onChange
}: {
  value: number; 
  onChange: (n: number) => void
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-line overflow-hidden">
      <button 
        type="button" 
        className="px-3 py-1" 
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        -
      </button>
      <span className="px-3 py-1 min-w-8 text-center">{value}</span>
      <button 
        type="button" 
        className="px-3 py-1" 
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}