import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, User, Heart, Menu } from "lucide-react";
import { useState } from "react";
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
    <header className="border-b bg-background sticky top-0 z-50">
      {/* Top banner */}
      <div className="bg-accent text-accent-foreground py-2 text-center text-sm font-medium">
        🐾 PIX 10% OFF + Frete grátis acima de R$ 99 🐾
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">
              🐾 Pata Lab
            </div>
          </div>

          {/* Species selector - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={selectedSpecies === "CACHORRO" ? "default" : "outline"}
              onClick={() => setSelectedSpecies(selectedSpecies === "CACHORRO" ? null : "CACHORRO")}
            >
              🐕 Cães
            </Button>
            <Button
              variant={selectedSpecies === "GATO" ? "default" : "outline"}
              onClick={() => setSelectedSpecies(selectedSpecies === "GATO" ? null : "GATO")}
            >
              🐱 Gatos
            </Button>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-10"
            />
          </div>

          {/* User actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Lista de desejos</span>
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                0
              </Badge>
              <span className="sr-only">Carrinho</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Menu do usuário</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Entrar</DropdownMenuItem>
                <DropdownMenuItem>Criar conta</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-4">
                  <Button
                    variant={selectedSpecies === "CACHORRO" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedSpecies(selectedSpecies === "CACHORRO" ? null : "CACHORRO")}
                  >
                    🐕 Cães
                  </Button>
                  <Button
                    variant={selectedSpecies === "GATO" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedSpecies(selectedSpecies === "GATO" ? null : "GATO")}
                  >
                    🐱 Gatos
                  </Button>
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