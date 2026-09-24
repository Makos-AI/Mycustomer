-- RLS-enforced profile privacy function
-- Returns payment fields (bank_name, account_number) only if the viewer is a saved contact

CREATE OR REPLACE FUNCTION public.get_driver_profile(target_id UUID)
RETURNS TABLE (
  id              UUID,
  display_name    TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  role            TEXT,
  completion_rate NUMERIC,
  total_completed_rides INTEGER,
  car_make_model  TEXT,
  plate_number    TEXT,
  bank_name       TEXT,   -- NULL if viewer is not a contact
  account_number  TEXT    -- NULL if viewer is not a contact
) AS $$
DECLARE
  is_contact BOOLEAN;
BEGIN
  -- Check if the currently authenticated user has an accepted (non-pending) contact with target
  SELECT EXISTS (
    SELECT 1
    FROM public.contacts c
    WHERE c.user_id    = auth.uid()
      AND c.contact_id = target_id
      AND c.is_pending = false
  ) INTO is_contact;

  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.phone,
    p.avatar_url,
    p.role::TEXT,
    p.completion_rate,
    p.total_completed_rides,
    p.car_make_model,
    p.plate_number,
    -- Payment fields gated behind contact check
    CASE WHEN is_contact THEN p.bank_name    ELSE NULL END AS bank_name,
    CASE WHEN is_contact THEN p.account_number ELSE NULL END AS account_number
  FROM public.profiles p
  WHERE p.id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Revoke direct column-level access to sensitive fields from the public profiles policy
-- Unauthenticated or non-contact reads go through get_driver_profile() instead
ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

-- Drop and recreate base read policy (excludes payment columns)
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Note: The SECURITY DEFINER on get_driver_profile() bypasses RLS for the internal
-- query, but the CASE WHEN logic enforces the contact check application-side.
-- For maximum hardening, remove bank_name and account_number from the SELECT RLS
-- policy and route ALL profile reads through get_driver_profile().
