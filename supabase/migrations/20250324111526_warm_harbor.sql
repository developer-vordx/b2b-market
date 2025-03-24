/*
  # Add subscription system and demo products

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, references profiles)
      - `plan_type` (text: 'basic', 'premium')
      - `status` (text: 'active', 'cancelled')
      - `current_period_end` (timestamptz)
      - `stripe_subscription_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add `subscription_id` to products table
    - Add subscription check policy to products table

  3. Demo Data
    - Insert demo products with vendors
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES profiles(id),
  plan_type text NOT NULL CHECK (plan_type IN ('basic', 'premium')),
  status text NOT NULL CHECK (status IN ('active', 'cancelled')) DEFAULT 'active',
  current_period_end timestamptz NOT NULL,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Vendors can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = vendor_id);

-- Add subscription_id to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES subscriptions(id);

-- Update products policy to check for active subscription
CREATE POLICY "Only vendors with active subscription can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'vendor'
    ))
    AND
    (EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.vendor_id = auth.uid()
      AND subscriptions.status = 'active'
      AND subscriptions.current_period_end > now()
    ))
  );

-- Insert demo vendors with subscriptions
DO $$ 
DECLARE 
  vendor1_id uuid;
  vendor2_id uuid;
  sub1_id uuid;
  sub2_id uuid;
BEGIN
  -- Create demo vendors
  INSERT INTO auth.users (id, email) VALUES
    ('11111111-1111-1111-1111-111111111111', 'tech.vendor@example.com'),
    ('22222222-2222-2222-2222-222222222222', 'furniture.vendor@example.com')
  ON CONFLICT (id) DO NOTHING;

  -- Create vendor profiles
  INSERT INTO profiles (id, company_name, user_type, contact_email)
  VALUES
    ('11111111-1111-1111-1111-111111111111', 'Tech Solutions Inc', 'vendor', 'tech.vendor@example.com'),
    ('22222222-2222-2222-2222-222222222222', 'Modern Furniture Co', 'vendor', 'furniture.vendor@example.com')
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO vendor1_id;

  -- Create subscriptions for vendors
  INSERT INTO subscriptions (id, vendor_id, plan_type, current_period_end)
  VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'premium', now() + interval '1 year'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'basic', now() + interval '1 year')
  RETURNING id INTO sub1_id;

  -- Insert demo products for Tech Solutions Inc
  INSERT INTO products (vendor_id, name, description, price, stock_quantity, category, subscription_id)
  VALUES
    ('11111111-1111-1111-1111-111111111111', 'Professional Laptop', 'High-performance laptop for business use', 1299.99, 50, 'Electronics', sub1_id),
    ('11111111-1111-1111-1111-111111111111', 'Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 49.99, 200, 'Electronics', sub1_id),
    ('11111111-1111-1111-1111-111111111111', 'USB-C Dock', 'Universal docking station with multiple ports', 199.99, 75, 'Electronics', sub1_id),
    ('22222222-2222-2222-2222-222222222222', 'Executive Desk', 'Premium wooden desk with cable management', 599.99, 20, 'Furniture', sub2_id),
    ('22222222-2222-2222-2222-222222222222', 'Ergonomic Chair', 'Adjustable office chair with lumbar support', 299.99, 50, 'Furniture', sub2_id),
    ('22222222-2222-2222-2222-222222222222', 'Filing Cabinet', 'Metal filing cabinet with lock', 149.99, 30, 'Furniture', sub2_id);
END $$;