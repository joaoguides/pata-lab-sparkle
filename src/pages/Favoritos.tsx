import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { track } from "@/lib/analytics";

interface FavoriteProduct {
  id: string;
  name: string;
  slug: string;
  images: any;
  brand: string;
  variants: {
    id: string;
    name: string;
    price: number;
    compare_at_price: number | null;
    stock: number;
  }[];
}

export default function Favoritos() {
  const { session } = useSession();
  const { addItem } = useCart();
  const { toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user?.id) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const loadFavorites = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          products (
            id,
            name,
            slug,
            images,
            brand,
            variants (
              id,
              name,
              price,
              compare_at_price,
              stock
            )
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const favoriteProducts = data?.map(item => item.products).filter(Boolean) || [];
      setProducts(favoriteProducts as FavoriteProduct[]);

    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedProducts.size === 0) return;
    
    const productIds = Array.from(selectedProducts);
    for (const productId of productIds) {
      await toggleFavorite(productId);
    }
    
    setProducts(products.filter(p => !selectedProducts.has(p.id)));
    setSelectedProducts(new Set());
    
    track("wishlist_bulk_remove", { count: productIds.length });
    toast({
      title: "Produtos removidos",
      description: `${productIds.length} ${productIds.length === 1 ? 'produto removido' : 'produtos removidos'} da lista de desejos.`
    });
  };

  const handleBulkAddToCart = () => {
    let addedCount = 0;
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    
    for (const product of selectedProductsList) {
      if (product.variants.length === 1) {
        addItem(product.id, 1);
        addedCount++;
      }
    }
    
    if (addedCount > 0) {
      track("wishlist_bulk_add", { count: addedCount });
      toast({
        title: "Produtos adicionados",
        description: `${addedCount} ${addedCount === 1 ? 'produto adicionado' : 'produtos adicionados'} ao carrinho.`
      });
    }
    
    if (addedCount < selectedProducts.size) {
      toast({
        title: "Alguns produtos não foram adicionados",
        description: "Produtos com múltiplas variações precisam ser adicionados na página do produto.",
        variant: "destructive"
      });
    }
    
    setSelectedProducts(new Set());
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <EmptyState 
            type="favorites"
            title="Entre na sua conta"
            description="Faça login para ver sua lista de desejos"
            actionText="Fazer login"
            actionHref="/entrar"
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Meus Favoritos - Pata Lab</title>
        <meta name="description" content="Seus produtos favoritos salvos na Pata Lab. Revise e adicione ao carrinho quando quiser." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold">Meus Favoritos</h1>
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? 'produto salvo' : 'produtos salvos'}
              </p>
            </div>
          </div>
          
          {products.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedProducts.size === products.length && products.length > 0}
                  onCheckedChange={selectAllProducts}
                />
                <span className="text-sm">Selecionar todos</span>
              </div>
              
              {selectedProducts.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkAddToCart}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Adicionar ao carrinho ({selectedProducts.size})
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkRemove}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover ({selectedProducts.size})
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const minVariant = product.variants?.reduce((min, variant) =>
                variant.price < min.price ? variant : min
              ) || product.variants?.[0];

              if (!minVariant) return null;

              const hasDiscount = minVariant.compare_at_price && minVariant.compare_at_price > minVariant.price;
              const discount = hasDiscount 
                ? Math.round(((minVariant.compare_at_price - minVariant.price) / minVariant.compare_at_price) * 100)
                : undefined;

              return (
                <div key={product.id} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox 
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      className="bg-background border-border"
                    />
                  </div>
                  
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={minVariant.price}
                    compareAtPrice={minVariant.compare_at_price || undefined}
                    image={Array.isArray(product.images) ? product.images[0] : "/placeholder.svg"}
                    brand={product.brand}
                    inStock={minVariant.stock > 0}
                    discount={discount}
                    variants={product.variants}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            type="favorites"
            title="Sua lista está vazia"
            description="Adicione produtos à sua lista de desejos para vê-los aqui"
            actionText="Explorar produtos"
            actionHref="/"
          />
        )}
      </main>

      <Footer />
    </div>
  );
}