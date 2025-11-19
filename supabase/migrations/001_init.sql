-- Enable uuid generation
create extension if not exists "pgcrypto";

-- USERS: primary application users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text,                     -- nullable if using OAuth/external auth
  username text,
  role text not null default 'user',      -- 'user', 'merchant', 'admin' (app-level role)
  email_verified boolean not null default false,
  metadata jsonb default '{}'::jsonb,     -- arbitrary profile fields
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on users (lower(email));
create index if not exists idx_users_created_at on users (created_at);

-- ADDRESSES: optional user shipping addresses
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label text,
  full_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  is_default boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user_id on addresses (user_id);

-- PRODUCTS: catalog
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text unique,
  description text,
  price numeric(12,2) not null default 0.00,
  currency text not null default 'USD',
  stock integer default 0,
  is_active boolean not null default true,
  category text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_slug on products (slug);
create index if not exists idx_products_name on products (name);
create index if not exists idx_products_created_at on products (created_at);

-- PRODUCT_IMAGES: multiple images per product
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text,
  position integer default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_images_product_id on product_images (product_id);

-- ORDERS
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  status text not null default 'pending',
  shipping_address jsonb,
  billing_address jsonb,
  payment_info jsonb,
  total numeric(12,2) not null default 0.00,
  currency text not null default 'USD',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_user_id on orders (user_id);
create index if not exists idx_orders_status on orders (status);
create index if not exists idx_orders_created_at on orders (created_at);

-- ORDER_ITEMS: line items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text,
  sku text,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0.00,
  total_price numeric(12,2) generated always as (unit_price * quantity) stored,
  metadata jsonb default '{}'::jsonb
);
create index if not exists idx_order_items_order_id on order_items (order_id);

-- ADMINS: separate admin accounts
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  reset_password_token text,
  reset_password_expires timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_admins_email on admins (lower(email));

-- ADMIN_LOGS: audit trail for admin actions
create table if not exists admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references admins(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb default '{}'::jsonb,
  ip text,
  created_at timestamptz not null default now()
);
create index if not exists idx_admin_logs_admin_id on admin_logs (admin_id);
create index if not exists idx_admin_logs_created_at on admin_logs (created_at);

-- Summary view
create or replace view admin_summary as
select
  (select count(*) from users) as total_users,
  (select count(*) from products where is_active) as active_products,
  (select count(*) from orders) as total_orders,
  (select coalesce(sum(total),0) from orders) as total_revenue;

-- Optional triggers to keep updated_at current can be added later
