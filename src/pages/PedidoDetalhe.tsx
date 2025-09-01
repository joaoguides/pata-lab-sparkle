import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";
import { CheckCircle, Package, MapPin, CreditCard } from "lucide-react";

interface Order {
  id: string;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  created_at: string;
  notes: string;
}

export default function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isNewOrder = searchParams.get('status') === 'created';

  useEffect(() => {
    if (id && session?.user?.id) {
      loadOrder();
    }
  }, [id, session?.user?.id]);

  const loadOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', session!.user.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando pedido...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Pedido não encontrado</h1>
            <p className="text-muted-foreground">
              O pedido solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendente', variant: 'secondary' as const },
      PAID: { label: 'Pago', variant: 'default' as const },
      SHIPPED: { label: 'Enviado', variant: 'default' as const },
      DELIVERED: { label: 'Entregue', variant: 'default' as const },
      CANCELLED: { label: 'Cancelado', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pedido #{order.id.slice(0, 8)} - Pata Lab</title>
        <meta name="description" content="Detalhes do seu pedido na Pata Lab" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success banner for new orders */}
          {isNewOrder && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                <span className="font-medium">Pedido criado com sucesso! 💚</span>
                <span>Agora é só aguardar a confirmação do pagamento.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Celebration for paid orders */}
          {order.status === 'PAID' && (
            <Alert className="mb-6 border-primary bg-primary/10 text-primary animate-fade-in">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                <span className="font-medium">Pagamento aprovado! 🎉</span>
                <span>Seu pedido está sendo preparado para envio.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Order header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
              <p className="text-muted-foreground">
                Criado em {new Date(order.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Itens do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando itens do pedido...
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Informações do endereço...
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CreditCard className="h-4 w-4" />
                      Método de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {order.notes?.includes('PIX') ? 'PIX' : 'Cartão de Crédito'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatBRL(order.subtotal)}</span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto</span>
                      <span>-{formatBRL(order.discount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatBRL(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}