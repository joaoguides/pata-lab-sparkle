-- Fix RLS policies for sensitive tables to prevent public access

-- Payments table: Users can only view payments for their own orders
CREATE POLICY "Users can view payments for own orders" 
ON public.payments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = payments.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Addresses table: Users can only view their own addresses  
CREATE POLICY "Users can view own addresses"
ON public.addresses
FOR SELECT
USING (auth.uid() = user_id);

-- Profiles table: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles  
FOR SELECT
USING (auth.uid() = id);

-- Orders table: Restrict SELECT to user's own orders (more specific than existing policy)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT  
USING (auth.uid() = user_id);

-- Shipping table: Users can only view shipping for their own orders
CREATE POLICY "Users can view shipping for own orders"
ON public.shipping
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = shipping.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Ensure all tables have RLS enabled (double check)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping ENABLE ROW LEVEL SECURITY;