import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ShoppingCart } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { runCheckout } from "@/lib/checkout";
import { toast } from "@/hooks/use-toast";

export default function CartDrawer() {
  const { session } = useSession();
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, refreshCart } = useCart();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState("");
  const [totals, setTotals] = useState<{ subtotal: number; discount: number; total: number } | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const applyCoupon = async () => {
    if (!session?.user?.id) return;
    
    setLoadingCoupon(true);
    try {
      const { data: carts } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .maybeSingle();
      
      if (carts?.id) {
        const result = await runCheckout(carts.id, couponCode || undefined);
        setTotals(result);
        toast({
          title: "Cupom aplicado!",
          description: `Desconto de R$ ${result.discount.toFixed(2)}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao aplicar cupom",
        description: error.message || "Cupom inválido",
        variant: "destructive",
      });
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
      // Reset totals when cart changes
      setTotals(null);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
      // Reset totals when cart changes
      setTotals(null);
    } catch (error: any) {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Meu Carrinho ({items.length} {items.length === 1 ? 'item' : 'itens'})
          </DrawerTitle>
          <DrawerDescription>
            {!session ? "Entre para ver seu carrinho" : "Revise seus itens antes de finalizar"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          {!session ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Entre para ver seu carrinho</h3>
              <p className="text-muted-foreground">Faça login ou crie uma conta para salvar seus itens</p>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link to="/entrar" onClick={() => setIsOpen(false)}>Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/criar-conta" onClick={() => setIsOpen(false)}>Criar conta</Link>
                </Button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Seu carrinho está vazio</h3>
              <p className="text-muted-foreground">Adicione produtos para começar suas compras</p>
              <Button onClick={() => setIsOpen(false)}>Continuar comprando</Button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Cart Items */}
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img
                    src={Array.isArray(item.variants?.products?.images) ? item.variants.products.images[0] : "/placeholder.svg"}
                    alt={item.variants?.products?.name || "Produto"}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {item.variants?.products?.name || "Produto"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.variants?.name || "Variação"}
                    </p>
                    <p className="text-sm font-medium">
                      R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Coupon Section */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold">Cupom de desconto</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite seu cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button 
                    onClick={applyCoupon}
                    disabled={!couponCode.trim() || loadingCoupon}
                    variant="outline"
                  >
                    {loadingCoupon ? "..." : "Aplicar"}
                  </Button>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {(totals?.subtotal || subtotal).toFixed(2)}</span>
                </div>
                {totals && totals.discount > 0 && (
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Desconto:</span>
                    <span>- R$ {totals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {(totals?.total || subtotal).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Footer */}
        {session && items.length > 0 && (
          <div className="border-t p-4">
            <Button 
              onClick={handleCheckout}
              className="w-full"
              size="lg"
            >
              Ir para o Checkout
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}