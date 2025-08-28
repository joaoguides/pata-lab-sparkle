import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ShoppingBag, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  type: "search" | "category" | "favorites";
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

const defaultContent = {
  search: {
    icon: Search,
    title: "Nenhum produto encontrado",
    description: "Tente buscar com outras palavras ou confira nossa seleção completa",
    actionText: "Ver todos os produtos",
    actionHref: "/",
  },
  category: {
    icon: ShoppingBag,
    title: "Nenhum produto nesta categoria",
    description: "Esta categoria ainda não tem produtos ou todos estão fora de estoque",
    actionText: "Explorar outras categorias",
    actionHref: "/",
  },
  favorites: {
    icon: Heart,
    title: "Sua lista de desejos está vazia",
    description: "Adicione produtos aos favoritos para vê-los aqui",
    actionText: "Descobrir produtos",
    actionHref: "/",
  },
};

export default function EmptyState({
  type,
  title,
  description,
  actionText,
  actionHref,
}: EmptyStateProps) {
  const config = defaultContent[type];
  const Icon = config.icon;

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="mb-2 text-lg font-semibold">
          {title || config.title}
        </h3>
        
        <p className="mb-6 text-muted-foreground">
          {description || config.description}
        </p>
        
        <Button asChild>
          <Link to={actionHref || config.actionHref}>
            {actionText || config.actionText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}