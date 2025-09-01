interface Variant {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  active?: boolean;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onVariantChange: (variant: Variant) => void;
}

export default function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
}: VariantSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-ink">Variações:</h3>
      <div className="grid grid-cols-1 gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock === 0;
          
          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onVariantChange(variant)}
              disabled={isOutOfStock}
              className={`
                p-3 rounded-xl border-2 text-left transition-all
                ${isSelected 
                  ? "border-brand-blue bg-brand-blue/5" 
                  : "border-line hover:border-muted"
                }
                ${isOutOfStock 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:shadow-soft"
                }
              `}
              aria-label={`Selecionar variação ${variant.name}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-ink">
                  {variant.name}
                </span>
                {isOutOfStock && (
                  <span className="text-sm text-muted bg-soft px-2 py-1 rounded-full">
                    Esgotado
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}