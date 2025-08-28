import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckoutRequest {
  cart_id: string
  coupon_code?: string
}

interface CheckoutResponse {
  subtotal: number
  discount: number
  total: number
  order_id?: string
  payment_intent?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for server-side operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the authorization header to validate the user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Parse request body
    const { cart_id, coupon_code }: CheckoutRequest = await req.json()

    if (!cart_id) {
      throw new Error('cart_id is required')
    }

    console.log(`Processing checkout for cart: ${cart_id}`)

    // Verify cart exists and get user context using the auth header
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    // Get user from auth header
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    console.log(`Authenticated user: ${user.id}`)

    // Verify cart belongs to user and get cart items
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*, cart_items(*, variants(*, products(*)))')
      .eq('id', cart_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (cartError || !cart) {
      throw new Error('Cart not found or not accessible')
    }

    console.log(`Found cart with ${cart.cart_items?.length || 0} items`)

    // Calculate totals using the secure apply_coupon function
    const { data: totals, error: totalsError } = await supabase
      .rpc('apply_coupon', {
        p_code: coupon_code || null,
        p_cart: cart_id
      })

    if (totalsError) {
      throw new Error(`Error calculating totals: ${totalsError.message}`)
    }

    console.log(`Calculated totals:`, totals)

    // TODO: Create order and order items with "photographed" prices
    // This would involve:
    // 1. Creating a new order record
    // 2. Creating order_items with current prices from variants
    // 3. Reserving/reducing stock
    // 4. Creating payment intent with payment provider
    
    // For now, return the calculated totals
    const response: CheckoutResponse = {
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
      // These would be populated after implementing order creation
      order_id: undefined,
      payment_intent: undefined
    }

    console.log(`Checkout response:`, response)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Checkout error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})