
-- Fix search_path sur les fonctions
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Restreindre EXECUTE des fonctions SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Empêcher le listing du bucket public : remplacer la policy SELECT
DROP POLICY IF EXISTS "Public can view site-assets" ON storage.objects;

-- Note : les fichiers restent accessibles via URL publique directe (CDN),
-- mais on n'autorise pas un SELECT généralisé sur storage.objects.
-- Pour servir via getPublicUrl (CDN), aucune policy SELECT n'est requise.
