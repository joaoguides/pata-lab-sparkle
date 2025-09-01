export function Badge({ 
  children, 
  variant = "sale" 
}: { 
  children: React.ReactNode; 
  variant?: "sale" | "neutral" | "secondary" | "destructive" | "outline" | "default"
}) {
  const base = "badge";
  const variantMap = {
    sale: "badge-sale",
    neutral: "bg-slate-100 text-slate-700",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-red-500 text-white",
    outline: "border border-input",
    default: "bg-primary text-primary-foreground"
  };
  return <span className={`${base} ${variantMap[variant] || variantMap.sale}`}>{children}</span>;
}
