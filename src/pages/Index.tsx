import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import RatingStars from "@/components/ui/RatingStars";
import { 
  ArrowRight, 
  CreditCard, 
  Truck, 
  Shield, 
  Dog, 
  Cat, 
  Bath, 
  Shirt, 
  Coffee, 
  Home,
  Gamepad2,
  Package,
  Mail,
  Quote
} from "lucide-react";
import { track } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const [email, setEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useEffect(() => {
    track("view_home");
  }, []);

  // Query for featured products - TODO: replace with actual Supabase query
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      // Mock data - TODO: replace with actual Supabase query
      return featuredProducts;
    }
  });

  const handleHeroCTA = (cta: "comprar" | "ofertas") => {
    track("click_hero_cta", { cta });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    track("newsletter_subscribe", { email });
    setNewsletterSuccess(true);
    setEmail("");
    setTimeout(() => setNewsletterSuccess(false), 3000);
  };

  // Mock featured products - TODO: replace with actual Supabase query

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
      slug: "racao-premium-caes-adultos-frango"
    },
    {
      id: "2", 
      name: "Brinquedo Corda Dental para Cães",
      price: 24.90,
      image: "/placeholder.svg",
      rating: 4,
      reviewCount: 89,
      brand: "Play Pet",
      inStock: true,
      slug: "brinquedo-corda-dental-caes"
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
      slug: "areia-sanitaria-perfumada-gatos-4kg"
    },
    {
      id: "4",
      name: "Cama Ortopédica para Cães Grandes",
      price: 159.90,
      image: "/placeholder.svg",
      rating: 5,
      reviewCount: 67,
      brand: "Comfort Pet",
      inStock: false,
      slug: "cama-ortopedica-caes-grandes"
    },
    {
      id: "5",
      name: "Coleira Anti-Pulgas para Cães",
      price: 34.90,
      compareAtPrice: 49.90,
      image: "/placeholder.svg",
      rating: 4,
      reviewCount: 156,
      brand: "ProtectPet",
      inStock: true,
      slug: "coleira-anti-pulgas-caes"
    },
    {
      id: "6",
      name: "Comedouro Automático para Gatos",
      price: 129.90,
      image: "/placeholder.svg",
      rating: 5,
      reviewCount: 43,
      brand: "Smart Pet",
      inStock: true,
      slug: "comedouro-automatico-gatos"
    },
    {
      id: "7",
      name: "Shampoo Hipoalergênico para Cães",
      price: 39.90,
      image: "/placeholder.svg",
      rating: 4,
      reviewCount: 278,
      brand: "Clean Paws",
      inStock: true,
      slug: "shampoo-hipoalergenico-caes"
    },
    {
      id: "8",
      name: "Arranhador para Gatos com Brinquedos",
      price: 79.90,
      compareAtPrice: 99.90,
      image: "/placeholder.svg",
      rating: 5,
      reviewCount: 91,
      brand: "Cat Tower",
      inStock: true,
      slug: "arranhador-gatos-brinquedos"
    }
  ];

  const categories = [
    { name: "Cães", icon: Dog, slug: "/categoria/caes", description: "Tudo para cães" },
    { name: "Gatos", icon: Cat, slug: "/categoria/gatos", description: "Tudo para gatos" },
    { name: "Acessórios", icon: Shirt, slug: "/categoria/acessorios", description: "Coleiras, roupas" },
    { name: "Camas", icon: Home, slug: "/categoria/camas", description: "Conforto e descanso" },
    { name: "Comer e Beber", icon: Coffee, slug: "/categoria/comer-e-beber", description: "Comedouros, bebedouros" },
    { name: "Higiene", icon: Bath, slug: "/categoria/higiene", description: "Shampoos, escovas" },
    { name: "Brinquedos", icon: Gamepad2, slug: "/categoria/brinquedos", description: "Diversão garantida" },
    { name: "Areias", icon: Package, slug: "/categoria/areias", description: "Sanitárias para gatos" }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Maria Silva",
      avatar: "/placeholder.svg",
      text: "Produtos de qualidade excelente e entrega super rápida! Meu Rex adorou a ração nova."
    },
    {
      id: 2,
      name: "João Santos",
      avatar: "/placeholder.svg", 
      text: "Atendimento nota 10! Tiraram todas as minhas dúvidas sobre qual brinquedo escolher."
    },
    {
      id: 3,
      name: "Ana Costa",
      avatar: "/placeholder.svg",
      text: "A areia que comprei aqui é muito boa, sem cheiro e minha gatinha aprovou!"
    }
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
        <section className="relative bg-soft py-16 lg:py-24">
          <div className="container">
            <Card className="bg-white shadow-soft border-0">
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-ink">
                      Tudo para seu{" "}
                      <span className="text-brand-blue">melhor amigo</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-muted mb-8">
                      Cuidar bem é simples: selecione, pague no PIX ou cartão e receba em casa.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <Button 
                        size="lg" 
                        className="text-lg px-8"
                        asChild
                        onClick={() => handleHeroCTA("comprar")}
                      >
                        <Link to="/categoria/caes">
                          Comprar agora
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="text-lg px-8 bg-white"
                        asChild
                        onClick={() => handleHeroCTA("ofertas")}
                      >
                        <Link to="/buscar?q=promo">
                          Ver ofertas
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <img
                      src="/placeholder.svg"
                      alt="Cão e gato felizes juntos - produtos para pets"
                      className="w-full max-w-md mx-auto rounded-2xl shadow-hard"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-12 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-soft border-0">
                <CardContent className="p-6 text-center">
                  <div className="bg-brand-blue/10 p-4 rounded-2xl w-fit mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-brand-blue" />
                  </div>
                  <h3 className="font-semibold text-ink mb-2">Pix/Cartão em até 12x</h3>
                  <p className="text-sm text-muted">Pagamento seguro e rápido</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft border-0">
                <CardContent className="p-6 text-center">
                  <div className="bg-brand-green/10 p-4 rounded-2xl w-fit mx-auto mb-4">
                    <Truck className="h-8 w-8 text-brand-green" />
                  </div>
                  <h3 className="font-semibold text-ink mb-2">Entrega rápida Brasil</h3>
                  <p className="text-sm text-muted">Frete grátis acima de R$ 99</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft border-0">
                <CardContent className="p-6 text-center">
                  <div className="bg-brand-yellow/10 p-4 rounded-2xl w-fit mx-auto mb-4">
                    <Shield className="h-8 w-8 text-brand-yellow" />
                  </div>
                  <h3 className="font-semibold text-ink mb-2">Troca garantida 7 dias</h3>
                  <p className="text-sm text-muted">Sua satisfação é garantida</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-soft">
          <div className="container">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 text-ink">
              Compre por categoria
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-6">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card 
                    key={category.name} 
                    className="hover:shadow-hard transition-all duration-300 cursor-pointer group border-0 bg-white"
                  >
                    <Link 
                      to={category.slug}
                      className="block"
                      aria-label={`Ver produtos da categoria ${category.name}`}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="bg-brand-blue/10 p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <IconComponent className="h-8 w-8 text-brand-blue" />
                        </div>
                        <h3 className="font-semibold mb-2 text-ink">{category.name}</h3>
                        <p className="text-xs text-muted">{category.description}</p>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-ink">Mais vendidos</h2>
              <Button variant="outline" asChild className="bg-white">
                <Link to="/buscar?q=">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              ) : (
                products?.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Promotional Banners */}
        <section className="py-16 bg-soft">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-brand-yellow to-brand-yellow/80 border-0 shadow-soft text-ink">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    🎉 Semana do Pet Feliz
                  </h3>
                  <p className="text-lg mb-6 opacity-90">
                    Até 30% OFF em produtos selecionados
                  </p>
                  <Button variant="outline" className="bg-white text-ink border-ink hover:bg-ink hover:text-white">
                    Aproveitar
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-brand-green to-brand-green/80 border-0 shadow-soft text-white">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    🚚 Frete grátis
                  </h3>
                  <p className="text-lg mb-6 opacity-90">
                    Acima de R$ 199 para todo o Brasil
                  </p>
                  <Button variant="outline" className="bg-white text-brand-green border-white hover:bg-brand-green hover:text-white">
                    Aproveitar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 text-ink">
              O que nossos clientes dizem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="shadow-soft border-0 bg-white">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-brand-blue mb-4" />
                    <blockquote className="text-muted mb-4">
                      "{testimonial.text}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.avatar}
                        alt={`Foto de ${testimonial.name}`}
                        className="w-10 h-10 rounded-full bg-soft"
                      />
                      <div>
                        <p className="font-semibold text-ink">{testimonial.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <RatingStars value={5} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-soft">
          <div className="container">
            <Card className="bg-white shadow-soft border-0 max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <Mail className="h-12 w-12 text-brand-blue mx-auto mb-4" />
                <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-ink">
                  Receba novidades e ofertas
                </h2>
                <p className="text-muted mb-6">
                  Cadastre-se e seja o primeiro a saber sobre promoções exclusivas!
                </p>
                
                {newsletterSuccess ? (
                  <div className="bg-brand-green/10 text-brand-green p-4 rounded-2xl">
                    ✅ Obrigado! Você receberá nossas novidades em breve.
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <Input
                      type="email"
                      placeholder="Seu melhor e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit" className="px-8">
                      Assinar novidades
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
