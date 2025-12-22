
-- DISABLE RLS momentarily to confirm if it is indeed RLS blocking
-- Or apply a very broad policy

ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;

-- Alternatively, keep enabled but add a public policy (better for debugging)
-- ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Public access" ON public.suppliers;
-- CREATE POLICY "Public access" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
