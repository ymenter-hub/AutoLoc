-- ============================================================
-- AUTO-LOC : Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────
-- 1. PROFILES TABLE (extends auth.users)
-- Stores role: 'client' | 'owner'
-- ─────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL CHECK (role IN ('client', 'owner')) DEFAULT 'client',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 2. TABLE B : VEHICLES
-- Owned by agency owners
-- ─────────────────────────────────────────
CREATE TABLE public.vehicles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand         TEXT NOT NULL,
  model         TEXT NOT NULL,
  year          INT NOT NULL,
  color         TEXT NOT NULL,
  plate_number  TEXT NOT NULL UNIQUE,
  daily_price   NUMERIC(10,2) NOT NULL,
  fuel_type     TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
  transmission  TEXT NOT NULL CHECK (transmission IN ('manual', 'automatic')),
  seats         INT NOT NULL DEFAULT 5,
  image_url     TEXT,
  description   TEXT,
  is_available  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 3. TABLE C : RESERVATIONS
-- Join table: client <-> vehicle
-- ─────────────────────────────────────────
CREATE TABLE public.reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id      UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  total_price     NUMERIC(10,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  license_url     TEXT,         -- Supabase Storage path for driver license photo
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- ─────────────────────────────────────────
-- 4. TRIGGER: Auto-reject competing reservations
-- When one reservation is confirmed → vehicle becomes unavailable
-- → all other pending reservations for same vehicle are rejected
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_reservation_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act when status changes TO 'confirmed'
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Mark the vehicle as unavailable
    UPDATE public.vehicles
    SET is_available = FALSE
    WHERE id = NEW.vehicle_id;

    -- Auto-reject all other pending reservations for this vehicle
    UPDATE public.reservations
    SET status = 'rejected', updated_at = NOW()
    WHERE vehicle_id = NEW.vehicle_id
      AND id != NEW.id
      AND status = 'pending';
  END IF;

  -- If a reservation is rejected/cancelled and the vehicle has no more confirmed reservation,
  -- make the vehicle available again
  IF NEW.status IN ('rejected', 'cancelled') AND OLD.status = 'confirmed' THEN
    UPDATE public.vehicles
    SET is_available = TRUE
    WHERE id = NEW.vehicle_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reservation_status_change
  AFTER UPDATE OF status ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION handle_reservation_confirmation();

-- ─────────────────────────────────────────
-- 5. TRIGGER: Auto-create profile on signup
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────
-- 6. UPDATED_AT auto-update trigger
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────
-- 7. ROW LEVEL SECURITY (RLS)
-- CRITICAL: Required for project evaluation
-- ─────────────────────────────────────────

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- VEHICLES: anyone authenticated can view available vehicles
CREATE POLICY "Authenticated users can view available vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (true);

-- VEHICLES: only owners can insert/update/delete their own vehicles
CREATE POLICY "Owners can insert their own vehicles"
  ON public.vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can update their own vehicles"
  ON public.vehicles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can delete their own vehicles"
  ON public.vehicles FOR DELETE
  TO authenticated
  USING (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RESERVATIONS: clients see only their own; owners see reservations on their vehicles
CREATE POLICY "Clients can view their own reservations"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR
    EXISTS (
      SELECT 1 FROM public.vehicles v
      WHERE v.id = vehicle_id AND v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create reservations"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Clients can cancel their own pending reservations"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (
    -- Client can cancel their own pending reservation
    (auth.uid() = client_id AND status = 'pending') OR
    -- Owner can confirm/reject reservations on their vehicles
    EXISTS (
      SELECT 1 FROM public.vehicles v
      WHERE v.id = vehicle_id AND v.owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 8. STORAGE BUCKET
-- Create in Supabase Dashboard > Storage
-- Bucket name: "licenses"
-- Make it PRIVATE (not public)
-- ─────────────────────────────────────────
-- Run this only if using SQL to create the bucket:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('licenses', 'licenses', false);

-- Storage RLS: clients can upload/view only their own license files
CREATE POLICY "Clients can upload their license"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'licenses' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own license"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'licenses' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM public.vehicles v
        JOIN public.reservations r ON r.vehicle_id = v.id
        WHERE v.owner_id = auth.uid()
          AND r.license_url LIKE '%' || name || '%'
      )
    )
  );
