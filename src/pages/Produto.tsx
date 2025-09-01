import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, ShoppingCart, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useCart } from "@/context/CartContext";
import { useCartUI } from "@/components/cart/CartUIContext";
import { useFavorites } from "@/hooks/useFavorites";
import { formatBRL } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RatingStars from "@/components/ui/RatingStars";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Skeleton from "@/components/ui/skeleton";
import ProductGallery from "@/components/product/ProductGallery";
import VariantSelector from "@/components/product/VariantSelector";
import ProductTabs from "@/components/product/ProductTabs";
import ProductCard from "@/components/ProductCard";

interface Variant {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  active?: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  brand?: string;
  rating_avg: number;
  rating_count: number;
  variants: Variant[];
}

export default function Produto() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { session } = useSession();
  const { addItem } = useCart();
  const { open: openCart } = useCartUI();
  const { favorites, toggleFavorite, isFavorited } = useFavorites();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);

  // Load product data
  useEffect(() => {
    if (!slug) return;
    
    const loadProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id, name, slug, description, images, brand, rating_avg, rating_count,
            variants!inner (id, name, price, compare_at_price, stock, active),
            product_categories (category_id),
            species
          `)
          .eq("slug", slug)
          .eq("active", true)
          .eq("variants.active", true)
          .single();

        if (error || !data) {
          setProduct(null);
          setLoading(false);
          return;
        }

        setProduct(data as Product);
        
        // Select first available variant
        const availableVariant = data.variants.find((v: Variant) => v.stock > 0) || data.variants[0];
        setSelectedVariant(availableVariant);
        
        // Load related products
        if (data.product_categories?.length > 0) {
          loadRelatedProducts(data.id, data.product_categories[0].category_id);
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  const loadRelatedProducts = async (currentProductId: string, categoryId: string) => {
    setLoadingRelated(true);
    try {
      const { data } = await supabase
        .from("products")
        .select(`
          id, name, slug, images, brand, rating_avg, rating_count,
          variants!inner (price, compare_at_price, stock),
          product_categories!inner (category_id)
        `)
        .eq("product_categories.category_id", categoryId)
        .eq("active", true)
        .neq("id", currentProductId)
        .limit(4);

      setRelatedProducts(data || []);
    } catch (err) {
      console.error("Error loading related products:", err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({ title: "Selecione uma variação", variant: "destructive" });
      return;
    }

    if (!session) {
      navigate("/entrar", { state: { from: location } });
      return;
    }

    try {
      await addItem(selectedVariant.id, quantity);
      openCart();
      
      track("add_to_cart", {
        product_id: product?.id,
        variant_id: selectedVariant.id,
        qty: quantity,
        price: selectedVariant.price
      });

      toast({ title: "Produto adicionado ao carrinho!" });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({ title: "Erro ao adicionar ao carrinho", variant: "destructive" });
    }
  };

  const calculateShipping = () => {
    if (!cep.match(/^\d{5}-?\d{3}$/)) {
      toast({ title: "CEP inválido", variant: "destructive" });
      return;
    }

    const options = [
      { name: "Econômico", days: "5-8 dias", price: 19.90 },
      { name: "Rápido", days: "2-3 dias", price: 34.90 }
    ];
    
    setShippingOptions(options);
    track("shipping_quote", { cep, options: options.length });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft">
        <Header />
        <div className="container py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-soft">
        <Header />
        <div className="container py-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-ink mb-4">Produto não encontrado</h1>
            <p className="text-muted mb-6">O produto que você está procurando não existe ou foi removido.</p>
            <Link to="/">
              <Button>Voltar ao início</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const discountPercent = selectedVariant?.compare_at_price 
    ? Math.round((1 - selectedVariant.price / selectedVariant.compare_at_price) * 100)
    : 0;

  const stockStatus = selectedVariant?.stock === 0 
    ? "esgotado" 
    : selectedVariant?.stock && selectedVariant.stock < 5 
    ? "poucas unidades" 
    : "em estoque";

  return (
    <div className="min-h-screen bg-soft">
      <Helmet>
        <title>{product.name} — Pata Lab</title>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.images?.[0] || "/placeholder.svg",
            description: product.description,
            brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
            offers: {
              "@type": "Offer",
              price: selectedVariant?.price || 0,
              priceCurrency: "BRL",
              availability: selectedVariant?.stock > 0 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock"
            }
          })}
        </script>
      </Helmet>

      <Header />
      
      <div className="container py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-muted">
          <Link to="/" className="hover:text-ink">Início</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Gallery */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Title */}
            {product.brand && (
              <p className="text-muted font-medium">{product.brand}</p>
            )}
            <h1 className="text-3xl font-bold text-ink">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <RatingStars value={product.rating_avg || 4.5} />
              <span className="text-muted text-sm">
                ({product.rating_count || 127} avaliações)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-ink">
                  {formatBRL(selectedVariant?.price || 0)}
                </span>
                {selectedVariant?.compare_at_price && (
                  <>
                    <span className="text-lg text-muted line-through">
                      {formatBRL(selectedVariant.compare_at_price)}
                    </span>
                    <Badge variant="sale">-{discountPercent}%</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onVariantChange={(variant) => setSelectedVariant(variant)}
            />

            {/* Stock Status */}
            <div aria-live="polite">
              <span className={`text-sm font-medium ${
                stockStatus === "esgotado" ? "text-red-500" :
                stockStatus === "poucas unidades" ? "text-yellow-600" :
                "text-green-600"
              }`}>
                {stockStatus === "esgotado" ? "Produto esgotado" :
                 stockStatus === "poucas unidades" ? "Poucas unidades disponíveis" :
                 "Produto em estoque"}
              </span>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium text-ink">Quantidade:</label>
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                  className="flex-1"
                  aria-label="Adicionar produto ao carrinho"
                >
                  <ShoppingCart size={18} />
                  Adicionar ao carrinho
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => toggleFavorite(product.id)}
                  aria-label={isFavorited(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Heart 
                    size={18} 
                    className={isFavorited(product.id) ? "fill-red-500 text-red-500" : ""} 
                  />
                </Button>
              </div>
            </div>

            {/* Shipping Calculator */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck size={18} className="text-brand-blue" />
                <h3 className="font-medium text-ink">Calcular frete</h3>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="input flex-1"
                  maxLength={9}
                />
                <Button variant="ghost" onClick={calculateShipping}>
                  Calcular
                </Button>
              </div>
              {shippingOptions.length > 0 && (
                <div className="space-y-2">
                  {shippingOptions.map((option, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-ink">
                        {option.name} ({option.days})
                      </span>
                      <span className="font-medium text-ink">
                        {formatBRL(option.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mb-12">
          <ProductTabs description={product.description} />
        </div>

        {/* Related Products */}
        {(relatedProducts.length > 0 || loadingRelated) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-ink mb-6">Produtos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingRelated ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4]" />
                ))
              ) : (
                relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    id={relatedProduct.id}
                    name={relatedProduct.name}
                    slug={relatedProduct.slug}
                    image={relatedProduct.images?.[0] || "/placeholder.svg"}
                    price={relatedProduct.variants[0]?.price || 0}
                    compareAtPrice={relatedProduct.variants[0]?.compare_at_price}
                    rating={relatedProduct.rating_avg || 4.5}
                    reviewCount={relatedProduct.rating_count || 0}
                    brand={relatedProduct.brand}
                    inStock={relatedProduct.variants[0]?.stock > 0}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}