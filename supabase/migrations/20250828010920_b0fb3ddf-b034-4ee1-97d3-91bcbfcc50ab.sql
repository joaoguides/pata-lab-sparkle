-- Fix security warning: set search_path for apply_coupon function
CREATE OR REPLACE FUNCTION public.apply_coupon(p_code text, p_cart uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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