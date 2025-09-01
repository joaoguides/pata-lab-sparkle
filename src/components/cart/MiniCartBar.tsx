import { useCart } from "@/context/CartContext";
import { useCartUI } from "@/components/cart/CartUIContext";
import Button from "@/components/ui/button";
import { ShoppingBag, CreditCard } from "lucide-react";
import { formatBRL } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function MiniCartBar() {
  const { items, itemCount } = useCart();
  const { open } = useCartUI();

  // Don't show if no items
  if (itemCount === 0) return null;

  // Calculate simple subtotal (client-side estimation)
  const subtotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm">
          <div className="font-medium">Subtotal: {formatBRL(subtotal)}</div>
          <div className="text-muted-foreground">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={open}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Ver carrinho
          </Button>
          
          <Button 
            size="sm"
            asChild
            className="flex items-center gap-2"
          >
            <Link to="/checkout">
              <CreditCard className="h-4 w-4" />
              Checkout
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}