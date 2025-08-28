import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import EmptyState from "@/components/EmptyState";
import { Heart } from "lucide-react";

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
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold">Meus Favoritos</h1>
            <p className="text-muted-foreground">
              {products.length} {products.length === 1 ? 'produto salvo' : 'produtos salvos'}
            </p>
          </div>
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
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={minVariant.price}
                  compareAtPrice={minVariant.compare_at_price || undefined}
                  image={Array.isArray(product.images) ? product.images[0] : "/placeholder.svg"}
                  brand={product.brand}
                  inStock={minVariant.stock > 0}
                  discount={discount}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState type="favorites" />
        )}
      </main>

      <Footer />
    </div>
  );
}