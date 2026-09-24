-- MyCustomer Initial Schema Migration
-- Enables extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USER ROLE ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('rider', 'driver', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- BOOKING STATUS ENUM
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'proposed',
        'countered',
        'accepted',
        'in_progress',
        'completed',
        'canceled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- MESSAGE TYPE ENUM
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'booking', 'milestone', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES (Extends Supabase auth.users or standalone decentralized profile)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'rider',
    completion_rate NUMERIC(5, 2) DEFAULT 100.00,
    total_completed_rides INTEGER DEFAULT 0,
    total_scheduled_rides INTEGER DEFAULT 0,
    whatsapp_live_location_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CONTACTS (Social ledger between riders & drivers)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nickname TEXT,
    is_favorite BOOLEAN DEFAULT false,
    added_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, contact_id)
);

-- 3. CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CONVERSATION MEMBERS
CREATE TABLE IF NOT EXISTS public.conversation_members (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (conversation_id, user_id)
);

-- 5. BOOKINGS (Flexible pickup windows + contextual pricing)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    pickup_address TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    dropoff_address TEXT NOT NULL,
    dropoff_lat DOUBLE PRECISION,
    dropoff_lng DOUBLE PRECISION,
    pickup_window_start TIMESTAMPTZ NOT NULL,
    pickup_window_end TIMESTAMPTZ NOT NULL,
    distance_km NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    baseline_fare NUMERIC(10, 2) NOT NULL,
    agreed_fare NUMERIC(10, 2),
    modifiers JSONB DEFAULT '{}'::jsonb, -- e.g. {"ac_on": true, "extra_luggage": false}
    status booking_status NOT NULL DEFAULT 'proposed',
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. FARE NEGOTIATIONS (One-tap contextual counter-offers)
CREATE TABLE IF NOT EXISTS public.fare_negotiations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    proposer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    proposed_fare NUMERIC(10, 2) NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- e.g. ['Severe Traffic', 'Flooded Route', 'Agbero/Community Tolls']
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    type message_type NOT NULL DEFAULT 'text',
    metadata JSONB DEFAULT '{}'::jsonb, -- booking_id, milestone stats, or live location
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. RELATIONAL MILESTONES & STATS
CREATE TABLE IF NOT EXISTS public.rider_driver_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_trips INTEGER DEFAULT 0,
    total_distance_km NUMERIC(10, 2) DEFAULT 0.0,
    total_spent NUMERIC(12, 2) DEFAULT 0.0,
    first_trip_at TIMESTAMPTZ,
    last_trip_at TIMESTAMPTZ,
    last_celebrated_milestone INTEGER DEFAULT 0,
    UNIQUE(rider_id, driver_id)
);

-- 9. PUSH SUBSCRIPTIONS (Web Push VAPID)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- FUNCTION: Update driver completion rate dynamically upon ride status transition
CREATE OR REPLACE FUNCTION public.handle_ride_completion_update()
RETURNS TRIGGER AS $$
DECLARE
    v_completed INTEGER;
    v_total_scheduled INTEGER;
    v_rate NUMERIC(5, 2);
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) AND (NEW.status IN ('completed', 'canceled')) THEN
        -- Calculate total scheduled rides (accepted, completed, or canceled after acceptance)
        SELECT 
            COUNT(*) FILTER (WHERE status = 'completed'),
            COUNT(*) FILTER (WHERE status IN ('completed') OR (status = 'canceled' AND agreed_fare IS NOT NULL))
        INTO v_completed, v_total_scheduled
        FROM public.bookings
        WHERE driver_id = NEW.driver_id;

        IF v_total_scheduled > 0 THEN
            v_rate := ROUND((v_completed::numeric / v_total_scheduled::numeric) * 100, 2);
        ELSE
            v_rate := 100.00;
        END IF;

        UPDATE public.profiles
        SET 
            completion_rate = v_rate,
            total_completed_rides = v_completed,
            total_scheduled_rides = v_total_scheduled,
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.driver_id;
    END IF;

    -- Update relational milestones if completed
    IF (OLD.status IS DISTINCT FROM NEW.status) AND (NEW.status = 'completed') THEN
        INSERT INTO public.rider_driver_stats (rider_id, driver_id, total_trips, total_distance_km, total_spent, first_trip_at, last_trip_at)
        VALUES (
            NEW.rider_id, 
            NEW.driver_id, 
            1, 
            COALESCE(NEW.distance_km, 0), 
            COALESCE(NEW.agreed_fare, NEW.baseline_fare), 
            now(), 
            now()
        )
        ON CONFLICT (rider_id, driver_id) DO UPDATE SET
            total_trips = public.rider_driver_stats.total_trips + 1,
            total_distance_km = public.rider_driver_stats.total_distance_km + COALESCE(NEW.distance_km, 0),
            total_spent = public.rider_driver_stats.total_spent + COALESCE(NEW.agreed_fare, NEW.baseline_fare),
            last_trip_at = now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_ride_status_change ON public.bookings;
CREATE TRIGGER trg_ride_status_change
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.handle_ride_completion_update();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fare_negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_driver_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read profiles (to view driver ledger & rider info), users can update their own
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Contacts: Users manage their own contacts
CREATE POLICY "Users can view their contacts" ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete contacts" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

-- Conversations & Members
CREATE POLICY "Members can view conversations" ON public.conversation_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Members can access messages" ON public.chat_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = chat_messages.conversation_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Members can post messages" ON public.chat_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = chat_messages.conversation_id AND user_id = auth.uid()
    )
);

-- Bookings: Either rider or driver can view/update
CREATE POLICY "Participants can view bookings" ON public.bookings FOR SELECT USING (
    auth.uid() = rider_id OR auth.uid() = driver_id
);
CREATE POLICY "Riders can create bookings" ON public.bookings FOR INSERT WITH CHECK (
    auth.uid() = rider_id
);
CREATE POLICY "Participants can update bookings" ON public.bookings FOR UPDATE USING (
    auth.uid() = rider_id OR auth.uid() = driver_id
);

-- Fare Negotiations
CREATE POLICY "Participants can view negotiations" ON public.fare_negotiations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.bookings 
        WHERE bookings.id = fare_negotiations.booking_id 
        AND (bookings.rider_id = auth.uid() OR bookings.driver_id = auth.uid())
    )
);
CREATE POLICY "Participants can propose counter offers" ON public.fare_negotiations FOR INSERT WITH CHECK (
    auth.uid() = proposer_id
);

-- Relational Milestones
CREATE POLICY "Participants can view stats" ON public.rider_driver_stats FOR SELECT USING (
    auth.uid() = rider_id OR auth.uid() = driver_id
);

-- Enable Realtime for chat messages and bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fare_negotiations;
