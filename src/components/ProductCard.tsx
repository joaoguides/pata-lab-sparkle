import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RatingStars from "@/components/ui/RatingStars";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/context/CartContext";
import { cn, formatBRL } from "@/lib/utils";

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
}: ProductCardProps) {
  const { toggleFavorite, isFavorited } = useFavorites();
  const { addItem } = useCart();
  const isProductFavorite = isFavorited(id);

  const discountPercent = compareAtPrice && compareAtPrice > price 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addItem(id, 1);
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
              onClick={handleAddToCart}
              disabled={!inStock}
              className="min-w-[100px]"
            >
              <ShoppingCart size={16} />
              Adicionar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}