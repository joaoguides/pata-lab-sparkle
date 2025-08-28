-- Constraints para evitar duplicatas e estoque negativo
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='uq_cart_item') THEN
    CREATE UNIQUE INDEX uq_cart_item ON public.cart_items(cart_id, variant_id);
  END IF;
END $$;

-- Verifica se constraint já existe antes de adicionar
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ck_variants_stock_nonneg' 
    AND table_name = 'variants'
  ) THEN
    ALTER TABLE public.variants ADD CONSTRAINT ck_variants_stock_nonneg CHECK (stock >= 0);
  END IF;
END $$;

-- Função transacional para criar pedido
CREATE OR REPLACE FUNCTION public.create_order(
  p_cart uuid,
  p_user uuid,
  p_address uuid,
  p_payment_method text,
  p_coupon text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cart record;
  v_item record;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_total numeric := 0;
  v_order_id uuid;
  v_totals jsonb;
BEGIN
  -- Confere carrinho do usuário
  SELECT * INTO v_cart FROM public.carts
    WHERE id = p_cart AND user_id = p_user AND status = 'active'
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cart not found or not active';
  END IF;

  -- Recalcula subtotal com preços atuais das variants (e trava estoque)
  FOR v_item IN
    SELECT ci.variant_id, ci.quantity, v.price
    FROM public.cart_items ci
    JOIN public.variants v ON v.id = ci.variant_id
    WHERE ci.cart_id = p_cart
    FOR UPDATE OF v
  LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;
    -- Verifica estoque
    IF (SELECT stock FROM public.variants WHERE id = v_item.variant_id) < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for variant %', v_item.variant_id;
    END IF;
    v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
  END LOOP;

  -- Aplica cupom seguro (se existir)
  IF p_coupon IS NOT NULL THEN
    v_totals := public.apply_coupon(p_coupon, p_cart);
    v_discount := COALESCE((v_totals->>'discount')::numeric, 0);
  END IF;
  v_total := GREATEST(v_subtotal - v_discount, 0);

  -- Cria o pedido
  INSERT INTO public.orders (user_id, subtotal, discount, total, status, notes)
    VALUES (p_user, v_subtotal, v_discount, v_total, 'PENDING', 'Payment method: ' || p_payment_method)
    RETURNING id INTO v_order_id;

  -- Itens do pedido (fotografar preço)
  INSERT INTO public.order_items (order_id, variant_id, quantity, unit_price, total_price, product_name, variant_name)
  SELECT v_order_id, ci.variant_id, ci.quantity, v.price, v.price * ci.quantity, p.name, v.name
  FROM public.cart_items ci
  JOIN public.variants v ON v.id = ci.variant_id
  JOIN public.products p ON p.id = v.product_id
  WHERE ci.cart_id = p_cart;

  -- Baixa estoque
  UPDATE public.variants v
  SET stock = v.stock - ci.quantity
  FROM public.cart_items ci
  WHERE ci.cart_id = p_cart AND ci.variant_id = v.id;

  -- Fecha carrinho
  UPDATE public.carts SET status = 'closed' WHERE id = p_cart;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'total', v_total
  );
END $$;

-- Índice otimizado
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- Permissões de segurança
REVOKE ALL ON FUNCTION public.create_order(uuid, uuid, uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_order(uuid, uuid, uuid, text, text) TO authenticated;