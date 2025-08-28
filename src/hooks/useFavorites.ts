import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { track } from "@/lib/analytics";
import { toast } from "@/hooks/use-toast";

export function useFavorites() {
  const { session } = useSession();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      loadFavorites();
    } else {
      setFavorites(new Set());
    }
  }, [session?.user?.id]);

  const loadFavorites = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", session.user.id);

      if (error) throw error;

      const favoriteIds = new Set(data?.map(f => f.product_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Entre na sua conta",
        description: "Faça login para adicionar produtos aos favoritos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const isFavorited = favorites.has(productId);

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", session.user.id)
          .eq("product_id", productId);

        if (error) throw error;

        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });

        track("remove_from_wishlist", { product_id: productId });
        toast({
          title: "Removido dos favoritos",
          description: "Produto removido da sua lista de desejos",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: session.user.id,
            product_id: productId,
          });

        if (error) throw error;

        setFavorites(prev => new Set([...prev, productId]));

        track("add_to_wishlist", { product_id: productId });
        toast({
          title: "Adicionado aos favoritos",
          description: "Produto adicionado à sua lista de desejos",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar favoritos",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorited: (productId: string) => favorites.has(productId),
  };
}