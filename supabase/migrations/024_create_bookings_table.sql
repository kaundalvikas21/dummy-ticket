create table bookings (
  id text primary key,
  user_id uuid references auth.users(id),
  plan_id uuid references service_plans(id) not null,
  amount numeric not null,
  currency text not null default 'USD',
  status text not null default 'pending', -- pending, paid, failed, cancelled
  stripe_session_id text,
  payment_intent_id text,
  payment_method text default 'Credit Card',
  passenger_details jsonb, -- Stores the full form data snapshot
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_bookings_user_id on bookings(user_id);
create index idx_bookings_stripe_session_id on bookings(stripe_session_id);
create index idx_bookings_status on bookings(status);
create index idx_bookings_created_at on bookings(created_at);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
alter table bookings enable row level security;

-- Users can view their own bookings
create policy "Users can view own bookings"
  on bookings for select
  using (auth.uid() = user_id);

-- Helper Function for RLS Policies (consistent, maintainable approach)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role from JWT claims or app_metadata
  RETURN (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- Admins can manage all bookings
create policy "Admins can manage all bookings"
  on bookings for all
  using (is_admin())
  with check (is_admin());

-- Anyone can create bookings (Guest checkout support)
create policy "Anyone can create bookings"
  on bookings for insert
  with check (true);

-- Only Service Role can update bookings (e.g. via Webhook) to prevent user manipulation
-- Implicitly allowed for service_role, blocked for anon/authenticated by default unless policy exists.

