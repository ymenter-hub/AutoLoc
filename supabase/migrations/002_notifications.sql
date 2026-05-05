-- ─────────────────────────────────────────
-- 9. NOTIFICATIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- If NULL, meant for "All Clients" (though we will insert per user for better tracking)
  message     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('info', 'deal', 'alert')),
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Owners can view notifications they sent
CREATE POLICY "Owners can view sent notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

-- Clients can view notifications sent to them
CREATE POLICY "Clients can view received notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = receiver_id);

-- Owners can send notifications
CREATE POLICY "Owners can send notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Clients can update notifications (mark as read)
CREATE POLICY "Clients can update received notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id);

-- Clients can delete received notifications (clear all)
CREATE POLICY "Clients can delete received notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = receiver_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
