import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Input from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, ChevronDown, ChevronRight } from "lucide-react";
import { track } from "@/lib/analytics";

interface CollapsibleFilterSidebarProps {
  species: string;
  minPrice: number | string;
  maxPrice: number | string;
  inStock: boolean;
  onFiltersChange: (filters: Record<string, string | null>) => void;
  pageKey?: string; // "categoria" or "buscar"
}

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function CollapsibleFilterSidebar({
  species,
  minPrice,
  maxPrice,
  inStock,
  onFiltersChange,
  pageKey = "catalog",
}: CollapsibleFilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    species: true,
    price: true,
    stock: true,
  });

  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`filters:openState:${pageKey}`);
    if (savedState) {
      try {
        setOpenSections(JSON.parse(savedState));
      } catch (error) {
        console.error("Error loading filter state:", error);
      }
    }
  }, [pageKey]);

  // Save state to localStorage
  const saveState = (newState: typeof openSections) => {
    setOpenSections(newState);
    localStorage.setItem(`filters:openState:${pageKey}`, JSON.stringify(newState));
  };

  // Debounced price update
  const debouncedPriceUpdate = useCallback(
    debounce((min: string, max: string) => {
      onFiltersChange({ min: min || null, max: max || null });
      
      // Analytics tracking
      track("catalog_filter_change", {
        species: species !== "both" ? species : null,
        min: min || null,
        max: max || null,
        inStock,
      });
    }, 400),
    [onFiltersChange, species, inStock]
  );

  // Update local price state and debounced call
  const handlePriceChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setLocalMinPrice(value);
      debouncedPriceUpdate(value, localMaxPrice.toString());
    } else {
      setLocalMaxPrice(value);
      debouncedPriceUpdate(localMinPrice.toString(), value);
    }
  };

  // Sync local state with props
  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  const toggleSection = (section: keyof typeof openSections) => {
    const newState = { ...openSections, [section]: !openSections[section] };
    saveState(newState);
  };

  const handleSpeciesChange = (newSpecies: string) => {
    onFiltersChange({ species: newSpecies === "both" ? null : newSpecies });
    
    // Analytics tracking
    track("catalog_filter_change", {
      species: newSpecies !== "both" ? newSpecies : null,
      min: minPrice || null,
      max: maxPrice || null,
      inStock,
    });
  };

  const handleStockChange = (checked: boolean) => {
    onFiltersChange({ inStock: checked ? "true" : null });
    
    // Analytics tracking
    track("catalog_filter_change", {
      species: species !== "both" ? species : null,
      min: minPrice || null,
      max: maxPrice || null,
      inStock: checked,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Species Filter */}
        <Collapsible open={openSections.species} onOpenChange={() => toggleSection("species")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors">
            <Label className="text-sm font-medium">Espécie</Label>
            {openSections.species ? (
              <ChevronDown className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {[
              { value: "both", label: "Todos" },
              { value: "dog", label: "Cães" },
              { value: "cat", label: "Gatos" }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`species-${option.value}`}
                  checked={species === option.value}
                  onCheckedChange={() => handleSpeciesChange(option.value)}
                />
                <Label 
                  htmlFor={`species-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Price Range */}
        <Collapsible open={openSections.price} onOpenChange={() => toggleSection("price")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors">
            <Label className="text-sm font-medium">Preço (R$)</Label>
            {openSections.price ? (
              <ChevronDown className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                className="text-sm"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Stock Filter */}
        <Collapsible open={openSections.stock} onOpenChange={() => toggleSection("stock")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors">
            <Label className="text-sm font-medium">Disponibilidade</Label>
            {openSections.stock ? (
              <ChevronDown className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={inStock}
                onCheckedChange={handleStockChange}
              />
              <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
                Apenas em estoque
              </Label>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}