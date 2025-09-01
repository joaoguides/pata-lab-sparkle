import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, User, Heart, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useCart } from "@/context/CartContext";
import { useCartUI } from "@/components/cart/CartUIContext";
import { useFavorites } from "@/hooks/useFavorites";
import AnnouncementBar from "@/components/AnnouncementBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [selectedSpecies, setSelectedSpecies] = useState<"CACHORRO" | "GATO" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { session } = useSession();
  const { itemCount } = useCart();
  const { open } = useCartUI();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  const menuItems = [
    { name: "Cães", href: "/categoria/caes" },
    { name: "Gatos", href: "/categoria/gatos" },
    { name: "Acessórios", href: "/categoria/acessorios" },
    { name: "Camas", href: "/categoria/camas" },
    { name: "Comer e Beber", href: "/categoria/comer-beber" },
    { name: "Higiene", href: "/categoria/higiene" },
    { name: "Brinquedos", href: "/categoria/brinquedos" },
    { name: "Areias", href: "/categoria/areias" },
  ];

  const categories = {
    CACHORRO: [
      "Acessórios",
      "Roupas", 
      "Brinquedos",
      "Camas e Capas",
      "Comer e Beber",
      "Higiene",
      "Alimentos"
    ],
    GATO: [
      "Acessórios",
      "Camas",
      "Comer e Beber", 
      "Areias",
      "Brinquedos",
      "Alimentos",
      "Higiene e Limpeza"
    ]
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50 shadow-sm">
      <AnnouncementBar />
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">
              🐾 Pata Lab
            </div>
          </Link>

          {/* Navigation menu - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Button key={item.name} variant="ghost" asChild>
                <Link to={item.href} className="text-sm">{item.name}</Link>
              </Button>
            ))}
          </nav>

          {/* Search bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const query = formData.get("search") as string;
              if (query.trim()) {
                navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            className="flex-1 max-w-md relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              name="search"
              placeholder="Buscar produtos..."
              className="pl-10 rounded-2xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              defaultValue={window.location.pathname === '/buscar' ? new URLSearchParams(window.location.search).get('q') || '' : ''}
            />
          </form>

          {/* User actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-2xl relative" 
              asChild
            >
              <Link to="/favoritos" aria-label={`Lista de desejos (${favorites.size} produtos)`}>
                <Heart className="h-5 w-5" />
                {favorites.size > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {favorites.size}
                  </Badge>
                )}
                <span className="sr-only">Lista de desejos</span>
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-2xl"
              onClick={open}
              aria-label={`Carrinho (${itemCount} itens)`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Carrinho</span>
            </Button>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-2xl">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Minha conta</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link to="/meus-pedidos">Meus pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/enderecos">Endereços</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex gap-2">
                <Button asChild variant="ghost" size="sm" className="rounded-2xl">
                  <Link to="/entrar">Entrar</Link>
                </Button>
                <Button asChild size="sm" className="rounded-2xl">
                  <Link to="/criar-conta">Criar conta</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-2xl">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background">
                <div className="flex flex-col gap-4 mt-4">
                  {/* Auth buttons on mobile */}
                  {!session && (
                    <div className="flex flex-col gap-2 pb-4 border-b">
                      <Button asChild className="w-full rounded-2xl">
                        <Link to="/entrar">Entrar</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full rounded-2xl">
                        <Link to="/criar-conta">Criar conta</Link>
                      </Button>
                    </div>
                  )}

                  {/* Navigation items */}
                  <div className="space-y-2">
                    {menuItems.map((item) => (
                      <Button key={item.name} variant="ghost" asChild className="w-full justify-start">
                        <Link to={item.href}>{item.name}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Categories mega menu */}
        {selectedSpecies && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {categories[selectedSpecies].map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className="justify-start text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;