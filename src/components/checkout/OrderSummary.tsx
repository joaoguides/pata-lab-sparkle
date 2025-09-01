import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatBRL } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

interface OrderSummaryProps {
  totals: {
    subtotal: number;
    discount: number;
    total: number;
  } | null;
  itemCount: number;
  className?: string;
}

export default function OrderSummary({ totals, itemCount, className }: OrderSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Resumo do Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
          <span>{totals ? formatBRL(totals.subtotal) : formatBRL(0)}</span>
        </div>

        {totals && totals.discount > 0 && (
          <>
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto</span>
              <span>-{formatBRL(totals.discount)}</span>
            </div>
          </>
        )}

        <Separator />

        <div 
          className="flex justify-between font-bold text-lg"
          role="status"
          aria-live="polite"
          aria-label={`Total do pedido: ${totals ? formatBRL(totals.total) : formatBRL(0)}`}
        >
          <span>Total</span>
          <span className="text-primary">
            {totals ? formatBRL(totals.total) : formatBRL(0)}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          * Frete será calculado no próximo passo
        </div>
      </CardContent>
    </Card>
  );
}