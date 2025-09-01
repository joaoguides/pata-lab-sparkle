import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RatingStars from "@/components/ui/RatingStars";
import { Heart, ShoppingCart, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/context/CartContext";
import { cn, formatBRL } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  inStock?: boolean;
  discount?: number;
  slug?: string;
  variants?: Array<{ id: string; name: string; price: number; stock: number }>;
}

export default function ProductCard({
  id,
  name,
  price,
  compareAtPrice,
  image,
  rating = 0,
  reviewCount = 0,
  brand,
  inStock = true,
  discount,
  slug,
  variants,
}: ProductCardProps) {
  const { toggleFavorite, isFavorited } = useFavorites();
  const { addItem } = useCart();
  const { toast } = useToast();
  const isProductFavorite = isFavorited(id);
  const [justAdded, setJustAdded] = useState(false);

  const discountPercent = compareAtPrice && compareAtPrice > price 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  // Check if product has only one variant for Quick Add
  const hasOnlyOneVariant = variants && variants.length === 1;

  const handleAddToCart = () => {
    addItem(id, 1);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inStock) return;
    
    // Set just added state for visual feedback
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    
    // Show toast notification
    toast({
      title: "Produto adicionado!",
      description: "Abra o carrinho para finalizar sua compra.",
    });
    
    // Track analytics
    track("quick_add", { product_id: id });
  };

  return (
    <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={image || "/placeholder.svg"} 
            alt={name}
            className="aspect-square w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discountPercent && (
            <div className="absolute top-2 left-2">
              <Badge variant="sale">-{discountPercent}%</Badge>
            </div>
          )}
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 p-0 backdrop-blur-sm hover:bg-white/90",
              isProductFavorite && "text-red-500 hover:text-red-600"
            )}
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(id);
            }}
          >
            <Heart className={cn("h-4 w-4", isProductFavorite && "fill-current")} />
          </Button>

          {/* Quick Add Button - Only for single variant products */}
          {hasOnlyOneVariant && inStock && (
            <Button
              variant="primary"
              size="icon"
              className={cn(
                "absolute bottom-2 right-2 h-8 w-8 rounded-full shadow-md transition-all duration-200",
                "opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0",
                justAdded && "bg-green-600 hover:bg-green-700"
              )}
              onClick={handleQuickAdd}
              aria-label="Adicionar rapidamente"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          {brand && (
            <Badge variant="neutral">{brand}</Badge>
          )}
          
          <Link to={slug ? `/produto/${slug}` : "#"}>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <RatingStars value={rating} />
            {reviewCount > 0 && <span>({reviewCount})</span>}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-lg font-bold text-primary">
                {formatBRL(price)}
              </p>
              {compareAtPrice && compareAtPrice > price && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatBRL(compareAtPrice)}
                </p>
              )}
              {!inStock && (
                <p className="text-sm text-red-600">Fora de estoque</p>
              )}
            </div>
            
            <Button
              variant="primary"
              onClick={hasOnlyOneVariant ? handleAddToCart : undefined}
              disabled={!inStock}
              className="min-w-[100px]"
              asChild={!hasOnlyOneVariant}
            >
              {hasOnlyOneVariant ? (
                <>
                  <ShoppingCart size={16} />
                  Adicionar
                </>
              ) : (
                <Link to={slug ? `/produto/${slug}` : "#"}>
                  Ver detalhes
                </Link>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}