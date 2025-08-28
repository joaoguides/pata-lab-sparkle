import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

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
  const favorited = isFavorited(id);

  return (
    <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Link to={slug ? `/produto/${slug}` : "#"}>
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
            />
          </Link>
          
          {/* Discount Badge */}
          {discount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2"
            >
              -{discount}%
            </Badge>
          )}
          
          {/* Favorite Button */}
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 p-0 backdrop-blur-sm hover:bg-background/90",
              favorited && "text-red-500 hover:text-red-600"
            )}
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(id);
            }}
          >
            <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
            <span className="sr-only">Adicionar aos favoritos</span>
          </Button>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Brand */}
          {brand && (
            <Badge variant="secondary" className="text-xs">
              {brand}
            </Badge>
          )}
          
          {/* Product Name */}
          <Link to={slug ? `/produto/${slug}` : "#"}>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({reviewCount})
              </span>
            )}
          </div>
          
          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  R$ {price.toFixed(2)}
                </span>
                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-xs text-muted-foreground line-through">
                    R$ {compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {!inStock && (
                <span className="text-xs text-destructive font-medium">
                  Fora de estoque
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              disabled={!inStock}
              className="rounded-full"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Adicionar ao carrinho</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}