-- RLS & Policies template for Rakotee tables
-- Enable RLS where appropriate and add example policies.

-- Enable RLS on users so client anon key can't read all users by default
alter table users enable row level security;

-- Allow authenticated users to read/update their own user row (map auth.uid() to users.id via sub or by storing auth id in metadata)
-- Example assumes you store the supabase auth uid in metadata->>'auth_id'
create policy "users_select_own" on users
  for select using ((metadata->>'auth_id') = auth.uid());
create policy "users_update_own" on users
  for update using ((metadata->>'auth_id') = auth.uid());

-- Admins: keep RLS off for admins table (server-side only), or restrict to service role
-- If you keep admins table, avoid connecting it directly to client-side anon key.

-- Orders: authenticated users can access their own orders
alter table orders enable row level security;
create policy "orders_select_own" on orders
  for select using ((user_id::text) = auth.uid());
create policy "orders_insert_authenticated" on orders
  for insert with check ((user_id::text) = auth.uid());

-- Example: if you use 'users' table and Supabase auth, ensure auth.uid() equals users.id or store mapping in metadata.

-- Make sure to test policies in the Supabase SQL editor and adjust according to your auth mapping.
