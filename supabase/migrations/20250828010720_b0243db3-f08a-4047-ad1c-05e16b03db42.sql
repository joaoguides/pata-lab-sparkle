-- Security Migration: Fix user_id constraints, RLS policies, and add checkout functionality

-- First, let's handle existing data by setting user_id to a default system user for any NULL values
-- You may need to update these manually for real data
UPDATE addresses SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
UPDATE carts SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
UPDATE orders SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;

-- Make user_id columns NOT NULL and add foreign keys
ALTER TABLE addresses 
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE carts 
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE orders 
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

-- Add status column to carts if it doesn't exist
ALTER TABLE carts ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add unique constraint for active carts (one active cart per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_user_active ON carts (user_id) WHERE status = 'active';

-- Add validation checks for order_items
ALTER TABLE order_items 
  ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0),
  ADD CONSTRAINT check_unit_price_non_negative CHECK (unit_price >= 0);

-- Create useful indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_carts_user ON carts (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);

-- Fix RLS policies - Drop existing conflicting policies first
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage own cart" ON carts;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Create comprehensive RLS policies
CREATE POLICY "Users can manage own addresses" 
ON addresses FOR ALL 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own carts" 
ON carts FOR ALL 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own orders" 
ON orders FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own order items" 
ON order_items FOR ALL 
USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())) 
WITH CHECK (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- Block direct access to coupons table
DROP POLICY IF EXISTS "Service role can manage coupons" ON coupons;
CREATE POLICY "Block direct coupon access" 
ON coupons FOR ALL 
USING (false) 
WITH CHECK (false);

-- Create secure coupon application function
CREATE OR REPLACE FUNCTION public.apply_coupon(p_code text, p_cart uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cart carts%ROWTYPE;
  v_coupon coupons%ROWTYPE;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_total numeric := 0;
BEGIN
  -- Validate cart belongs to current user and is active
  SELECT * INTO v_cart 
  FROM carts 
  WHERE id = p_cart AND user_id = auth.uid() AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cart not found or not accessible';
  END IF;

  -- Calculate subtotal from cart items
  SELECT COALESCE(SUM(price * quantity), 0) INTO v_subtotal
  FROM cart_items
  WHERE cart_id = p_cart;

  -- If coupon code provided, validate and apply it
  IF p_code IS NOT NULL AND p_code != '' THEN
    SELECT * INTO v_coupon
    FROM coupons
    WHERE code = p_code 
      AND active = true
      AND (starts_at IS NULL OR starts_at <= NOW())
      AND (ends_at IS NULL OR ends_at >= NOW())
      AND (usage_limit IS NULL OR usage_count < usage_limit)
      AND (minimum_amount IS NULL OR v_subtotal >= minimum_amount);
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid or expired coupon code';
    END IF;

    -- Calculate discount based on coupon type
    IF v_coupon.type = 'PERCENTAGE' THEN
      v_discount := v_subtotal * (v_coupon.value / 100);
    ELSIF v_coupon.type = 'FIXED' THEN
      v_discount := LEAST(v_coupon.value, v_subtotal);
    END IF;
  END IF;

  v_total := v_subtotal - v_discount;

  RETURN json_build_object(
    'subtotal', v_subtotal,
    'discount', v_discount,
    'total', v_total
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.apply_coupon(text, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_coupon(text, uuid) FROM anon;

-- Ensure all tables have RLS enabled
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;