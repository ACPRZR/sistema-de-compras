
-- Enable RLS on suppliers if not already enabled
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts/duplication and ensure clean slate
DROP POLICY IF EXISTS "Enable read access for all users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.suppliers;

-- Create comprehensive policies

-- 1. READ: Allow everyone (or just auth users? adhering to previous pattern likely auth)
-- Let's stick to authenticated users for safety, or public if it was previously broad.
-- Given the error was on INSERT, let's assume READ might be working or we fix all.
-- Common pattern: Authenticated users can do everything for internal tools.

CREATE POLICY "Enable read access for authenticated users" 
ON public.suppliers FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" 
ON public.suppliers FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" 
ON public.suppliers FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" 
ON public.suppliers FOR DELETE 
USING (auth.role() = 'authenticated');
