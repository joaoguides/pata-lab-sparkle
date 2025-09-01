import Button from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ShoppingBag, RotateCcw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ImprovedEmptyStateProps {
  type: "search" | "category" | "filters";
  query?: string;
  title?: string;
  description?: string;
  onClearFilters?: () => void;
  hasFilters?: boolean;
}

export default function ImprovedEmptyState({
  type,
  query,
  title,
  description,
  onClearFilters,
  hasFilters = false,
}: ImprovedEmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case "search":
        return {
          icon: Search,
          title: query ? `Nada encontrado 😿` : "Digite algo para buscar",
          description: query 
            ? `Não encontramos produtos para "${query}". Tente outros termos ou remova alguns filtros.`
            : "Use o campo de busca no topo da página para encontrar produtos",
        };
      case "category":
        return {
          icon: ShoppingBag,
          title: "Nada encontrado 😿",
          description: "Não encontramos produtos nesta categoria com os filtros aplicados. Tente ajustar os critérios de busca.",
        };
      case "filters":
        return {
          icon: Search,
          title: "Nada encontrado 😿",
          description: "Nenhum produto corresponde aos filtros selecionados. Tente remover alguns filtros para ver mais produtos.",
        };
      default:
        return {
          icon: ShoppingBag,
          title: "Nada encontrado",
          description: "Não há produtos disponíveis no momento.",
        };
    }
  };

  const config = getDefaultContent();
  const Icon = config.icon;

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="rounded-full bg-muted p-4">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            {title || config.title}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed">
            {description || config.description}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          {hasFilters && onClearFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Limpar filtros
            </Button>
          )}
          
          <Button asChild className="flex items-center gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar para a loja
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}