-- Add WhatsApp tracking to applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMP WITH TIME ZONE;

-- Create site_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Policies for site_config
CREATE POLICY "Site config is viewable by everyone" 
ON public.site_config FOR SELECT USING (true);

CREATE POLICY "Site config is manageable by admins" 
ON public.site_config FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Insert default admissions status
INSERT INTO public.site_config (key, value) 
VALUES ('admissions_active', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
