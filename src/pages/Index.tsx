import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Button from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Star, Heart, Award, Truck, Shield, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensureActiveCart } from "@/lib/cart";
import { runCheckout } from "@/lib/checkout";
import { track } from "@/lib/analytics";
import { useEffect } from "react";

const Index = () => {
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [totals, setTotals] = useState<{ subtotal:number; discount:number; total:number }|null>(null);
  const [errorMsg, setErrorMsg] = useState<string|null>(null);

  useEffect(() => {
    // Track home page view
    track("view_home");
  }, []);

  async function handleTestCheckout() {
    setErrorMsg(null);
    setTotals(null);
    setLoadingCheckout(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setErrorMsg("Faça login para testar o checkout."); return; }
      const cartId = await ensureActiveCart(session.user.id);
      const res = await runCheckout(cartId);
      setTotals(res);
    } catch (err:any) {
      setErrorMsg(err.message || "Erro no checkout");
    } finally {
      setLoadingCheckout(false);
    }
  }

  // Mock data for demonstration
  const featuredProducts = [
    {
      id: "1",
      name: "Ração Premium para Cães Adultos - Sabor Frango",
      price: 89.90,
      compareAtPrice: 109.90,
      image: "/placeholder.svg",
      rating: 5,
      reviewCount: 127,
      brand: "Super Premium",
      inStock: true,
      discount: 18
    },
    {
      id: "2", 
      name: "Brinquedo Corda Dental para Cães",
      price: 24.90,
      image: "/placeholder.svg",
      rating: 4,
      reviewCount: 89,
      brand: "Play Pet",
      inStock: true
    },
    {
      id: "3",
      name: "Areia Sanitária Perfumada para Gatos 4kg",
      price: 18.90,
      compareAtPrice: 25.90,
      image: "/placeholder.svg", 
      rating: 4,
      reviewCount: 203,
      brand: "Clean Cat",
      inStock: true,
      discount: 27
    },
    {
      id: "4",
      name: "Cama Ortopédica para Cães Grandes",
      price: 159.90,
      image: "/placeholder.svg",
      rating: 5,
      reviewCount: 67,
      brand: "Comfort Pet",
      inStock: false
    }
  ];

  const categories = [
    { name: "Alimentos", icon: "🍖", species: "Todos" },
    { name: "Brinquedos", icon: "🎾", species: "Todos" },
    { name: "Acessórios", icon: "🦴", species: "Cães" },
    { name: "Areias", icon: "📦", species: "Gatos" },
    { name: "Higiene", icon: "🧼", species: "Todos" },
    { name: "Camas", icon: "🛏️", species: "Todos" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pata Lab — Tudo para seu pet</title>
        <meta name="description" content="A melhor loja online para pets no Brasil. Ração, brinquedos, acessórios e muito mais com frete grátis acima de R$ 99." />
        <meta property="og:title" content="Pata Lab — Tudo para seu pet" />
        <meta property="og:description" content="A melhor loja online para pets no Brasil. Ração, brinquedos, acessórios e muito mais com frete grátis acima de R$ 99." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://patalab.lovable.app/" />
        <meta property="og:image" content="https://patalab.lovable.app/placeholder.svg" />
      </Helmet>

      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                  Tudo para seu{" "}
                  <span className="text-primary">melhor amigo</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Cuidar bem é simples: selecione, pague no PIX ou cartão e receba em casa.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="text-lg px-8">
                    Comprar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Ver ofertas
                  </Button>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="relative z-10">
                  <img
                    src="/placeholder.svg"
                    alt="Cão e gato felizes"
                    className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-2xl blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Test Checkout Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="my-6 p-4 rounded-xl border bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTestCheckout}
                  disabled={loadingCheckout}
                  className="rounded-xl px-4 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                  {loadingCheckout ? "Processando..." : "Testar checkout"}
                </button>
                {errorMsg && <span className="text-destructive text-sm">{errorMsg}</span>}
              </div>
              {totals && (
                <div className="mt-3 text-sm">
                  <div>Subtotal: <strong>R$ {totals.subtotal.toFixed(2)}</strong></div>
                  <div>Desconto: <strong>R$ {totals.discount.toFixed(2)}</strong></div>
                  <div>Total: <strong>R$ {totals.total.toFixed(2)}</strong></div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="bg-primary/10 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Pagamento seguro</h3>
                  <p className="text-sm text-muted-foreground">PIX e Cartão</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Truck className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Entrega para todo o Brasil</h3>
                  <p className="text-sm text-muted-foreground">Frete grátis acima de R$ 99</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="bg-accent/10 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Troca grátis</h3>
                  <p className="text-sm text-muted-foreground">Até 30 dias</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Compre por categoria</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.species}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Mais vendidos</h2>
              <Button variant="outline">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>

        {/* Banner Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-2xl p-8 md:p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                🐾 Adote um amigo, ganhe desconto especial
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Apresente o comprovante de adoção e ganhe 20% OFF na primeira compra
              </p>
              <Button variant="secondary" size="lg">
                Saiba mais
              </Button>
            </div>
          </div>
        </section>

        {/* Blog/Tips Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Dicas para seu pet</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img
                    src="/placeholder.svg"
                    alt="Dica de alimentação"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <Badge variant="secondary" className="mb-2">Alimentação</Badge>
                    <h3 className="font-semibold mb-2">Como escolher a ração ideal para seu cão</h3>
                    <p className="text-sm text-muted-foreground">
                      Descubra os principais fatores a considerar na hora de escolher...
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img
                    src="/placeholder.svg"
                    alt="Dica de higiene"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <Badge variant="secondary" className="mb-2">Higiene</Badge>
                    <h3 className="font-semibold mb-2">Banho em casa: passo a passo</h3>
                    <p className="text-sm text-muted-foreground">
                      Aprenda a dar banho no seu pet de forma segura e eficiente...
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img
                    src="/placeholder.svg"
                    alt="Dica de brincadeiras"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <Badge variant="secondary" className="mb-2">Diversão</Badge>
                    <h3 className="font-semibold mb-2">5 brincadeiras para fazer em casa</h3>
                    <p className="text-sm text-muted-foreground">
                      Mantenha seu pet ativo e feliz com essas atividades simples...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
