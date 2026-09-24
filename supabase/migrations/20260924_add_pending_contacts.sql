-- Add is_pending column to contacts table
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS is_pending BOOLEAN NOT NULL DEFAULT false;

-- Index to efficiently query pending invites for a user
CREATE INDEX IF NOT EXISTS idx_contacts_pending
  ON public.contacts (user_id, is_pending)
  WHERE is_pending = true;
