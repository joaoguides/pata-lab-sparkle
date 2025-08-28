import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with anon key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const user = userData.user;

    // Parse request body
    const { address_id, payment_method, coupon_code } = await req.json();

    if (!address_id || !payment_method) {
      throw new Error('Missing required fields: address_id and payment_method');
    }

    // Get active cart for user
    const { data: cart, error: cartError } = await supabaseClient
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (cartError) {
      console.error('Cart error:', cartError);
      throw new Error('Failed to get cart');
    }

    if (!cart) {
      throw new Error('No active cart found');
    }

    // Call the create_order function
    const { data: orderResult, error: orderError } = await supabaseClient
      .rpc('create_order', {
        p_cart: cart.id,
        p_user: user.id,
        p_address: address_id,
        p_payment_method: payment_method,
        p_coupon: coupon_code || null
      });

    if (orderError) {
      console.error('Order creation error:', orderError);
      
      // Handle specific errors with friendly messages
      if (orderError.message.includes('Insufficient stock')) {
        throw new Error('Alguns produtos não possuem estoque suficiente');
      } else if (orderError.message.includes('Cart not found')) {
        throw new Error('Carrinho não encontrado ou inativo');
      } else if (orderError.message.includes('Invalid quantity')) {
        throw new Error('Quantidade inválida no carrinho');
      }
      
      throw new Error(orderError.message);
    }

    // Create payment stub
    const paymentReference = crypto.randomUUID();
    
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        order_id: orderResult.order_id,
        status: 'initiated',
        provider: 'stub',
        method: payment_method,
        amount: orderResult.total,
        external_id: paymentReference
      });

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      throw new Error('Failed to create payment record');
    }

    return new Response(JSON.stringify({
      order_id: orderResult.order_id,
      subtotal: orderResult.subtotal,
      discount: orderResult.discount,
      total: orderResult.total,
      payment: {
        provider: 'stub',
        status: 'initiated',
        reference: paymentReference
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in place-order function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});