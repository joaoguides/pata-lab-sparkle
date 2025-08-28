import { supabase } from "@/integrations/supabase/client";

export async function runCheckout(cartId: string, coupon?: string) {
  const { data, error } = await supabase.functions.invoke("checkout", {
    body: { cart_id: cartId, coupon_code: coupon ?? null },
  });
  if (error) throw new Error(error.message || "Checkout failed");
  return data as { subtotal: number; discount: number; total: number };
}