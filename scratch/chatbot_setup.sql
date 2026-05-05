-- Run this in your Supabase SQL Editor
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10,2),
  category text,
  in_stock boolean default true,
  created_at timestamp with time zone default now()
);

-- Insert sample data
insert into products (name, description, price, category, in_stock) values
  ('Wireless Headphones', 'Noise-cancelling over-ear headphones with 30h battery', 89.99, 'Electronics', true),
  ('Mechanical Keyboard', 'TKL layout, Cherry MX switches, RGB backlight', 129.99, 'Electronics', true),
  ('Standing Desk', 'Electric height-adjustable, 140x70cm surface', 349.00, 'Furniture', false),
  ('Webcam 4K', 'Ultra HD webcam with autofocus and built-in mic', 74.99, 'Electronics', true),
  ('Ergonomic Chair', 'Lumbar support, armrests, breathable mesh', 299.00, 'Furniture', true);

alter table products enable row level security;
create policy "Allow read" on products for select using (true);
