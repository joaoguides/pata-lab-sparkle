-- paid_at no pedido
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- garantir valores do status do pedido
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
      WHERE t.typname='order_status' AND e.enumlabel='PAID'
    ) THEN
      ALTER TYPE public.order_status ADD VALUE 'PAID';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
      WHERE t.typname='order_status' AND e.enumlabel='CANCELLED'
    ) THEN
      ALTER TYPE public.order_status ADD VALUE 'CANCELLED';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
      WHERE t.typname='order_status' AND e.enumlabel='FAILED'
    ) THEN
      ALTER TYPE public.order_status ADD VALUE 'FAILED';
    END IF;
  END IF;
END$$;

-- pagamentos: adicionar coluna reference se não existir
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS reference TEXT;

-- pagamentos: índice por reference
CREATE INDEX IF NOT EXISTS payments_reference_idx ON public.payments(reference);

-- pagamentos: coluna payload pra guardar o body do provedor
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payload JSONB;

-- índice para performance nas consultas de pedidos por usuário
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON public.orders(user_id, created_at DESC);