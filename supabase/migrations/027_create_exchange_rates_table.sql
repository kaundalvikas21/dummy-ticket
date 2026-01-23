-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    rate DECIMAL(18, 10) NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(base_currency, target_currency)
);

-- Enable Row Level Security
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to exchange rates"
ON public.exchange_rates
FOR SELECT
TO public
USING (true);

-- Allow service role to manage exchange rates
CREATE POLICY "Allow service role to manage exchange rates"
ON public.exchange_rates
FOR ALL
USING (auth.role() = 'service_role');

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_target ON public.exchange_rates (base_currency, target_currency);
