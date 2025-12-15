-- Create the service_plans table
create table if not exists public.service_plans (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    price numeric not null,
    description text,
    image text,
    icon text,
    features text[] default '{}'::text[],
    active boolean default true,
    featured boolean default false,
    popular_label text,
    display_order integer default 0,
    total_sales integer default 0
);

-- Enable RLS
alter table public.service_plans enable row level security;

-- Drop existing policies to ensure clean state if re-run
drop policy if exists "Enable read access for all users" on public.service_plans;
drop policy if exists "Enable insert for admins only" on public.service_plans;
drop policy if exists "Enable update for admins only" on public.service_plans;
drop policy if exists "Enable delete for admins only" on public.service_plans;

-- Create policies for service_plans
create policy "Enable read access for all users"
    on public.service_plans for select
    using (true);

create policy "Enable insert for admins only"
    on public.service_plans for insert
    with check (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

create policy "Enable update for admins only"
    on public.service_plans for update
    using (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

create policy "Enable delete for admins only"
    on public.service_plans for delete
    using (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Scoped Policies for 'assets' bucket (service_plans folder only)

-- Drop specific policies if they exist (to allow re-runs)
drop policy if exists "Public View Service Plans Assets" on storage.objects;
drop policy if exists "Admin Insert Service Plans Assets" on storage.objects;
drop policy if exists "Admin Update Service Plans Assets" on storage.objects;
drop policy if exists "Admin Delete Service Plans Assets" on storage.objects;

-- 1. VIEW: Public can view images in service_plans folder
create policy "Public View Service Plans Assets"
    on storage.objects for select
    using ( bucket_id = 'assets' AND name LIKE 'service_plans/%' );

-- 2. INSERT: Admins can upload to service_plans folder
create policy "Admin Insert Service Plans Assets"
    on storage.objects for insert
    with check (
        bucket_id = 'assets' AND 
        name LIKE 'service_plans/%' AND (
            auth.jwt() ->> 'role' = 'admin' OR
            auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
        )
    );

-- 3. UPDATE: Admins can update in service_plans folder
create policy "Admin Update Service Plans Assets"
    on storage.objects for update
    using (
        bucket_id = 'assets' AND 
        name LIKE 'service_plans/%' AND (
            auth.jwt() ->> 'role' = 'admin' OR
            auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
        )
    );

-- 4. DELETE: Admins can delete in service_plans folder
create policy "Admin Delete Service Plans Assets"
    on storage.objects for delete
    using (
        bucket_id = 'assets' AND 
        name LIKE 'service_plans/%' AND (
            auth.jwt() ->> 'role' = 'admin' OR
            auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
        )
    );
