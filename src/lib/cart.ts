import { supabase } from "@/integrations/supabase/client";

export async function ensureActiveCart(userId: string) {
  const { data: found } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (found?.id) return found.id;

  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: userId, status: "active" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}