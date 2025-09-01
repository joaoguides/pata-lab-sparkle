import { Star } from "lucide-react";

export default function RatingStars({ value = 0 }: { value?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Avaliação ${value} de 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star 
          key={i} 
          size={16} 
          className={
            i <= Math.round(value) 
              ? "fill-yellow-400 stroke-yellow-400" 
              : "stroke-slate-300"
          } 
        />
      ))}
    </div>
  );
}