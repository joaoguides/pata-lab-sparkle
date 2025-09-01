import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";

interface FilterChipsProps {
  species?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  inStock?: boolean;
  sort?: string;
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
}

export default function FilterChips({
  species,
  minPrice,
  maxPrice,
  inStock,
  sort,
  onClearFilter,
  onClearAll,
}: FilterChipsProps) {
  const hasFilters = species !== "both" || minPrice || maxPrice || inStock || (sort && sort !== "popular");

  if (!hasFilters) return null;

  const formatPrice = (value: number | string) => {
    return `R$ ${value}`;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b">
      {/* Clear All Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onClearAll}
        className="flex items-center gap-2"
      >
        <RotateCcw className="h-3 w-3" />
        Limpar tudo
      </Button>

      {/* Species Filter */}
      {species && species !== "both" && (
        <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
          <span>Espécie: {species === "dog" ? "Cães" : "Gatos"}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onClearFilter("species")}
            aria-label="Remover filtro de espécie"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Price Range Filter */}
      {(minPrice || maxPrice) && (
        <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
          <span>
            Preço: {minPrice ? formatPrice(minPrice) : "0"} - {maxPrice ? formatPrice(maxPrice) : "∞"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => {
              onClearFilter("min");
              onClearFilter("max");
            }}
            aria-label="Remover filtro de preço"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Stock Filter */}
      {inStock && (
        <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
          <span>Em estoque</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onClearFilter("inStock")}
            aria-label="Remover filtro de estoque"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Sort Filter */}
      {sort && sort !== "popular" && (
        <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
          <span>
            Ordem: {
              sort === "recent" ? "Recentes" :
              sort === "price_asc" ? "Menor preço" :
              sort === "price_desc" ? "Maior preço" : sort
            }
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onClearFilter("sort")}
            aria-label="Remover filtro de ordenação"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  );
}