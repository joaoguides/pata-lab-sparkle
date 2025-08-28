import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useCart } from "@/context/CartContext";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, Heart, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name: string;
  description: string;
  images: any;
  brand: string;
  rating_avg: number;
  rating_count: number;
  variants: Variant[];
}

interface Variant {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  active: boolean;
}

export default function Produto() {
  const { slug } = useParams<{ slug: string }>();
  const { session } = useSession();
  const { addItem } = useCart();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (product) {
      // Track product view
      const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
      track("view_item", { 
        slug, 
        product_id: product.id, 
        price: selectedVariant?.price || 0 
      });
    }
  }, [product, slug, selectedVariantId]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          images,
          brand,
          rating_avg,
          rating_count,
          variants (
            id,
            name,
            price,
            compare_at_price,
            stock,
            active
          )
        `)
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (error) throw error;

      setProduct(data);
      // Auto-select first available variant
      if (data.variants?.length > 0) {
        const firstActiveVariant = data.variants.find(v => v.active && v.stock > 0);
        if (firstActiveVariant) {
          setSelectedVariantId(firstActiveVariant.id);
        }
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast({
        title: "Produto não encontrado",
        description: "Verifique o link e tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      toast({
        title: "Selecione uma variação",
        description: "Escolha uma opção antes de adicionar ao carrinho",
        variant: "destructive",
      });
      return;
    }

    if (!session) {
      navigate("/entrar", { 
        state: { from: { pathname: `/produto/${slug}` } }
      });
      return;
    }

    setAddingToCart(true);
    try {
      await addItem(selectedVariantId, 1);
      
      // Track add to cart event
      const selectedVariant = product?.variants.find(v => v.id === selectedVariantId);
      track("add_to_cart", { 
        variant_id: selectedVariantId, 
        qty: 1, 
        price: selectedVariant?.price || 0 
      });
      
      toast({
        title: "Item adicionado!",
        description: "Produto adicionado ao seu carrinho",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar item",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando produto...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Produto não encontrado</h1>
            <Button asChild>
              <Link to="/">Voltar à página inicial</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  const hasDiscount = selectedVariant?.compare_at_price && selectedVariant.compare_at_price > selectedVariant.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((selectedVariant.compare_at_price! - selectedVariant.price) / selectedVariant.compare_at_price!) * 100)
    : 0;

  // Generate JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": Array.isArray(product.images) ? product.images : [],
    "description": product.description || "",
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Pata Lab"
    },
    "offers": {
      "@type": "Offer",
      "price": selectedVariant?.price || 0,
      "priceCurrency": "BRL",
      "availability": selectedVariant?.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    ...(product.rating_count > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating_avg,
        "reviewCount": product.rating_count
      }
    })
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product.name} - Pata Lab</title>
        <meta name="description" content={product.description || `${product.name} na Pata Lab. ${product.brand ? `Marca ${product.brand}.` : ''} Entrega rápida e frete grátis acima de R$ 99.`} />
        <meta property="og:title" content={`${product.name} - Pata Lab`} />
        <meta property="og:description" content={product.description || `${product.name} na Pata Lab`} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={Array.isArray(product.images) ? product.images[0] : "/placeholder.svg"} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square">
              <img
                src={Array.isArray(product.images) ? product.images[0] : "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl shadow-sm border"
              />
            </div>
            {product.images && Array.isArray(product.images) && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="aspect-square object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <Badge variant="secondary" className="text-xs">
                {product.brand}
              </Badge>
            )}

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating_avg) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating_avg.toFixed(1)} ({product.rating_count} avaliações)
                </span>
              </div>
            </div>

            {/* Price */}
            {selectedVariant && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">
                    R$ {selectedVariant.price.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        R$ {selectedVariant.compare_at_price!.toFixed(2)}
                      </span>
                      <Badge variant="destructive">
                        -{discountPercentage}%
                      </Badge>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-secondary" />
                  <span className="text-muted-foreground">
                    Frete grátis acima de R$ 99
                  </span>
                </div>
              </div>
            )}

            {/* Variant Selection */}
            {product.variants.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-semibold">Escolha uma opção:</label>
                <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Selecione uma variação" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map((variant) => (
                      <SelectItem 
                        key={variant.id} 
                        value={variant.id}
                        disabled={!variant.active || variant.stock <= 0}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{variant.name}</span>
                          <span className="ml-2 font-semibold">
                            R$ {variant.price.toFixed(2)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Stock Status */}
            {selectedVariant && (
              <div className="text-sm">
                {selectedVariant.stock > 0 ? (
                  <span className="text-secondary font-medium">
                    ✅ Em estoque ({selectedVariant.stock} disponível)
                  </span>
                ) : (
                  <span className="text-destructive font-medium">
                    ❌ Fora de estoque
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock <= 0 || addingToCart}
                className="flex-1 rounded-2xl"
                size="lg"
              >
                {addingToCart 
                  ? "Adicionando..." 
                  : !session 
                  ? "Entrar para comprar" 
                  : "Adicionar ao carrinho"
                }
              </Button>
              
              <Button variant="outline" size="lg" className="rounded-2xl">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Description */}
            {product.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Descrição do produto</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}