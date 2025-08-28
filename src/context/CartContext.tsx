import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { ensureActiveCart } from "@/lib/cart";

interface CartItem {
  id: string;
  variant_id: string;
  quantity: number;
  price: number;
  variants: {
    name: string;
    price: number;
    products: {
      name: string;
      images: any;
    };
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  refreshCart: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const refreshCart = async () => {
    if (!session?.user?.id) {
      setItems([]);
      return;
    }

    try {
      const cartId = await ensureActiveCart(session.user.id);
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          variant_id,
          quantity,
          price,
          variants (
            name,
            price,
            products (
              name,
              images
            )
          )
        `)
        .eq("cart_id", cartId);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error loading cart:", error);
      setItems([]);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);

    if (error) throw error;
    await refreshCart();
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
    await refreshCart();
  };

  const addItem = async (variantId: string, quantity: number) => {
    if (!session?.user?.id) return;

    const cartId = await ensureActiveCart(session.user.id);
    
    // Get variant price
    const { data: variant } = await supabase
      .from("variants")
      .select("price")
      .eq("id", variantId)
      .single();

    if (!variant) throw new Error("Variant not found");

    // Check if item already exists
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("variant_id", variantId)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      await updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      // Insert new item
      const { error } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cartId,
          variant_id: variantId,
          quantity,
          price: variant.price
        });

      if (error) throw error;
      await refreshCart();
    }

    setIsOpen(true);
  };

  useEffect(() => {
    if (session?.user?.id) {
      refreshCart();
    } else {
      setItems([]);
    }
  }, [session?.user?.id]);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      isOpen,
      setIsOpen,
      refreshCart,
      updateQuantity,
      removeItem,
      addItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}