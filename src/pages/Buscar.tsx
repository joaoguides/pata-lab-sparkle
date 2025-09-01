import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import Button from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import FilterChips from "@/components/catalog/FilterChips";
import CollapsibleFilterSidebar from "@/components/catalog/CollapsibleFilterSidebar";
import LoadMore from "@/components/catalog/LoadMore";
import ImprovedEmptyState from "@/components/catalog/ImprovedEmptyState";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Search } from "lucide-react";

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

const ITEMS_PER_PAGE = 24;

export default function Buscar() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Search and filters from URL params
  const query = searchParams.get("q") || "";
  const species = searchParams.get("species") || "both";
  const minPrice = searchParams.get("min") ? parseFloat(searchParams.get("min")!) : "";
  const maxPrice = searchParams.get("max") ? parseFloat(searchParams.get("max")!) : "";
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "popular";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    if (query.trim()) {
      searchProducts(true); // true = reset products
      // Track search
      track("search", { query, results_count: totalCount });
    } else {
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
    }
  }, [query, species, minPrice, maxPrice, inStock, sort]);

  // Track page view
  useEffect(() => {
    if (query) {
      track("catalog_view", { type: "search", query });
    }
  }, [query]);

  const searchProducts = async (resetProducts = false) => {
    if (resetProducts) {
      setProducts([]);
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Build search query
      let dbQuery = supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          images,
          brand,
          species,
          description,
          variants (
            id,
            name,
            price,
            compare_at_price,
            stock
          )
        `)
        .eq("active", true);

      // Search by name and description
      if (query.trim()) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Apply filters
      if (species !== "both") {
        const speciesMap = { dog: "CACHORRO", cat: "GATO" } as const;
        dbQuery = dbQuery.eq("species", speciesMap[species as keyof typeof speciesMap]);
      }

      if (inStock) {
        dbQuery = dbQuery.gte("variants.stock", 1);
      }

      // Apply sorting
      switch (sort) {
        case "price_asc":
          dbQuery = dbQuery.order("variants(price)", { ascending: true });
          break;
        case "price_desc":
          dbQuery = dbQuery.order("variants(price)", { ascending: false });
          break;
        case "recent":
          dbQuery = dbQuery.order("created_at", { ascending: false });
          break;
        default: // popular
          dbQuery = dbQuery.order("rating_avg", { ascending: false });
      }

      // Apply pagination
      const currentPage = resetProducts ? 1 : page + 1;
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: productsData, error: productsError, count } = await dbQuery
        .range(from, to);

      if (productsError) throw productsError;

      // Filter by price range client-side
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

      if (resetProducts) {
        setProducts(filteredProducts);
        // Scroll to top when filters change
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setProducts(prev => [...prev, ...filteredProducts]);
        // Track load more
        track("catalog_load_more", { page: currentPage });
      }
      
      setTotalCount(count || 0);
      setHasMore(filteredProducts.length === ITEMS_PER_PAGE);

    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
    newParams.delete("page");

    setSearchParams(newParams);

    // Track filter changes
    if (updates.sort) {
      track("catalog_sort_change", { sort: updates.sort });
    }
  };

  const handleLoadMore = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(page + 1));
    setSearchParams(newParams);
    searchProducts(false);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    // Keep the search query but clear filters
    if (query) {
      newParams.set("q", query);
    }
    setSearchParams(newParams);
  };

  const clearFilter = (key: string) => {
    updateFilters({ [key]: null });
  };

  const hasActiveFilters = Boolean(species !== "both" || minPrice || maxPrice || inStock || (sort && sort !== "popular"));

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>
          {query ? `Busca por "${query}" - Pata Lab` : "Buscar Produtos - Pata Lab"}
        </title>
        <meta 
          name="description" 
          content={query ? `Resultados da busca por "${query}" na Pata Lab` : "Encontre os melhores produtos para seu pet"} 
        />
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {query ? `Resultados para "${query}"` : "Buscar"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3 mb-6">
          <Search className="h-6 w-6 text-muted-foreground" />
          <div>
            {query ? (
              <>
                <h1 className="text-3xl font-bold">
                  Resultados para "{query}"
                </h1>
                <p className="text-muted-foreground">
                  {totalCount} {totalCount === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </p>
              </>
            ) : (
              <h1 className="text-3xl font-bold">Buscar Produtos</h1>
            )}
          </div>
        </div>

        {!query.trim() ? (
          <ImprovedEmptyState 
            type="search"
            title="Digite algo para buscar"
            description="Use o campo de busca no topo da página para encontrar produtos"
          />
        ) : (
          <>
            {/* Filter Chips */}
            <FilterChips
              species={species}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStock={inStock}
              sort={sort}
              onClearFilter={clearFilter}
              onClearAll={clearAllFilters}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="space-y-6">
                <CollapsibleFilterSidebar
                  species={species}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  inStock={inStock}
                  onFiltersChange={updateFilters}
                  pageKey="buscar"
                />
              </div>

              {/* Products Grid */}
              <div className="lg:col-span-3 space-y-6">
                {/* Sort and Results Count */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-medium whitespace-nowrap">Ordenar por:</Label>
                    <Select value={sort} onValueChange={(value) => updateFilters({ sort: value })}>
                      <SelectTrigger className="w-full sm:w-48">
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
                  
                  {products.length > 0 && (
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                      Mostrando {Math.min(products.length, ITEMS_PER_PAGE)} de {totalCount} produtos
                    </p>
                  )}
                </div>

                {/* Results */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))}
                  </div>
                ) : products.length > 0 ? (
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
                            variants={product.variants}
                          />
                        );
                      })}
                    </div>

                    {/* Load More */}
                    <LoadMore
                      loading={loadingMore}
                      hasMore={hasMore}
                      onLoadMore={handleLoadMore}
                      useIntersectionObserver={true}
                    />
                  </>
                ) : (
                  <ImprovedEmptyState 
                    type="search"
                    query={query}
                    hasFilters={hasActiveFilters}
                    onClearFilters={hasActiveFilters ? clearAllFilters : undefined}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}