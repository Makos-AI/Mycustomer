-- Extend existing bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_days TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS parent_booking_id UUID REFERENCES public.bookings(id),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS counter_fare NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS counter_note TEXT,
  ADD COLUMN IF NOT EXISTS counter_tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create booking_instances table for recurring rides
CREATE TABLE IF NOT EXISTS public.booking_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'accepted',
  canceled_by UUID REFERENCES public.profiles(id),
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.booking_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view instances" ON public.booking_instances FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id
          AND (rider_id = auth.uid() OR driver_id = auth.uid()))
);
CREATE POLICY "Participants can update instances" ON public.booking_instances FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id
          AND (rider_id = auth.uid() OR driver_id = auth.uid()))
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_instances;

-- Conflict detection function
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
  p_driver_id UUID,
  p_rider_id UUID,
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ
) RETURNS JSONB AS $$
DECLARE
  driver_conflict BOOLEAN;
  rider_conflict BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE driver_id = p_driver_id AND status = 'accepted'
      AND (start_time, end_time) OVERLAPS (p_start, p_end)
  ) INTO driver_conflict;

  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE rider_id = p_rider_id AND status = 'accepted'
      AND (start_time, end_time) OVERLAPS (p_start, p_end)
  ) INTO rider_conflict;

  RETURN jsonb_build_object(
    'driver_conflict', driver_conflict,
    'rider_conflict', rider_conflict
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Auto-expiry trigger function
CREATE OR REPLACE FUNCTION public.handle_booking_expiry()
RETURNS void AS $$
BEGIN
  UPDATE public.bookings
  SET status = 'canceled', cancellation_reason = 'expired'
  WHERE status = 'proposed'
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
