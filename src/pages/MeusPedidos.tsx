import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Order {
  id: string;
  number: number;
  status: string;
  total: number;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export default function MeusPedidos() {
  const { session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadOrders();
    }
  }, [session]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          number,
          status,
          total,
          created_at,
          order_items (
            id,
            product_name,
            variant_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq("user_id", session?.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
      PENDING: { label: "Pendente", variant: "outline" },
      CONFIRMED: { label: "Confirmado", variant: "secondary" },
      SHIPPED: { label: "Enviado", variant: "default" },
      DELIVERED: { label: "Entregue", variant: "default" },
      CANCELLED: { label: "Cancelado", variant: "destructive" },
    };

    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meus Pedidos</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Você ainda não fez nenhum pedido.</p>
              <a href="/" className="text-primary hover:underline">
                Comece suas compras agora
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      Pedido #{order.number}
                    </CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.variant_name} • Qtd: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          R$ {item.total_price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center font-semibold text-lg border-t pt-3">
                    <span>Total</span>
                    <span>R$ {order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}