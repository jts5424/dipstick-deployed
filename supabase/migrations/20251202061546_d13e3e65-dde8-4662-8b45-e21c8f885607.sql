-- Create portfolios table for storing vehicle analysis data
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vehicle identification
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  trim TEXT,
  engine TEXT,
  vin TEXT,
  
  -- Analysis data (stored as JSONB for flexibility)
  service_history JSONB,
  routine_maintenance JSONB,
  unscheduled_maintenance JSONB,
  service_history_analysis JSONB,
  gap_analysis JSONB,
  risk_evaluation JSONB,
  market_valuation JSONB,
  total_cost_of_ownership JSONB
);

-- Enable Row Level Security
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (no authentication required for MVP)
CREATE POLICY "Allow all access to portfolios"
  ON public.portfolios
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for common queries
CREATE INDEX idx_portfolios_vehicle ON public.portfolios(make, model, year);
CREATE INDEX idx_portfolios_created_at ON public.portfolios(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();