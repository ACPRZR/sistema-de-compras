
-- Remove Incoterms and Currency
ALTER TABLE public.orders DROP COLUMN IF EXISTS incoterm;
ALTER TABLE public.orders DROP COLUMN IF EXISTS currency;

DROP TYPE IF EXISTS public.incoterm_enum;
DROP TYPE IF EXISTS public.currency_enum;

-- Create Units of Measure Table (Standardized)
CREATE TABLE public.units_of_measure (
    code text PRIMARY KEY, -- 'UND', 'KG', 'MTR'
    name text NOT NULL, -- 'Unidad', 'Kilogramo', 'Metro'
    is_active boolean DEFAULT true
);

-- Insert Basic Units
INSERT INTO public.units_of_measure (code, name) VALUES
('UND', 'Unidad'),
('CAJA', 'Caja'),
('KG', 'Kilogramo'),
('LT', 'Litro'),
('MTR', 'Metro'),
('GLN', 'Galón'),
('JGO', 'Juego Global')
ON CONFLICT (code) DO NOTHING;

-- Enable RLS for Units
ALTER TABLE public.units_of_measure ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON public.units_of_measure FOR SELECT USING (auth.role() = 'authenticated');
