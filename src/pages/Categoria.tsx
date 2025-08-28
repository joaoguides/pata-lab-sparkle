import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import EmptyState from "@/components/EmptyState";
import { Filter, SlidersHorizontal } from "lucide-react";

interface Product {
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

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ITEMS_PER_PAGE = 24;

export default function Categoria() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters from URL params
  const species = searchParams.get("species") || "both";
  const minPrice = searchParams.get("min") ? parseFloat(searchParams.get("min")!) : "";
  const maxPrice = searchParams.get("max") ? parseFloat(searchParams.get("max")!) : "";
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "popular";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    if (slug) {
      loadCategoryAndProducts();
    }
  }, [slug, searchParams]);

  const loadCategoryAndProducts = async () => {
    setLoading(true);
    try {
      // Load category info
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("slug", slug)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      // Build products query
      let query = supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          images,
          brand,
          species,
          variants (
            id,
            name,
            price,
            compare_at_price,
            stock
          ),
          product_categories!inner (
            category_id
          )
        `)
        .eq("active", true)
        .eq("product_categories.category_id", categoryData.id);

      // Apply filters
      if (species !== "both") {
        const speciesMap = { dog: "CACHORRO", cat: "GATO" } as const;
        query = query.eq("species", speciesMap[species as keyof typeof speciesMap]);
      }

      if (inStock) {
        query = query.gte("variants.stock", 1);
      }

      // Apply sorting
      switch (sort) {
        case "price_asc":
          query = query.order("variants(price)", { ascending: true });
          break;
        case "price_desc":
          query = query.order("variants(price)", { ascending: false });
          break;
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        default: // popular
          query = query.order("rating_avg", { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: productsData, error: productsError, count } = await query
        .range(from, to);

      if (productsError) throw productsError;

      // Filter by price range client-side (since we can't easily filter nested variant prices in Supabase)
      let filteredProducts = productsData || [];
      
      if (minPrice !== "" || maxPrice !== "") {
        filteredProducts = filteredProducts.filter(product => {
          if (!product.variants?.length) return false;
          const minVariantPrice = Math.min(...product.variants.map(v => v.price));
          const maxVariantPrice = Math.max(...product.variants.map(v => v.price));
          
          const minCheck = minPrice === "" || maxVariantPrice >= minPrice;
          const maxCheck = maxPrice === "" || minVariantPrice <= maxPrice;
          
          return minCheck && maxCheck;
        });
      }

      setProducts(filteredProducts);
      setTotalCount(count || 0);

    } catch (error) {
      console.error("Error loading category:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    // Reset to page 1 when filters change
    if (!updates.page) {
      newParams.delete("page");
    }

    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <EmptyState 
            type="category" 
            title="Categoria não encontrada"
            description="A categoria solicitada não existe ou não está disponível"
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{category.name} - Pata Lab</title>
        <meta name="description" content={`Produtos de ${category.name} para seu pet. Encontre as melhores opções com frete grátis acima de R$ 99.`} />
        <meta property="og:title" content={`${category.name} - Pata Lab`} />
        <meta property="og:description" content={`Produtos de ${category.name} para seu pet na Pata Lab`} />
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Species Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Espécie</Label>
                  <div className="space-y-2">
                    {[
                      { value: "both", label: "Todos" },
                      { value: "dog", label: "Cães" },
                      { value: "cat", label: "Gatos" }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`species-${option.value}`}
                          checked={species === option.value}
                          onCheckedChange={() => 
                            updateFilters({ species: option.value === "both" ? null : option.value })
                          }
                        />
                        <Label 
                          htmlFor={`species-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Preço (R$)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => updateFilters({ min: e.target.value })}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => updateFilters({ max: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Stock Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={inStock}
                    onCheckedChange={(checked) => 
                      updateFilters({ inStock: checked ? "true" : null })
                    }
                  />
                  <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
                    Apenas em estoque
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sort and Results */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Ordenar por:</Label>
                <Select value={sort} onValueChange={(value) => updateFilters({ sort: value })}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Mais populares</SelectItem>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="price_asc">Menor preço</SelectItem>
                    <SelectItem value="price_desc">Maior preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => updateFilters({ page: String(page - 1) })}
                    >
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateFilters({ page: String(pageNum) })}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => updateFilters({ page: String(page + 1) })}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState 
                type="category"
                description="Nenhum produto encontrado com os filtros selecionados. Tente ajustar os critérios de busca."
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}